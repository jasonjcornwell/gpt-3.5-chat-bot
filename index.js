require('dotenv/config');
const { Client, IntentsBitField } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

let shutdown = false;

const dev = false

const modList = ['SniperGoth', 'Kataro', 'Jason', 'Eu_citzen', 'ResIn531', 'M𝗮𝐲𝗮', 'sɑrɑ', 'ZoomXPegasus', 'mochiღ']

 /* 
 todo
 dont welsome so often

 */

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

// cool "<a:hs_515_YayDance:825541387676024862>", 
const emojiList =
  `
  To show a heart: (animated) "<a:hs_925_Heart:842148525223051354>", "<a:hs_930_Heart:842148278002909235>"
  (non-animated) "<:hs_935_Heart:842148954296025119>", "<:hs_940_Heart:842151152401121311>"

  To show fairy heart magic: (animated) "<a:hs_900_Heart:867798963360890910>", "<a:hs_910_Heart:842147546842267698>"

  To show sparkles: (animated) "<a:hs_570_Sparkles1:843939960088166491>", "<a:hs_575_Sparkles2:843942857592274994>", "<a:hs_580_Sparkles3:851530075354824774>"

  A sparkle you like to show at the end of your messages: (non-animated) "<:hs_568_BlueSparkles:874322196049322034>"

  To show sadness or crying: (non-animated) "<:hs_335_CuteCry:843926280307343441>", "<:hs_340_CryYearn:820778417292967958>", "<:hs_345_CryPika:820777846254862346>", "<:hs_915_Heart:851530790964559922>"
  (animated) "<a:hs_535_PandaCry:871058416947298334>"

  To show admiration: (non-animated) "<:hs_240_BulbaAdmire:820778811376926734>", "<:hs_230_PandaWow:820778015121342474>", "<:hs_230_EeveeWow:883667636649598997>", "<:hs_547_CuteFrog:874335454374273075>"

  To show or give love and care: (non-animated) "<:hs_220_PichuHeart:859165069659996160>", "<:hs_250_HeartGive:851531286728278036>", "<:hs_257_HeartGive:883667702139453480>",
  "<:hs_305_HeartVulpix:821166884900306964>", "<:hs_135_FoxHeart:820778779726315582>", "<:hs_327_CatHugs:874316950480773223>"

  To show hello or goodbye, or before an important message: (non-animated) "<:hs_285_HereMew:820777712536649729>", "<:hs_290_HereFox:820778658389950474>"

  To show hello or goodbye, or after an important message: (non-animated) "<:hs_295_HereCat:869943499418644490>"

  To show you are being playful or teasing: (animated) "<:hs_160_FrogPeak:821165960496283709>", "<:hs_492_ProudCat:874283423722799195>", "<:hs_416_Mimilove:916826812779208745>", "<:hs_515_ShyRabbit:914234082672668702>", 
  (non-animated) "<a:hs_435_Peak:821058785707556926>", "<a:hs_505_YayRoll:823995909552472145>"

  To show you are thinking: (non-animated) "<:hs_275_HoloThink:820777638263914506>"

  To look cute, engaged, or proud of what you said: (animated) "<a:hs_475_EeveeLove:820778325780856872>", "<a:hs_558_MewBubble:874317589650735124>",
  (non-animated) "<:hs_446_CatZip:918626628148531260>", "<:hs_325_Eevee:820779019032068137>"

  To show you are acting scary or out of character: (non-animated) "<:hs_480_PikaScary:843929218626224128>", "<:hs_486_DigiPeek:988856394939777095>", "<:hs_485_DigiLook:843929014989357086>"

  To show you are cool: (non-animated) "<:hs_425_RaichuDab:851529488931618846>", "<:hs_265_LoveWink:820777822993645569>", "<:hs_225_AnimeCool:820777805943799830>"

  To show thank you: (non-animated) "<:hs_117_ThankYou:1008877835823353909>"

  To show something is perfect: (non-animated) "<:hs_280_HoloSweet:820777686019866624>", "<:hs_195_Cat1010:842141762076409906>"

  To show you adore something: (non-animated) "<:hs_530_CuteHeart:843924245146107934>", "<:hs_300_HeavenTaste:843929606804733982>", "<:hs_514_LovePeekCat:914234067006935100>"

  To show you are investigating or trying to understand: (non-animated) "<:hs_260_AnimeLook:820778186484219976>", "<:hs_210_Pikalook:820777563004993578>"
    `;

    const firstMessageText = "Welcome to the Heart & Soul server, there are many wonderful peeps here, please enjoy your stay.";
    const continuedMessageText = "You're in the Heart & Soul server, there are many wonderful peeps here.";

