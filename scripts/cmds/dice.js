// ✨ ফ্যান্সি ফন্ট হেল্পার (বোল্ড সেরিফ)
const fancy = (text) => {
  if (text === undefined || text === null) return "";
  const fonts = {
    'a': '𝐚','b': '𝐛','c': '𝐜','d': '𝐝','e': '𝐞','f': '𝐟','g': '𝐠','h': '𝐡','i': '𝐢','j': '𝐣','k': '𝐤','l': '𝐥','m': '𝐦','n': '𝐧','o': '𝐨','p': '𝐩','q': '𝐪','r': '𝐫','s': '𝐬','t': '𝐭','u': '𝐮','v': '𝐯','w': '𝐰','x': '𝐱','y': '𝐲','z': '𝐳',
    'A': '𝐀','B': '𝐁','C': '𝐂','D': '𝐃','E': '𝐄','F': '𝐅','G': '𝐆','H': '𝐇','I': '𝐈','J': '𝐉','K': '𝐊','L': '𝐋','M': '𝐌','N': '𝐍','O': '𝐎','P': '𝐏','Q': '𝐐','R': '𝐑','S': '𝐒','T': '𝐓','U': '𝐔','V': '𝐕','W': '𝐖','X': '𝐗','Y': '𝐘','Z': '𝐙',
    '0': '𝟎','1': '𝟏','2': '𝟐','3': '𝟑','4': '𝟒','5': '𝟓','6': '𝟔','7': '𝟕','8': '𝟖','9': '𝟗', '.': '.'
  };
  return String(text).split('').map(char => fonts[char] || char).join('');
};

// 💰 স্ট্যান্ডার্ড শর্টহ্যান্ড পার্সার (ভিজিন্টিলিয়ন পর্যন্ত)
const parseShorthand = (str) => {
  if (!str) return NaN;
  str = str.toLowerCase().replace(/\s+/g, "");
  const map = {
    vg: 1e63, nod: 1e60, ocd: 1e57, spd: 1e54, sxd: 1e51, qid: 1e48, qad: 1e45,
    td: 1e42, dd: 1e39, ud: 1e36, dc: 1e33, no: 1e30, oc: 1e27, sp: 1e24,
    sx: 1e21, qi: 1e18, qa: 1e15, t: 1e12, b: 1e9, m: 1e6, k: 1e3
  };
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  for (let key of keys) {
    if (str.endsWith(key)) {
      let num = parseFloat(str.slice(0, -key.length));
      return isNaN(num) ? NaN : num * map[key];
    }
  }
  return parseFloat(str);
};

// 🏦 স্ট্যান্ডার্ড শর্টহ্যান্ড ফরম্যাটার (বড় সংখ্যা দেখানোর জন্য)
function formatMoney(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "0";
  const units = [
    { v: 1e63, s: "𝐕𝐠" }, { v: 1e60, s: "𝐍𝐨𝐝" }, { v: 1e57, s: "𝐎𝐜𝐝" },
    { v: 1e54, s: "𝐒𝐩𝐝" }, { v: 1e51, s: "𝐒𝐱𝐝" }, { v: 1e48, s: "𝐐𝐢𝐝" },
    { v: 1e45, s: "𝐐𝐚𝐝" }, { v: 1e42, s: "𝐓𝐝" }, { v: 1e39, s: "𝐃𝐝" },
    { v: 1e36, s: "𝐔𝐝" }, { v: 1e33, s: "𝐃𝐜" }, { v: 1e30, s: "𝐍𝐨" },
    { v: 1e27, s: "𝐎𝐜" }, { v: 1e24, s: "𝐒𝐩" }, { v: 1e21, s: "𝐒𝐱" },
    { v: 1e18, s: "𝐐𝐢" }, { v: 1e15, s: "𝐐𝐚" }, { v: 1e12, s: "𝐓" },
    { v: 1e9, s: "𝐁" }, { v: 1e6, s: "𝐌" }, { v: 1e3, s: "𝐊" }
  ];
  for (let u of units) {
    if (Math.abs(amount) >= u.v) return fancy((amount / u.v).toFixed(2)) + u.s;
  }
  return fancy(Math.floor(amount).toLocaleString());
}

const diceEmojis = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"]; // ১-৬

