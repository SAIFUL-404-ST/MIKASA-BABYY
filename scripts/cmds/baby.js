const axios = require('axios');

const baseApiUrl = async () => {
  return "https://noobs-api.top/dipto";
};

module.exports.config = {
  name: "bby",
  aliases: ["baby", "bbe", "babe", "sam"],
  version: "6.9.0",
  author: "dipto",
  countDown: 0,
  role: 0,
  description: "better then all sim simi",
  category: "chat",
  guide: {
    en: "{pn} [anyMessage]"
  }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
  const link = `${await baseApiUrl()}/baby`;
  const dipto = args.join(" ").toLowerCase();
  const uid = event.senderID;
  let command, comd, final;

  try {

    if (!args[0]) {
      const ran = ["Bolo baby", "hum", "type help baby", "type !baby hi"];
      return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
    }

    if (args[0] === 'remove') {
      const fina = dipto.replace("remove ", "");
      const dat = (await axios.get(`${link}?remove=${fina}&senderID=${uid}`)).data.message;
      return api.sendMessage(dat, event.threadID, event.messageID);
    }

    if (args[0] === 'rm' && dipto.includes('-')) {
      const [fi, f] = dipto.replace("rm ", "").split(/\s*-\s*/);
      const da = (await axios.get(`${link}?remove=${fi}&index=${f}`)).data.message;
      return api.sendMessage(da, event.threadID, event.messageID);
    }

    if (args[0] === 'list') {
      const d = (await axios.get(`${link}?list=all`)).data;
      return api.sendMessage(`❇️ | Total Teach = ${d.length || "api off"}\n♻️ | Total Response = ${d.responseLength || "api off"}`, event.threadID, event.messageID);
    }

    if (args[0] === 'msg') {
      const fuk = dipto.replace("msg ", "");
      const d = (await axios.get(`${link}?list=${fuk}`)).data.data;
      return api.sendMessage(`Message ${fuk} = ${d}`, event.threadID, event.messageID);
    }

    if (args[0] === 'edit') {
      const command = dipto.split(/\s*-\s*/)[1];
      const dA = (await axios.get(`${link}?edit=${args[1]}&replace=${command}&senderID=${uid}`)).data.message;
      return api.sendMessage(`changed ${dA}`, event.threadID, event.messageID);
    }

    if (args[0] === 'teach') {
      [comd, command] = dipto.split(/\s*-\s*/);
      final = comd.replace("teach ", "");
      const re = await axios.get(`${link}?teach=${final}&reply=${command}&senderID=${uid}&threadID=${event.threadID}`);
      const tex = re.data.message;
      return api.sendMessage(`✅ Replies added ${tex}`, event.threadID, event.messageID);
    }

    const d = (await axios.get(`${link}?text=${dipto}&senderID=${uid}&font=1`)).data.reply;

    api.sendMessage(d, event.threadID, (error, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID
      });
    }, event.messageID);

  } catch (e) {
    console.log(e);
    api.sendMessage("Check console for error", event.threadID, event.messageID);
  }
};

module.exports.onReply = async ({ api, event }) => {
  try {

    const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(event.body?.toLowerCase())}&senderID=${event.senderID}&font=1`)).data.reply;

    await api.sendMessage(a, event.threadID, (error, info) => {

      global.GoatBot.onReply.set(info.messageID, {
        commandName: "bby",
        type: "reply",
        messageID: info.messageID,
        author: event.senderID
      });

    }, event.messageID);

  } catch (err) {
    return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.onChat = async ({ api, event, message }) => {
  try {

    const body = event.body ? event.body.toLowerCase() : "";

    if (
      body.startsWith("baby") ||
      body.startsWith("bby") ||
      body.startsWith("bot") ||
      body.startsWith("jan") ||
      body.startsWith("janu") ||
      body.startsWith("mikasa") ||
      body.startsWith("hi") ||
      body.startsWith("hello") ||
      body.startsWith("জান") ||
      body.startsWith("bbu") ||
      body.startsWith("বট")
    ) {

      const arr = body.replace(/^\S+\s*/, "");

      const randomReplies = [
        "হুম বলো জান 😍",
        "শুধু মাত্র ভদ্রতার খাতিরেই  নাড়িদের সাথে চলাফেরা করি, নইলে পুরুষ সঙি সর্বদাই পছন্দনীয়  🦆",
        "Yes baby I am here",
        "কি দরকার?",
        "কি বলবা বলো আমি শুনতেছি 👂",
        "Yes Madam 🐥",
        " tuki 👀",
        "কি খবর?",
        "ধুর কানা 😐",
        "Hi",
        "আতা গাছে তোতা পাখি নাড়িকেল গাছে ডাব, আমি তোরে বিয়ে করমু কি করবে তোর বাপ 😼",
        "কিরে ছাপরি 🤡🤡",
        "তোর কথা কেউ শুনে না আমি কেন শুনবো 😹",
        "তোর কথা কেউ শুনে না আমি কেন সুনবো 😂",
        "Over acting er Jnno 5 Tk kata 🐤",
        "Yes mikasa here",
        "🐤🐤🐤🐤",
        "আমি শুনতেছি 👀",
        "Kire vuski Dakis ken? ",
        "৩৩ তারিখ আমার বিয়ে 🐤"
      ];

      if (!arr) {

        const msg = randomReplies[Math.floor(Math.random() * randomReplies.length)];

        return api.sendMessage(msg, event.threadID, (error, info) => {

          api.setMessageReaction("😍", event.messageID, () => {}, true);

          global.GoatBot.onReply.set(info.messageID, {
            commandName: "bby",
            type: "reply",
            messageID: info.messageID,
            author: event.senderID
          });

        }, event.messageID);

      }

      const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(arr)}&senderID=${event.senderID}&font=1`)).data.reply;

      return api.sendMessage(a, event.threadID, (error, info) => {

        api.setMessageReaction("😍", event.messageID, () => {}, true);

        global.GoatBot.onReply.set(info.messageID, {
          commandName: "bby",
          type: "reply",
          messageID: info.messageID,
          author: event.senderID
        });

      }, event.messageID);

    }

  } catch (err) {
    return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};
