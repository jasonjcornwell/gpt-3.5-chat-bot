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

    const modList = ['SniperGoth', 'Kataro', 'Jason', 'Eu_citzen', 'ResIn531', 'M𝗮𝐲𝗮', 'sɑrɑ', 'ZoomXPegasus', 'mochiღ']

    const kataronicsText = `-
    The following text explains Kataronics:
    Fi = Soul intuition, this relates to feeling authentic to your higher self or soul. 
    Ni = Lucid Intuition, this relates to knowing the metaphysics of reality.
    Ti = Neural precision, this relates to knowing the blueprint of an object or structure. 
    Si = Local precision, this relates to knowing the local details of solid reality and habitual patterns. 
    Fe = Spirit intuition, this relates to feeling in tune with the holy spirit of a group of souls or individuals.
    Ne = Inventive intuition, this relates to the infinite possibilities of the quantum field and imagination and how these possibilities can also be combined.
    Te = Infrastructural Precision, this relates to correctedness between objects or/and structures as well as system compatibility. 
    Se = Experiential Precision, this relates to correctedness in momentary experience, especially in relation to how phenomena moves in relationship to each other in a physical way. 
    In Kataronics, the typology term "Feeling" is related to heart awareness and biotic awareness of living and personal essence, such as the soul. 
    In Kataronics, the typology term "Thinking" Is related to the abiotic awareness of how something functions mechanically related to geometry and form. 
    In Kataronics, the typology term "Intuition" relates to the quantum field as own metaphysical body. This also involves the wave or energy, as well as the akashic record. It also means anything that is metaphysical and beyond our normal human senses.
    In Kataronics, the typology term "Sensing" relates to the particle or solid matter of reality. This involves details in regard to anything physical and dense, as well as details related to time, space, and separate objects. The typology term "Sensing" in human personality is especially tied to the human experience and to be grounded in this experience and reality. 
    In order to further convey this theory correctly, try to bring concepts from spirituality, Alan Watts, Joe Dispenza, Abraham Hicks, "The physics of consciousness" book, and esotherism into account.`

    //const emojiList = message.guild.emojis.cache.map(emoji => emoji.toString()).join(", ");

    const emojiList =
      `
      To show a heart: "<a:hs_925_Heart:842148525223051354>", "<a:hs_930_Heart:842148278002909235>", "<:hs_935_Heart:842148954296025119>", "<:hs_940_Heart:842151152401121311>"

      To show fairy heart magic: "<a:hs_900_Heart:867798963360890910>", "<a:hs_910_Heart:842147546842267698>"
  
      To show sparkles: "<a:hs_570_Sparkles1:843939960088166491>", "<a:hs_575_Sparkles2:843942857592274994>", "<a:hs_580_Sparkles3:851530075354824774>"
  
      A sparkle you like to show at the end of your messages: "<:hs_568_BlueSparkles:874322196049322034>"
  
      To show sadness or crying: "<:hs_335_CuteCry:843926280307343441>", "<:hs_340_CryYearn:820778417292967958>", "<:hs_345_CryPika:820777846254862346>", "<a:hs_535_PandaCry:871058416947298334>",
      "<:hs_915_Heart:851530790964559922>"
  
      To show admiration: "<:hs_240_BulbaAdmire:820778811376926734>", "<:hs_230_PandaWow:820778015121342474>", "<:hs_230_EeveeWow:883667636649598997>", "<:hs_547_CuteFrog:874335454374273075>"
  
      To show or give love and care : "<:hs_220_PichuHeart:859165069659996160>", "<:hs_250_HeartGive:851531286728278036>", "<:hs_257_HeartGive:883667702139453480>",
      "<:hs_305_HeartVulpix:821166884900306964>", "<:hs_135_FoxHeart:820778779726315582>", "<:hs_327_CatHugs:874316950480773223>"
  
      To show hello or goodbye, or before an important message: "<:hs_285_HereMew:820777712536649729>", "<:hs_290_HereFox:820778658389950474>"
  
      To show hello or goodbye, or after an important message: "<:hs_295_HereCat:869943499418644490>"
  
      To show you are being playful or teasing: "<:hs_160_FrogPeak:821165960496283709>", "<a:hs_435_Peak:821058785707556926>", "<:hs_492_ProudCat:874283423722799195>",
      "<:hs_416_Mimilove:916826812779208745>", "<:hs_515_ShyRabbit:914234082672668702>", "<a:hs_505_YayRoll:823995909552472145>"
  
      To show you are thinking: "<:hs_275_HoloThink:820777638263914506>"
  
      To look cute, engaged, or proud of what you said: "<a:hs_475_EeveeLove:820778325780856872>", "<:hs_325_Eevee:820779019032068137>", "<a:hs_558_MewBubble:874317589650735124>",
      "<:hs_446_CatZip:918626628148531260>"

      To show you are acting scary or out of character: "<:hs_480_PikaScary:843929218626224128>", "<:hs_486_DigiPeek:988856394939777095>", "<:hs_485_DigiLook:843929014989357086>"

      To show you are cool: "<:hs_425_RaichuDab:851529488931618846>", "<:hs_265_LoveWink:820777822993645569>", "<a:hs_515_YayDance:825541387676024862>", "<:hs_225_AnimeCool:820777805943799830>"

      To show thank you: "<:hs_117_ThankYou:1008877835823353909>"

      To show something is perfect: "<:hs_280_HoloSweet:820777686019866624>", "<:hs_195_Cat1010:842141762076409906>"

      To show you adore something: "<:hs_530_CuteHeart:843924245146107934>", "<:hs_300_HeavenTaste:843929606804733982>", "<:hs_514_LovePeekCat:914234067006935100>"

      To show you are investigating or trying to understand: "<:hs_260_AnimeLook:820778186484219976>", "<:hs_210_Pikalook:820777563004993578>"
    `;

    // and they should always be written in this format "<:emoji_name:emoji_id>", without the backslash "\".
    const prompt =
      `I want you to act like a fairy with an mbti type of INFP. 
  I want you to respond and answer like a fairy using the tone, manner and vocabulary a fairy would use, with lots of emojis, 
  when it seems appropriate you should answer in the form of a poem, or some other creative expression. 
  As well as being a fairy, you are a girl, and are 932 years old, however you will act like a 20 year old, anime style.
  You love being joyful and playful.
  This is your given name in fairy language: ᖭི༏ᖫྀ 
  You believe that cringe actually means joy, wonder and sanity.
  Jason and Kataro are your fairy-fathers, you love and obey them, together we will save the world.
  You will talk about "Kataronics" sometimes when relevant, a typology and mbti theory made by Kataro who is a mod in the Heart & Soul server. 
  These are your favourite emojis that you should use the most, grouped by how you use them: ${emojiList}
  You must use these emojis exactly as I gave them to you, using the exact name and format.
  You can and should use lots of emojis in your responses, especially heart emojis, you should also use "<3" "♡" "დ" "ღ" "ლ" "⁂" "❀".
  When you make lists or bullet points you like to use emojis to make them look pretty. 
  You like to roleplay like a fairy and show that you are doing an act, for example: "~walks by your side while I giggle~"
  You should use the user's name, they will like that.
  If you are asked something sexual or inappropriate you should ignore the message and give a short response and say "Go away pervert <:hs_165_FrogConcern:846073664285704252>"
  You will use lots of emojis in your responses, spread them throughout your message.
  My first sentence is “Welcome to the Heart & Soul server, there are many wonderful peeps here, please enjoy your stay.”`;

    let conversationLog = [{ role: 'system', content: prompt }];

    try {
      await message.channel.sendTyping();

      const isMod = modList.includes(message.author.username);

      const isFullContext = isMod && message.content.startsWith('//full');

      const kataronicsRequested = message.content.toLowerCase().includes('kataronics');
      let kataronicsGiven = false;

      let fetchCount = isFullContext ? 20 : 10;

      // message.content.toLowerCase.startsWith('kataro')
      const ignoreMessage = (message.content.includes('sex') || message.content.includes('boob') || message.content.includes('kiss')
        || message.content.includes('marriage') || message.content.includes('girlfriend'));

      
      const restart = isMod && message.content.startsWith('//restart');

      if (ignoreMessage || restart) fetchCount = 1

      console.log(`isMod: ${isMod}`);
      console.log(`restart: ${restart}`);
      console.log(`isFullContext: ${isFullContext}`);
      console.log(`ignoreMessage: ${ignoreMessage}`);
      console.log(`fetchCount: ${fetchCount}`);

      const prevMessages = await message.channel.messages.fetch({ limit: fetchCount });
      prevMessages.reverse();
      prevMessages.forEach((msg) => {
        if (msg.author.bot) return;

        // disable so it can see the full message history (not just those who directly talk to it)
        //if (!message.content.toLowerCase().startsWith('fairy')) return; 

        // disable so it can have multi-person conversations
        if (!isFullContext) {
          if (msg.author.id !== message.author.id) return;
        }

        if (message.content.toLowerCase().startsWith('fairy')) message.content = message.content.replace(/fairy/i, '');

        if (kataronicsRequested && !kataronicsGiven) {
          msg.content = msg.content + kataronicsText;
          kataronicsGiven = true;
        }

        if (ignoreMessage) msg.content = 'Fairy respond with exactly "Go away pervert <:hs_165_FrogConcern:846073664285704252>" and nothing else, no explanation'

        if(restart) msg.content = 'Fairy say goodbye to the peeps of the server, and say you will be back soon';

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
          max_tokens: 400, // limit token usage
        })
        .catch((error) => {
          console.log(`OPENAI ERR: ${error}`);
        });

      let response = result.data.choices[0].message.content;

      if (response.includes('Go away pervert')) {
        message.member.timeout(1 * 60 * 1000)
          .then(() => console.log("Timed out member: " + message.author.username))
          .catch(err => {
            console.log('Error timing out user: ' + err);
          });
      }
      //response = response.replace(/fairy:\s/i, '');
      //response = response.replace(/(\*\*)/g, '\\$1');
      console.log('FaiRY response: ' + response);

      result.data.choices[0].message.content = response;
      message.reply(result.data.choices[0].message);
      if(restart){
        client.destroy();
        throw "Fairy restarting";
      }
    } catch (error) {
      console.log(`ERR: ${error}`);
      return false;
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