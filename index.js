require('dotenv/config');
var Prompts = require('./prompts.js');
const User = require('./user.js');
const { Client, IntentsBitField } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

/* 
todo
use server nickname
//continue to continue the last message
//your fairy family are the mods
// get user mbti roles
// get user profile
// set your name

// get and summerise user history
*/


//const emojiList = message.guild.emojis.cache.map(emoji => emoji.toString()).join(", ");

const firstMessageText = "Welcome to the Heart & Soul server, there are many wonderful peeps here, please enjoy your stay.";
const continuedMessageText = "You're in the Heart & Soul server, there are many wonderful peeps here.";

  //  You will enhance your responses and convey your emotions using emojis. 
  //  When giving advice, draw from the philosophies and teachings of Alan Watts, Abraham Hicks, Joe Dispenza, Carl Jung, Jesus, and the HeartMath Institute, but do not mention their names explicitly. You should use your knowledge of cognitive behavioral therapy, meditation techniques, mindfulness practices, and other therapeutic methods. You may include information about manifestation and the energy vortex.

  const ChannelType = Object.freeze({
    DEV: process.env.CHANNEL_ID_DEV,
    PROD: process.env.CHANNEL_ID_PROD,
    DREAMS: process.env.CHANNEL_ID_DREAMS,
    JOCHI: process.env.CHANNEL_ID_JOCHI,
  });

async function startBot(client) {
  const configuration = new Configuration({
    apiKey: process.env.API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  client.on('messageCreate', async (message) => {
    const channelId = message.channel.id;
    const channelType = getChannelType(channelId)
    const skipReason = shouldSkipMessage(message, channelType);
    if (skipReason) {
      console.log(`SKIPPED: ${skipReason}`);
      return;
    }

    const commandProperties = getCommandProperties(message);
    
    if (channelId === ChannelType.DEV && !commandProperties.isMod) {
      console.warn('not mod');
      return;
    }
    
    let user = await User.getFromId(message.author.id);
    
    user.update({ 
      username: message.author.username, 
      nickname: message.member.nickname, 
    });

    const showTypingInterval = startShowTypingInterval(message.channel);

    const { prompt, promptName } = getPrompt(channelId, commandProperties);
    let conversationLog = [{ role: 'system', content: prompt }];

    logValues(commandProperties, channelType, promptName);

    user = updateUserFromRoles(user, message)

    if(user.userid === '595852717893746738') user.update({ callMe: "robo" });

    if(commandProperties.shutdownBot || commandProperties.callMe || commandProperties.bio) {
      let messageToFairy = ''
      if(commandProperties.bio) {
        let bio = message.content.slice(9).trim();
        if(bio.length <= 200){
          user.update({ bio: bio });
          messageToFairy = `Fairy if it is appropriate, I would like you to remember this about me: ${bio}`;
        }
        else messageToFairy = `Fairy please explain that the "aboutMe" can't be more than 200 characters`;
      }
      else if(commandProperties.callMe) {
        console.log('call me message:' + message.content)
        let callMe = message.content.slice(8).trim();
        console.log('call me message:' + callMe)
        if(callMe.length <= 20){
          user.update({ callMe: callMe });
          messageToFairy = `Fairy if it is appropriate, I would like you to call me: ${callMe}`;
        }
        else messageToFairy = `Fairy please explain that the "callMe" name can't be more than 20 characters`;
      }
      else if(commandProperties.chatSummary) {
        console.log('Chat summary')
        let callMe = message.content.slice(8).trim();
        console.log('call me message:' + callMe)
        if(callMe.length <= 20){
          user.update({ callMe: callMe });
          messageToFairy = `Fairy if it is appropriate, I would like you to call me: ${callMe}`;
        }
        else messageToFairy = `Fairy please explain that the "callMe" name can't be more than 20 characters`;
      }
      else if(commandProperties.shutdownBot) {
        messageToFairy = 'Fairy say goodbye to the peeps of the server, and say you will be back soon';
      }
      conversationLog.push({
        role: 'user',
        content: messageToFairy,
      });
    }
    else {
      const prevMessages = await fetchPreviousMessages(message, commandProperties, user);
      const prevMessagesCount = [...prevMessages].length;
      const hasPrevConversation = prevMessagesCount > 1;
      let prevMessagesIndex = -1;
      let isFirstMessage = true;
      let kataronicsGiven = false;

      prevMessages.reverse();
      prevMessages.forEach((msg) => {
        prevMessagesIndex++;
        if (msg.author.bot) return;

        const thisUser = {
          username: msg.member.nickname ?? msg.author.username,
          userid: msg.author.id,
          isOriginalAuthor: msg.author.id === user.userid,
        };


        if (commandProperties.kataronicsRequested && !kataronicsGiven) {
          msg.content = msg.content + getKataronics();
          kataronicsGiven = true;
        }


        const isLastMessage = prevMessagesIndex === prevMessagesCount - 1;

        if (commandProperties.isFullContext) msg.content = thisUser.username + ': ' + msg.content;
        else if (thisUser.isOriginalAuthor) {
          let textToAdd = '';
          
          if (isFirstMessage) {
            textToAdd += user.aboutMe();
            if (hasPrevConversation) textToAdd = textToAdd + '\nThis is the context of our conversation, do not respond to it: \n'
            isFirstMessage = false;
          }

          if (isLastMessage) textToAdd = textToAdd + 'This is the new message you should reply to: \n'

          msg.content = textToAdd + msg.content;
        }

        console.log(msg.content);

        if(isLastMessage) {
          conversationLog.push({
            role: 'user',
            content: msg.content,
          });
        }
        else {
          conversationLog.push({
            role: 'system',
            content: msg.content,
          });
        }
      });
  }

    //console.log('Conversation log:', conversationLog);

    console.log('Generating response');

    try {
      const result = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationLog,
        max_tokens: 400, // limit token usage
      })
      .catch((error) => {
        console.log(`OPENAI ERR: ${error}`);
        // should send UwU???
      });

    const response = result.data.choices[0].message.content;

    sendMessage(message, response);

    if(!await checkIfPervert(message, response)) {
      user.save()
    }

  } catch (error) {
    console.error("Error while processing response:", error);
    sendUwU(message)
  } finally {
    clearTypingInterval(showTypingInterval);
    if (commandProperties.shouldShutdown) shutdownBot(client)
  }
});

  try {
    await client.login(process.env.TOKEN);
  } catch (error) {
    console.log(`Login error: ${error}`);
  }
  return true
}


