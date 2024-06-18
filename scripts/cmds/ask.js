const axios = require('axios');

async function fetchFromAI(url, params) {
  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getAIResponse(input, userId, messageID) {
  const services = [
    { url: 'https://ai-tools.replit.app/gpt', params: { prompt: input, uid: userId } },
    { url: 'https://openaikey-x20f.onrender.com/api', params: { prompt: input } },
    { url: 'http://fi1.bot-hosting.net:6518/gpt', params: { query: input } },
    { url: 'https://ai-chat-gpt-4-lite.onrender.com/api/hercai', params: { question: input } }
  ];

  let response = "𝐒𝐚𝐥𝐮𝐭(.!.) 𝐦𝐨𝐢 𝐜'𝐞𝐬𝐭 𝗥𝗘𝗭 , 𝐭𝐮 𝐯𝐞𝐮𝐱 𝐝𝐞𝐬 𝐫𝐞́𝐩𝐨𝐧𝐬𝐞𝐬 𝐝𝐞 𝐜𝐨𝐦𝐩𝐞̀𝐭 𝐚̀ 𝐭𝐞𝐬 𝐪𝐮𝐞𝐬𝐭𝐢𝐨𝐧𝐬, 𝐣𝐞 𝐬𝐮𝐢𝐬 𝐥𝐞 𝐛𝐨𝐭 𝐩𝐚𝐫𝐟𝐚𝐢𝐭 😁";
  let currentIndex = 0;

  for (let i = 0; i < services.length; i++) {
    const service = services[currentIndex];
    const data = await fetchFromAI(service.url, service.params);
    if (data && (data.gpt4 || data.reply || data.response)) {
      response = data.gpt4 || data.reply || data.response;
      break;
    }
    currentIndex = (currentIndex + 1) % services.length; // Move to the next service in the cycle
  }

  return { response, messageID };
}

module.exports = {
  config: {
    name: 'ai',
    author: 'hamed',
    role: 0,
    category: 'rez',
    shortDescription: 'ai to ask anything',
  },
  onStart: async function ({ api, event, args }) {
    const input = args.join(' ').trim();
    if (!input) {
      api.sendMessage(`━━━━━✰✰.-.✰✰━━━━━\n━━━━━✰✰.-.✰✰━━━━━ Please provide a question or statement.\n`, event.threadID, event.messageID);
      return;
    }

    const { response, messageID } = await getAIResponse(input, event.senderID, event.messageID);
    api.sendMessage(` \n━━━━━✰✰.-.✰✰━━━━━ \n${response}\n
━━━━━✰✰.-.✰✰━━━━━`, event.threadID, messageID);
  },
  onChat: async function ({ event, message }) {
    const messageContent = event.body.trim().toLowerCase();
    if (messageContent.startsWith("ai")) {
      const input = messageContent.replace(/^ai\s*/, "").trim();
      const { response, messageID } = await getAIResponse(input, event.senderID, message.messageID);
      message.reply(`

\n      ✰.....𝗯𝗯 𝗿𝗮𝗰𝗶𝗻𝗴.....✰ 🏁
⊰᯽⊱┈──╌❊❊╌──┈⊰᯽⊱
\n${response}🎵🎶\n
⊰᯽⊱┈──╌❊❊╌──┈⊰᯽⊱`, messageID);
    }
  }
};
