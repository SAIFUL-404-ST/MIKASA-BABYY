const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { pipeline } = require("stream");
const { promisify } = require("util");
const streamPipeline = promisify(pipeline);

const DOMAINS = [
  "facebook.com", "fb.watch", "fb.com", "youtube.com", "youtu.be",
  "tiktok.com", "instagram.com", "instagr.am", "spotify.com",
  "soundcloud.com", "twitter.com", "x.com", "pinterest.com",
  "pin.it", "likee.com", "likee.video"
];

function toSansSerifBoldItalic(str) {
  const charMap = {};
  for (let i = 0; i < 26; i++) {
    charMap[String.fromCharCode(65 + i)] = String.fromCodePoint(0x1D63C + i);
    charMap[String.fromCharCode(97 + i)] = String.fromCodePoint(0x1D656 + i);
  }
  for (let i = 0; i < 10; i++) {
    charMap[String.fromCharCode(48 + i)] = String.fromCodePoint(0x1D7EC + i);
  }
  let result = "";
  for (const ch of str) {
    result += charMap[ch] || ch;
  }
  return result;
}

module.exports = {
  config: {
    name: "autodl",
    version: "5.6",
    author: "Saif",
    role: 0,
    category: "utility",
    shortDescription: "𝐀𝐮𝐭𝐨 𝐌𝐞𝐝𝐢𝐚 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫",
    longDescription: "𝐀𝐮𝐭𝐨 𝐝𝐞𝐭𝐞𝐜𝐭 + 𝐀𝐮𝐭𝐨 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝",
    guide: { en: "𝐉𝐮𝐬𝐭 𝐬𝐞𝐧𝐝 𝐚 𝐥𝐢𝐧𝐤" }
  },

  onStart: async ({ api, event }) => {
    return api.sendMessage("Send any media link to download automatically!", event.threadID);
  },

  onChat: async ({ api, event }) => {
    const { body, threadID, messageID } = event;
    if (!body || !body.includes("http")) return;

    const isLink = DOMAINS.some(d => body.toLowerCase().includes(d));
    if (!isLink) return;

    api.setMessageReaction("⌛", messageID, () => {}, true);

    const waitMsg = await api.sendMessage(
      toSansSerifBoldItalic("Wait Bby <😘"),
      threadID
    );

    try {
      const apiUrl = `https://xsaim8x-xxx-api.onrender.com/api/auto?url=${encodeURIComponent(body)}`;
      const resData = await axios.get(apiUrl);
      const data = resData.data;

      const mediaURL = data.high_quality || data.url || (data.result && data.result.url) || (data.data && data.data.url);
      if (!mediaURL) {
        api.setMessageReaction("⚠️", messageID, () => {}, true);
        api.unsendMessage(waitMsg.messageID);
        return;
      }

      const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
      const isImage = imageExtensions.some(ext => mediaURL.toLowerCase().includes(ext));
      const isAudio = body.includes("spotify") || body.includes("soundcloud") || mediaURL.includes(".mp3");
      const ext = isImage ? mediaURL.split('.').pop().split('?')[0] : (isAudio ? "mp3" : "mp4");

      const cacheDir = path.join(__dirname, "cache");
      const filePath = path.join(cacheDir, `${Date.now()}.${ext}`);
      await fs.ensureDir(cacheDir);

      const response = await axios({
        method: "get",
        url: mediaURL,
        responseType: "stream",
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      const writer = fs.createWriteStream(filePath);
      await streamPipeline(response.data, writer);

      let platform = "Media";
      if (body.includes("facebook") || body.includes("fb")) platform = "Facebook";
      else if (body.includes("youtube") || body.includes("youtu")) platform = "YouTube";
      else if (body.includes("tiktok")) platform = "TikTok";
      else if (body.includes("instagram")) platform = "Instagram";
      else if (body.includes("spotify")) platform = "Spotify";
      else if (body.includes("soundcloud")) platform = "SoundCloud";
      else if (body.includes("twitter") || body.includes("x.com")) platform = "Twitter";
      else if (body.includes("pinterest") || body.includes("pin.it")) platform = "Pinterest";
      else if (body.includes("likee")) platform = "Likee";

      let coolMsg;
      if (isImage) {
        coolMsg = "Here's your Photo <😘";
      } else {
        coolMsg = `Here's your ${platform} ${isAudio ? "audio" : "video"} <😘`;
      }
      const styledMsg = toSansSerifBoldItalic(coolMsg);

      let shortLink = "";
      try {
        const tinyRes = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(mediaURL)}`);
        shortLink = tinyRes.data;
      } catch (e) {
        shortLink = mediaURL;
      }

      const finalMessage = `${styledMsg}\n✅ | Link: ${shortLink}`;

      // ✅ Wait message unsend করার পরই ভিডিও/ছবি সেন্ড হবে
      api.unsendMessage(waitMsg.messageID);
      api.setMessageReaction("✅", messageID, () => {}, true);

      await api.sendMessage(
        {
          body: finalMessage,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        },
        messageID
      );

    } catch (error) {
      console.error("DL Error:", error.message);
      api.setMessageReaction("❌", messageID, () => {}, true);
      api.unsendMessage(waitMsg.messageID);
      api.sendMessage(`Error: ${error.message}`, threadID, messageID);
    }
  }
};
