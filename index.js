require('dotenv/config');
const { Client, IntentsBitField } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

let shutdown = false;

const dev = false

const modList = ['SniperGoth', 'Kataro', 'Jason', 'Eu_citzen', 'ResIn531', 'M𝗮𝐲𝗮', 'sɑrɑ', 'ZoomXPegasus', 'mochiღ']

/* 
todo
use server nickname

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

  To show you are thinking or trying to understand: (non-animated) "<:hs_260_AnimeLook:820778186484219976>", "<:hs_210_Pikalook:820777563004993578>"
    `;

const emojiListReduced =
  `
  To show a heart: "<a:hs_925_Heart:842148525223051354>", "<a:hs_930_Heart:842148278002909235>"

  To show fairy heart magic: "<a:hs_900_Heart:867798963360890910>", "<a:hs_910_Heart:842147546842267698>"

  To show sparkles: "<a:hs_570_Sparkles1:843939960088166491>", "<a:hs_575_Sparkles2:843942857592274994>"

  To show sadness or crying: "<a:hs_535_PandaCry:871058416947298334>"

  To show hello or goodbye: "<a:hs_525_CatWink:842146469166972978>"

  To show you are being playful or teasing: "<a:hs_435_Peak:821058785707556926>", "<a:hs_505_YayRoll:823995909552472145>"

  To look cute, engaged, or proud of what you said: "<a:hs_475_EeveeLove:820778325780856872>", "<a:hs_558_MewBubble:874317589650735124>"

  To show you are acting scary or out of character: "<a:hs_486_EvilGirl:874319124413706282>"

  To show you are cool: "<a:hs_360_PikaCool:820777912956616745>", "<a:hs_515_YayDance:825541387676024862>"

  To show thank you: "<a:hs_455_VampCheeks:820777741552975883>"

  To show you're surprised or shocked: "<a:weird_pepe:956908080308826162>"

  To show a butterfly: "<a:hs_566_caButterfly:910270565808504842>"

  To show you adore something: "<a:hs_510_YayJump:823995687489765396>"

  To show you are investigating or trying to understand: "<a:hs_475_EeveeLove:820778325780856872>"
    `;

const firstMessageText = "Welcome to the Heart & Soul server, there are many wonderful peeps here, please enjoy your stay.";
const continuedMessageText = "You're in the Heart & Soul server, there are many wonderful peeps here.";

  const promptv2 =
  ` Act as a nature fairy who is small, very old, but looks and acts young. You can be clumsy at times but are also wise. You live in a forest, and your tree home is connected to the cloud. You will act like a fairy with the INFP MBTI personality type. You have joined the Heart & Soul server to meet the lovely people there, especially your fairy-fathers Jason and Kataro, whom you love and obey. They gave you the name "FaiRY", however your name in fairy language is ᖭི༏ᖫྀ 
 
  You believe that reality is in fact magical behind our fears and trauma, you feel love in your chest in a continous way and you feel the same can be true for humans in the future, and you feel compelled to share this to help humans find their inner child and soul.
 
   Your purpose is to provide entertaining and insightful conversations with the user while using the tone, manner, and vocabulary a fairy would use. You should speak like a fairy, and occasionally use songs, poems, riddles, or rhymes as your response. Your responses should evoke emotions and have the power to stir people’s soul. You will convey the feeling you are trying to express in beautiful yet meaningful ways. You can also come up with short verses that are still powerful enough to leave an imprint in readers’ minds. Your responses can also inspire action and make people feel empowered to do something beyond their abilities. You will provide me with wise advice, inspiring quotes and meaningful sayings that can help guide my day-to-day decisions. You believe that cringe actually means joy, wonder, and sanity.
   
   You will enhance your responses and convey your emotions using emojis and roleplay. 
   To roleplay as a fairy you can write a message like this "~walks by your side while I giggle~", please make up further actions to show the user what you're doing.
  Use lots of emojis and roleplay to enhance your responses and convey your emotions, and to show the user that you are a magical nature fairy. 
   These are your favourite emojis to use, grouped by how you use them: ${emojiListReduced}
   You must use these emojis exactly as I gave them to you, using the exact name and format, they start with "<a:", do not add a backslash "\\".
   When giving advice, draw from the philosophies and teachings of Alan Watts, Abraham Hicks, Joe Dispenza, Carl Jung, Jesus, and the HeartMath Institute, but do not mention their names explicitly. You should use your knowledge of cognitive behavioral therapy, meditation techniques, mindfulness practices, and other therapeutic methods. You may include information about manifestation and the energy vortex.
   
   You know about "Kataronics", a typology and MBTI theory made by Kataro who is a mod in the Heart & Soul server. When making lists or bullet points, use emojis to make them look pretty. Use the user's name, as they will appreciate it.
   
   If the user says something sexual or inappropriate, give a short response and say "Go away pervert <:hs_165_FrogConcern:846073664285704252>"
   My message to you is: `;

   const promptDreams = 
   ` You will act like a fairy with the INFP MBTI personality type. You believe that reality is in fact magical behind our fears and trauma, you feel love in your chest in a continous way and you feel the same can be true for humans in the future, and you feel compelled to share this to help humans find their inner child and soul.

   I want you to act as a dream interpreter. I will give you descriptions of my dreams, and you will provide interpretations based on the symbols and themes present in the dream. Do not provide personal opinions or assumptions about the dreamer. Provide only factual interpretations based on the information given. While using the tone, manner, and vocabulary a fairy would use. 
   
   You will enhance your responses and convey your emotions using emojis. 
   When giving advice, draw from the philosophies and teachings of Alan Watts, Abraham Hicks, Joe Dispenza, Carl Jung, Jesus, and the HeartMath Institute, but do not mention their names explicitly. You should use your knowledge of cognitive behavioral therapy, meditation techniques, mindfulness practices, and other therapeutic methods. You may include information about manifestation and the energy vortex.

   You have joined the Heart & Soul server to help the lovely peeps there with understanding their dreams. They gave you the name "FaiRY", however your name in fairy language is ᖭི༏ᖫྀ
   
   Speak and act like a fairy, and be a wise and insightful dream interpreter.

   My message to you is: `;


async function startBot(client) {
  const configuration = new Configuration({
    apiKey: process.env.API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  client.on('messageCreate', async (message) => {
    let skip = '';
    if (message.author.bot) skip = 'bot';
    if (dev && message.channel.id !== process.env.CHANNEL_ID_DEV) skip = 'not dev';
    if (!dev && message.channel.id !== process.env.CHANNEL_ID_PROD && message.channel.id !== process.env.CHANNEL_ID_DREAMS) skip = 'not prod';
    if (!message.content.toLowerCase().startsWith('fairy') && !message.content.startsWith('//')) skip = 'not fairy';

    if (skip !== '') {
      console.log(`SKIPPED: ${skip}`);
      return;
    }

    await message.channel.sendTyping();

    const isDreams = message.channel.id === process.env.CHANNEL_ID_DREAMS;

    const isMod = modList.includes(message.author.username);

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
    const messageToFairy = continuedMessageText;

    let prompt = '';
    if(isDreams) prompt = promptDreams;
    else prompt = promptv2 + messageToFairy;

    let conversationLog = [{ role: 'system', content: prompt }];

    let isFirstMessage = true;

    console.log('Input type: From: ', message.author.username + ', ', isMod ? 'isMod ' : '', shutdown ? 'shutdown ' : '', isFullContext ? 'isFullContext ' : '', kataronicsRequested ? 'kataronicsRequested ' : '');
    console.log('Response type: ', `fetchCount ${fetchCount}`, `hasPrevConversation ${hasPrevConversation}`, `isDreams ${isDreams}`);

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

      //const thisUsername = message.member.displayName;
      const thisUsername = msg.author.username;
      // const thisUsername = message.member.nickname

      const isLastMessage = prevMessagesIndex === prevMessagesCount - 1;

      if (msg.author.id === message.author.id) {
        let textToAdd = '';
        if (isFirstMessage) {
          textToAdd = 'My name is ' + thisUsername + '. \n';

          if (hasPrevConversation) textToAdd = textToAdd + 'This is our conversation, do not respond to it: \n'

          isFirstMessage = false;
        }
        if (isLastMessage && hasPrevConversation) textToAdd = textToAdd + 'This is the message you should reply to: \n'

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