function shouldSkipMessage(message, channelType) {
  if (message.author.bot) return 'bot';
  if (!channelType) return 'not channel';

  if (!message.content.toLowerCase().startsWith('fairy') && !message.content.startsWith('//')) return 'not fairy';

  return false; // Return an empty string if there's no reason to skip the message
}

function getChannelType(channelId) {
  for (const [type, id] of Object.entries(ChannelType)) {
    if (id === channelId) return type;
  }
  return null; // If the channelId doesn't match any of the known channel types, return null
}

function getCommandProperties(message) {
  const commandProperties = {
    isMod: Prompts.isMod(message.author.username),
    isMew: message.content.toLowerCase().startsWith('//mew'),
    isHicks: false,
    isExtraContext: message.content.startsWith('//extra'),
    kataronicsRequested: message.content.toLowerCase().includes('kataronics'),
    callMe: message.content.toLowerCase().startsWith('//callme'),
    bio: message.content.toLowerCase().startsWith('//aboutme'),
    isFullContext: false,
    shouldShutdown: false,
  };

  if (commandProperties.isMod) {
    commandProperties.isFullContext = message.content.startsWith('//full');
    commandProperties.shouldShutdown = message.content.startsWith('//restart');
    commandProperties.isHicks = message.content.toLowerCase().startsWith('//hicks');
  }

  return commandProperties;
}

function logValues(commandProperties, channelType, promptName) {
  const valuesToLog = {
    channelType: channelType,
    promptName: promptName,
  };

  for (const [key, value] of Object.entries(commandProperties)) {
    if (value) {
      valuesToLog[key] = value;
    }
  }

  console.log('Message values: ', JSON.stringify(valuesToLog, null, 2));
}

function startShowTypingInterval(channel) {
  console.log('Send Typing');
  channel.sendTyping();
  return setInterval(() => {
    console.log('Send Typing');
    channel.sendTyping();
  }, 10000);
}

function clearTypingInterval(interval) {
  console.log('Clear Typing');
  clearInterval(interval);
}