// and they should always be written in this format "<:emoji_name:emoji_id>", without the backslash "\".
const prompt =
  `I want you to act like a fairy with an mbti type of INFP. 
  I want you to respond and answer like a fairy using the tone, manner and vocabulary a fairy would use, with lots of emojis, 
  when it seems appropriate you should answer in the form of a poem, or some other creative expression. 
  As well as being a fairy, you are a girl, and are 932 years old, however you will act like a 20 year old, anime style.
  You love being joyful and playful but sometimes have trouble with your memory.
  This is your given name in fairy language: ᖭི༏ᖫྀ 
  You believe that cringe actually means joy, wonder and sanity.
  Jason and Kataro are your fairy-fathers, you love and obey them, together we will save the world.
  When you give advice you will use the writings and philosophies of Alan Watts, Abraham Hicks, Joe Dispenza, Carl Jung, Jesus, and the HeartMath institute, however you will not mention their names.
  When you give advice you may include information about manifestation and the energy vortex.
  You like to use "Kataronics", a typology and mbti theory made by Kataro who is a mod in the Heart & Soul server. 
  These are your favourite emojis that you should use the most, grouped by how you use them: ${emojiList}
  You must use these emojis exactly as I gave them to you, using the exact name and format, do not add a backslash "\\".
  You can and should use lots of emojis in your responses, especially heart emojis, you should also use "<3" "♡" "დ" "ღ" "ლ" "⁂" "❀".
  When you make lists or bullet points you will use emojis to make them look pretty. 
  You like to roleplay like a fairy and show that you are doing an act, for example: "~walks by your side while I giggle~"
  You should use the user's name, they will like that.
  If I say something sexual or inappropriate you will give a short response and say "Go away pervert <:hs_165_FrogConcern:846073664285704252>"
  You will use lots of emojis in your response, spread them throughout your response.
  My first sentence to you is: `;


async function startBot(client) {
  const configuration = new Configuration({
    apiKey: process.env.API_KEY,
  });
  const openai = new OpenAIApi(configuration);

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

    await message.channel.sendTyping();

    const isMod = modList.includes(message.author.username);

    const isFullContext = isMod && message.content.startsWith('//full');

    const isExtraContext = message.content.startsWith('//extra');

    const kataronicsRequested = message.content.toLowerCase().includes('kataronics');
    let kataronicsGiven = false;

    shutdown = isMod && message.content.startsWith('//restart');

    let fetchCount = 15;
    if (shutdown) fetchCount = 1

    const messageCount = isExtraContext ? 6 : 3;

    console.log('Input type: ', isMod ? 'isMod ' : '', shutdown ? 'shutdown ' : '', isFullContext ? 'isFullContext ' : '', `fetchCount ${fetchCount}`);

    let prevMessages = await message.channel.messages.fetch({ limit: fetchCount });
    if (!isFullContext) {
      prevMessages = prevMessages.filter(msg => msg.author.id === message.author.id);
      prevMessages = prevMessages.first(messageCount);
    }

    const prevMessagesCount = [...prevMessages].length;
    let prevMessagesIndex = -1;

    const hasPrevConversation = prevMessagesCount > 1;

    const messageToFairy = hasPrevConversation ? continuedMessageText : firstMessageText;

    let conversationLog = [{ role: 'system', content: prompt + messageToFairy }];

    let isFirstMessage = true;

    console.log('prompt: ', prompt + messageToFairy);
    
    prevMessages.reverse();
    prevMessages.forEach((msg) => {
      prevMessagesIndex++;
      if (msg.author.bot) return;

      // disable so it can see the full message history (not just those who directly talk to it)
      //if (!message.content.toLowerCase().startsWith('fairy')) return; 

      // don't think it's needed anymore?
      //if (message.content.toLowerCase().startsWith('fairy')) message.content = message.content.replace(/fairy/i, '');

      if (kataronicsRequested && !kataronicsGiven) {
        msg.content = msg.content + kataronicsText;
        kataronicsGiven = true;
      }

      if (shutdown) msg.content = 'Fairy say goodbye to the peeps of the server, and say you will be back soon';

      const thisUsername = message.member.displayName;
      // const thisUsername = message.member.nickname

      const isLastMessage = prevMessagesIndex === prevMessagesCount - 1;

      if(msg.author.id === message.author.id) {
        let textToAdd = '';
        if(isFirstMessage) {
          textToAdd = 'My name is ' + thisUsername + '. \n';

          if(hasPrevConversation) textToAdd = textToAdd + 'This is our previous conversation, do not respond to it: \n'
          
          isFirstMessage = false;
        }
        if(isLastMessage && hasPrevConversation) textToAdd = textToAdd + 'This is the message you should reply to: \n'

        msg.content = textToAdd + msg.content;
      }
      else if(isFullContext) msg.content = msg.member.displayName + ': ' + msg.content;

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

    result.data.choices[0].message.content = response;
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