module.exports = {
  config: {
    name: "dice",
    aliases: ["roll"],
    version: "3.0",
    author: "SAIF",
    category: "game",
    countDown: 5,
    description: "🎲 𝐋𝐔𝐂𝐊𝐘 𝐃𝐈𝐂𝐄 — 𝐖𝐇𝐄𝐄𝐋-𝐒𝐓𝐘𝐋𝐄 𝐁𝐀𝐁𝐘",
    longDescription: "বেট করো, বট ডাইস রোল করবে। জ্যাকপট ৩x, ডাবল ২x, নো ম্যাচ লস। বড় বেট (>10M) ফোর্স লস।",
    guide: "{pn} <amount> — যেমন {pn} 5m"
  },

  onStart: async function({ api, event, args, usersData }) {
    const { senderID, threadID, messageID } = event;

    // 👤 ইউজার ডাটা
    let userData = await usersData.get(senderID);
    if (!userData) userData = { money: 0 };

    // 💵 বেট পার্স ও ভ্যালিডেশন
    const betInput = args[0];
    const betAmount = parseShorthand(betInput);

    if (isNaN(betAmount) || betAmount <= 0)
      return api.sendMessage(fancy("⚠️ ENTER A VALID AMOUNT."), threadID, messageID);
    if (userData.money < betAmount)
      return api.sendMessage(fancy("💰 NOT ENOUGH BALANCE."), threadID, messageID);

    // 🎯 জেনারেট রেজাল্ট (wheel-এর মতো %)
    const BET_CAP = 10_000_000;
    let userDice, botDice, winnings, multiplier;

    if (betAmount > BET_CAP) {
      // ফোর্স লস: বেটের ৫০-৯০% কেটে নেওয়া
      const lossPercent = [50, 60, 80, 90][Math.floor(Math.random() * 4)];
      do {
        userDice = Math.floor(Math.random() * 6) + 1;
        botDice = Math.floor(Math.random() * 6) + 1;
      } while (userDice === botDice); // নো ম্যাচ
      winnings = -(betAmount * lossPercent / 100);
      multiplier = 0;
    } else {
      const roll = Math.random();
      if (roll < 0.05) {
        // ৫% জ্যাকপট: দুটো ৬ → ৩x
        userDice = 6;
        botDice = 6;
        multiplier = 3;
        winnings = betAmount * multiplier;
      } else if (roll < 0.45) {
        // ৪০% ডাবল: একই সংখ্যা (কিন্তু ৬ না)
        const num = Math.floor(Math.random() * 5) + 1; // ১-৫
        userDice = num;
        botDice = num;
        multiplier = 2;
        winnings = betAmount * multiplier;
      } else {
        // ৫৫% লস: কোনও মিল নেই
        do {
          userDice = Math.floor(Math.random() * 6) + 1;
          botDice = Math.floor(Math.random() * 6) + 1;
        } while (userDice === botDice);
        multiplier = 0;
        winnings = -betAmount;
      }
    }

    const isWin = winnings > 0;

    // 🎬 অ্যানিমেশন (মেসেজ এডিট ৩ বার = ৪টি ফ্রেম)
    const initMsg = await api.sendMessage(
      `>🎀\n• ${fancy("Dice Rolling:")} [ ❓ | ❓ ]`,
      threadID, messageID
    );
    const mid = initMsg.messageID;
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    try {
      // ফ্রেম ১: বটের ডাইস লক (ইউজার এখনও ❓)
      await sleep(1600);
      await api.editMessage(
        `>🎀\n• ${fancy("Dice Rolling:")} [ ❓ | ${diceEmojis[botDice-1]} ]`,
        mid
      );

      // ফ্রেম ২: ইউজারের ডাইস লক
      await sleep(1600);
      await api.editMessage(
        `>🎀\n• ${fancy("Dice Rolling:")} [ ${diceEmojis[userDice-1]} | ${diceEmojis[botDice-1]} ]`,
        mid
      );

      // ফাইনাল ফ্রেম: ফলাফল + ব্যালেন্স
      await sleep(1600);
      const amtFormatted = formatMoney(Math.abs(winnings));
      const statusText = isWin
        ? (multiplier === 3 ? fancy("🎉 JACKPOT WON") : fancy("🎈 DOUBLE WON"))
        : betAmount > BET_CAP 
          ? fancy("💸 FORCE LOST") 
          : fancy("😞 LOST");

      const balance = userData.money + winnings; // আগের থেকে বিয়োগ করা
      await usersData.set(senderID, { money: balance });

      await api.editMessage(
        `>🎀\n` +
        `• ${fancy("Baby, You")} ${statusText} $${amtFormatted}\n` +
        `• ${fancy("Your Dice:")} ${diceEmojis[userDice-1]}\n` +
        `• ${fancy("Bot Dice:")} ${diceEmojis[botDice-1]}\n` +
        `• ${fancy("Balance:")} ${formatMoney(balance)}`,
        mid
      );
    } catch (e) {
      console.error("[dice] edit error:", e);
    }
  }
};