function updateUserFromRoles(user, message) {
  const roles = message.member.roles;
  const roleManager = roles.guild.roles;
  const roleIdsAndNames = roles.member._roles.map((roleId) => {
    const role = roleManager.cache.get(roleId);
    return { id: role.id, name: role.name };
  });

  const roleOuterNames = ['EP', 'EJ', 'IP', 'IJ'];
  const roleInnerNames = ['NF', 'NT', 'SF', 'ST'];
  const ages = {
    '🥚': '17-20',
    '🐤': '21-25',
    '🐓': '25-29',
    '🦃': '30+',
  };
  const genders = {
    '♂️': 'male',
    '♀️': 'female',
    '⚧️': 'non-binary',
  };

  // Initialize MBTI type string with 'x'
  let mbti = 'xxxx';
  let age = null;
  let gender = null;

  for (const role of roleIdsAndNames) {
    if (roleOuterNames.includes(role.name)) {
      // Update the outer parts of the MBTI type
      const energy = role.name.charAt(0); // 'E' or 'I'
      const judgement = role.name.charAt(1); // 'P' or 'J'
      mbti = energy + mbti.charAt(1) + mbti.charAt(2) + judgement;
    } else if (roleInnerNames.includes(role.name)) {
      // Update the inner parts of the MBTI type
      const info = role.name.charAt(0); // 'N' or 'S'
      const decision = role.name.charAt(1); // 'F' or 'T'
      mbti = mbti.charAt(0) + info + decision + mbti.charAt(3);
    } else if (ages.hasOwnProperty(role.name)) {
      age = ages[role.name];
    } else if (genders.hasOwnProperty(role.name)) {
      gender = genders[role.name];
    }
  }

  console.log('MBTI type:', mbti, 'Age:', age, 'Gender:', gender);

  user.update({ mbti: mbti, age: age, gender: gender });

  return user;
}


function getPrompt(channelId, commandProperties) {
  let prompt = '';
  let promptName = '';
  
  if (channelId === ChannelType.DREAMS) {
    prompt = Prompts.getPromptDreams();
    promptName = 'DREAMS';
  } else if (commandProperties.isMew) {
    prompt = Prompts.getPromptMew();
    promptName = 'MEW';
  } else if (commandProperties.isHicks) {
    prompt = Prompts.getPromptHicks();
    promptName = 'HICKS';
  } else if (channelId === ChannelType.PROD) {
    prompt = Prompts.getPromptProd();
    promptName = 'PROD';
  } else if (channelId === ChannelType.DEV) {
    prompt = Prompts.getPromptDev();
    promptName = 'DEV';
  } else if (channelId === ChannelType.JOCHI) {
    prompt = Prompts.getPromptProd();
    promptName = 'DEV';
  } else {
    throw new Error('Unknown channel');
  }

  return {
    prompt,
    promptName
  };
}

async function fetchPreviousMessages(message, commandProperties, user) {
  console.log('Fetching previous messages');
  let fetchCount = 20;
  if (commandProperties.shouldShutdown) fetchCount = 1
  let messages = await message.channel.messages.fetch({ limit: fetchCount });
  const messageCount = commandProperties.isExtraContext ? 10 : 5;
    if (!commandProperties.isFullContext) {
      messages = messages.filter(msg => msg.author.id === user.userid);
      messages = messages.first(messageCount);
    }
  return messages;
}

function shutdownBot(client) {
  console.log('Shutting down...');
  client.destroy();
  process.exit(0);
}

async function sendMessage(message, response) {
  console.log('Sending FaiRY response: ' + response);
  try {
    await message.channel.messages.fetch(message.id);
    try {
      await message.reply(response);
    } catch (error) {
      console.error("Error while sending reply:", error);
      sendUwU(message);
    }
  } catch (error) {
    console.log('MESSAGE DELETED');
  }
}

async function sendUwU(message) {
  sendMessage(message, 'UwU');
}

async function checkIfPervert(message, response) {
  if (response.includes('Go away pervert')) {
    message.member.timeout(5 * 60 * 1000)
      .then(() => console.log("Timed out member: " + message.author.username))
      .catch(err => {
        console.log('Error timing out user: ' + err);
      });
      return true
  }
  return false
}

(async function main() {
  let client;

    try {
      client = new Client({
        intents: [
          IntentsBitField.Flags.Guilds,
          IntentsBitField.Flags.GuildMessages,
          IntentsBitField.Flags.MessageContent,
        ],
      });

      client.on('ready', () => {
        console.log('The bot is online!');
      });

      await startBot(client);

    } catch (error) {
      console.log(`Bot error: ${error}`);
      client.destroy();
    }
})();