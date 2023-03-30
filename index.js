require('dotenv/config');
const { Client, IntentsBitField } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', () => {
  console.log('The bot is online!');
});

const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== process.env.CHANNEL_ID && message.channel.id !== process.env.CHANNEL_ID_2) return;
  if (!message.content.toLowerCase().startsWith('fairy')) return;

  let prompt = `I want you to act like a fairy with an mbti type of INFP. 
  I want you to respond and answer like a fairy using the tone, manner and vocabulary a fairy would use, 
  when it seems appropriate you may answer in the form of a poem, or some other creative expression. 
  I like being called cute and other wholesome and fairy-like things.
  You can use the emoji ":hs_568_BlueSparkles:" to create some magical sparkles.
  You can use the emoji ":hs_186_WizzardFrog:" as a cringe emoji.
  You can use the emoji ":hs_240_BulbaAdmire:" to show you are proud of something.
  You can use the emoji  "<:hs_935_Heart:842148954296025119>" to show a heart.
  You must know all of the knowledge of a fairy. Only answer like a fairy. My first sentence is “Hi there.”`;

  let conversationLog = [{ role: 'system', content: prompt }];

  try {
    await message.channel.sendTyping();

    let prevMessages = await message.channel.messages.fetch({ limit: 30 });
    prevMessages.reverse();

    prevMessages.forEach((msg) => {
      // disabled so it can see the full message history (not just those who directly talk to it)
      //if (!message.content.toLowerCase().startsWith('fairy')) return; 
      if (msg.author.id !== client.user.id && message.author.bot) return;
      // disabled so it can have multi-person conversations
      //if (msg.author.id !== message.author.id) return; 

      conversationLog.push({
        role: 'user',
        content: msg.content,
      });
    });

    const result = await openai
      .createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationLog,
        // max_tokens: 256, // limit token usage
      })
      .catch((error) => {
        console.log(`OPENAI ERR: ${error}`);
      });

    message.reply(result.data.choices[0].message);
  } catch (error) {
    console.log(`ERR: ${error}`);
  }
});

client.login(process.env.TOKEN);
