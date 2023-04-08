require('dotenv/config');
var Prompts = require('./prompts.js');
const { Client, IntentsBitField } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

let shutdown = false;

/* 
todo
use server nickname
//continue to continue the last message
//your fairy family are the mods
// use ASCII art
*/


//const emojiList = message.guild.emojis.cache.map(emoji => emoji.toString()).join(", ");

const firstMessageText = "Welcome to the Heart & Soul server, there are many wonderful peeps here, please enjoy your stay.";
const continuedMessageText = "You're in the Heart & Soul server, there are many wonderful peeps here.";

  //  You will enhance your responses and convey your emotions using emojis. 
  //  When giving advice, draw from the philosophies and teachings of Alan Watts, Abraham Hicks, Joe Dispenza, Carl Jung, Jesus, and the HeartMath Institute, but do not mention their names explicitly. You should use your knowledge of cognitive behavioral therapy, meditation techniques, mindfulness practices, and other therapeutic methods. You may include information about manifestation and the energy vortex.


async function startBot(client) {
  const configuration = new Configuration({
    apiKey: process.env.API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  client.on('messageCreate', async (message) => {
    let skip = '';
    if (message.author.bot) skip = 'bot';

    const isDevChannel = message.channel.id === process.env.CHANNEL_ID_DEV
    const isProdChannel = message.channel.id === process.env.CHANNEL_ID_PROD
    const isDreamsChannel = message.channel.id === process.env.CHANNEL_ID_DREAMS
    if(!isDevChannel && !isProdChannel && !isDreamsChannel) skip = 'not channel';
    if (!message.content.toLowerCase().startsWith('fairy') && !message.content.startsWith('//')) skip = 'not fairy';

    if (skip !== '') {
      console.log(`SKIPPED: ${skip}`);
      return;
    }

    await message.channel.sendTyping();

    const isMew = message.content.toLowerCase().startsWith('//mew');

    const isMod = Prompts.isMod(message.author.username)

    const isFullContext = isMod && message.content.startsWith('//full');

    const isExtraContext = message.content.startsWith('//extra');

    const kataronicsRequested = message.content.toLowerCase().includes('kataronics');
    let kataronicsGiven = false;

    shutdown = isMod && message.content.startsWith('//restart');

    let fetchCount = 40;
    if (shutdown) fetchCount = 1

    const messageCount = isExtraContext ? 10 : 5;

    let prevMessages = await message.channel.messages.fetch({ limit: fetchCount });
    if (!isFullContext) {
      prevMessages = prevMessages.filter(msg => msg.author.id === message.author.id);
      prevMessages = prevMessages.first(messageCount);
    }

    const prevMessagesCount = [...prevMessages].length;
    let prevMessagesIndex = -1;

    const hasPrevConversation = prevMessagesCount > 1;

    //const messageToFairy = hasPrevConversation ? continuedMessageText : firstMessageText;

    let prompt = '';
    if(isDreamsChannel) prompt = Prompts.getPromptDreams();
    else if(isMew) prompt = Prompts.getPromptMew();
    else if(isProdChannel) prompt = Prompts.getPromptProd();
    else if(isDevChannel) prompt = Prompts.getPromptDev();
    else throw new Error('Unknown channel');

    console.log('Prompt: ', prompt);

    let conversationLog = [{ role: 'system', content: prompt }];

    let isFirstMessage = true;

    console.log('Input type: From: ', message.author.username + ', ', isMod ? 'isMod ' : '', shutdown ? 'shutdown ' : '', isFullContext ? 'isFullContext ' : '', kataronicsRequested ? 'kataronicsRequested ' : '');
    console.log('Response type: ', `fetchCount ${fetchCount}`, `hasPrevConversation ${hasPrevConversation}`, `isDreams ${isDreamsChannel}`);

    prevMessages.reverse();
    prevMessages.forEach((msg) => {
      prevMessagesIndex++;
      if (msg.author.bot) return;

      // disable so it can see the full message history (not just those who directly talk to it)
      //if (!message.content.toLowerCase().startsWith('fairy')) return; 

      // don't think it's needed anymore?
      //if (message.content.toLowerCase().startsWith('fairy')) message.content = message.content.replace(/fairy/i, '');

      if (kataronicsRequested && !kataronicsGiven) {
        msg.content = msg.content + getKataronics();
        kataronicsGiven = true;
      }

      if (shutdown) msg.content = 'Fairy say goodbye to the peeps of the server, and say you will be back soon';

      //const thisUsername = message.member.displayName;
      const thisUsername = msg.author.username;
      // const thisUsername = message.member.nickname

      const isLastMessage = prevMessagesIndex === prevMessagesCount - 1;

      if (msg.author.id === message.author.id) {
        let textToAdd = '';
        if (isFirstMessage) {
          textToAdd = 'My name is ' + thisUsername + '. \n';

          if (hasPrevConversation) textToAdd = textToAdd + 'This is the context of our conversation, do not respond to it: \n'

          isFirstMessage = false;
        }
        if (isLastMessage && hasPrevConversation) textToAdd = textToAdd + 'This is the new message you should reply to: \n'

        msg.content = textToAdd + msg.content;
      }
      else if (isFullContext) msg.content = thisUsername + ': ' + msg.content;

      console.log(msg.content);

      conversationLog.push({
        role: 'user',
        content: msg.content,
      });
    });

    const result = await openai
      .createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationLog,
        max_tokens: 400, // limit token usage
      })
      .catch((error) => {
        console.log(`OPENAI ERR: ${error}`);
      });

    let response = result.data.choices[0].message.content;

    if (response.includes('Go away pervert')) {
      message.member.timeout(5 * 60 * 1000)
        .then(() => console.log("Timed out member: " + message.author.username))
        .catch(err => {
          console.log('Error timing out user: ' + err);
        });
    }
    //response = response.replace(/fairy:\s/i, '');
    console.log('FaiRY response: ' + response);
    
    try {
      await message.channel.messages.fetch(message.id)
    } catch (error) {
      console.log('MESSAGE DELETED');
      return; //the message no longer exists and will be ignored
    }

    await message.reply(result.data.choices[0].message);
    if (shutdown) {
      throw "Fairy restarting";
    }
  });

  try {
    await client.login(process.env.TOKEN);
  } catch (error) {
    console.log(`Login error: ${error}`);
  }
  return true
}

(async function main() {
  let client;
  let loggedIn = false;
  let restarts = 0;

  while (!loggedIn && restarts < 5 && !shutdown) {
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

      loggedIn = await startBot(client);

    } catch (error) {
      console.log(`Bot restart error: ${error}`);
      client.destroy();
      loggedIn = false;
      restarts++;
    }
  }
})();