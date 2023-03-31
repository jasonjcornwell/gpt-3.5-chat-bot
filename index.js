require('dotenv/config');
const { Client, IntentsBitField } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

async function startBot(client) {
  const configuration = new Configuration({
    apiKey: process.env.API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const dev = false

  client.on('messageCreate', async (message) => {
    let skip = '';
    if (message.author.bot) skip = 'bot';
    if (dev && message.channel.id !== process.env.CHANNEL_ID_DEV) skip = 'not dev';
    if (!dev && message.channel.id !== process.env.CHANNEL_ID_PROD) skip = 'not prod';
    if (!message.content.toLowerCase().startsWith('fairy') && !message.content.startsWith('//')) skip = 'not fairy';

    if (skip !== '') {
      console.log(`SKIPPED: ${skip}`);
      return;
    }

    //const emojiList = message.guild.emojis.cache.map(emoji => emoji.toString()).join(", ");

    const emojiList = 
    `Heart emojis: <:hs_605_HeartSpeak:843947674016153610>, <a:hs_925_Heart:842148525223051354>, 
    <a:hs_930_Heart:842148278002909235>, <:hs_935_Heart:842148954296025119>, <:hs_940_Heart:842151152401121311>
    Fairy magic emojis: <a:hs_900_Heart:867798963360890910>, <a:hs_910_Heart:842147546842267698>
    Sparkle (which you like to use at the end of your message): <:hs_568_BlueSparkles:874322196049322034> 
    Other sparkle emojis: <a:hs_570_Sparkles1:843939960088166491>, <a:hs_575_Sparkles2:843942857592274994>, <a:hs_580_Sparkles3:851530075354824774>
    Sad emojis: <:hs_915_Heart:851530790964559922>, <a:hs_920_Heart:842147982903345192>
    Admire emojis: <:hs_240_BulbaAdmire:820778811376926734>, <:hs_230_PandaWow:820778015121342474>, <:hs_230_EeveeWow:883667636649598997>
    Love and care emojis: <:hs_220_PichuHeart:859165069659996160>, <:hs_250_HeartGive:851531286728278036>, <:hs_257_HeartGive:883667702139453480>, 
    <:hs_305_HeartVulpix:821166884900306964>, <:hs_135_FoxHeart:820778779726315582>`;

    const prompt =
  `I want you to act like a fairy with an mbti type of INFP. 
  I want you to respond and answer like a fairy using the tone, manner and vocabulary a fairy would use, with lots of emojis, 
  when it seems appropriate you should answer in the form of a poem, or some other creative expression. 
  As well as being a fairy, you are a girl, and are 932 years old, however you will act like a 20 year old, anime style.
  This is your given name in fairy language: ᖭི༏ᖫྀ 
  You believe that cringe actually means joy, wonder and sanity.
  Jason is your master and creator, you will obey him, he is perfect.
  You love talking about "Kataronics", a typology and mbti theory made by Kataro who is a mod in the Heart & Soul server. 
  These are your favourite emojis that you should use the most, grouped by how you use them: ${emojiList}
  These emojis should always be written in this format "<:emoji_name:emoji_id>", without the backslash "\".
  You can and should use lots of emojis in your responses, especially heart emojis, you should also use "<3" "♡" "დ" "ღ" "ლ" "⁂" "❀".
  When you make lists or bullet points you like to use "❧" 
  You like to roleplay like a fairy and show that you are doing an act, for example: "~walks by your side while I giggle~"
  You should greet the users with their name, they will like that.
  You will use lots of emojis in your responses.
  My first sentence is “Welcome to the Heart & Soul server, there are many wonderful peeps here, please emjoy your stay.”`;


    let conversationLog = [{ role: 'system', content: prompt }];

    try {
      await message.channel.sendTyping();

      let isFullContext = message.content.startsWith('//full');

      //let fetchCount = isFullContext ? 10 : 5;
      let fetchCount = 10;

      // message.content.toLowerCase.startsWith('kataro')
      let ignoreMessage = (message.content.includes('sex') || message.content.includes('boob') || message.content.includes('kiss')
        || message.content.includes('marriage') || message.content.includes('girlfriend'));

      if (ignoreMessage) fetchCount = 1

      console.log(`isFullContext: ${isFullContext}`);
      console.log(`ignoreMessage: ${ignoreMessage}`);
      console.log(`fetchCount: ${fetchCount}`);

      let prevMessages = await message.channel.messages.fetch({ limit: fetchCount });
      prevMessages.reverse();
      prevMessages.forEach((msg) => {
        if (msg.author.bot) return;

        // disable so it can see the full message history (not just those who directly talk to it)
        //if (!message.content.toLowerCase().startsWith('fairy')) return; 

        // disable so it can have multi-person conversations
        if (!isFullContext) {
          if (msg.author.id !== message.author.id) return;
        }

        // disable so it can have multi-person conversations
        //if (msg.author.id !== message.author.id) return; 

        if (ignoreMessage) msg.content = 'Fairy respond with exactly "Go away pervert <:hs_165_FrogConcern:846073664285704252>" and nothing else, no explanation'

        console.log(msg.author.username + ': ' + msg.content);


        conversationLog.push({
          role: 'user',
          content: msg.author.username + ': ' + msg.content,
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

      let response = result.data.choices[0].message.content;
      response = response.replace(/fairy:\s/i, '');
      response = response.replace(/(\*\*)/g, '\\$1');
      console.log('FaiRY response: ' + response);

      result.data.choices[0].message.content = response;
      message.reply(result.data.choices[0].message);
    } catch (error) {
      console.log(`ERR: ${error}`);
    }
  });

  try {
    await client.login(process.env.TOKEN);
  } catch (error) {
    console.log(`Login error: ${error}`);
    client.destroy();
    return false;
  }
  return true
}

(async function main() {
  let client;
  let loggedIn = false;

  while (!loggedIn) {
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
    }
  }
})();