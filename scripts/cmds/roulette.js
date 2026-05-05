// ✨ Bold Sans-Serif Font Baby
const f = (text) => {
  if (text === undefined || text === null) return "";
  const fonts = {
    'a':'𝐚','b':'𝐛','c':'𝐜','d':'𝐝','e':'𝐞','f':'𝐟','g':'𝐠','h':'𝐡','i':'𝐢','j':'𝐣',
    'k':'𝐤','l':'𝐥','m':'𝐦','n':'𝐧','o':'𝐨','p':'𝐩','q':'𝐪','r':'𝐫','s':'𝐬','t':'𝐭',
    'u':'𝐮','v':'𝐯','w':'𝐰','x':'𝐱','y':'𝐲','z':'𝐳',
    'A':'𝐀','B':'𝐁','C':'𝐂','D':'𝐃','E':'𝐄','F':'𝐅','G':'𝐆','H':'𝐇','I':'𝐈','J':'𝐉',
    'K':'𝐊','L':'𝐋','M':'𝐌','N':'𝐍','O':'𝐎','P':'𝐏','Q':'𝐐','R':'𝐑','S':'𝐒','T':'𝐓',
    'U':'𝐔','V':'𝐕','W':'𝐖','X':'𝐗','Y':'𝐘','Z':'𝐙',
    '0':'𝟎','1':'𝟏','2':'𝟐','3':'𝟑','4':'𝟒','5':'𝟓','6':'𝟔','7':'𝟕','8':'𝟖','9':'𝟗',
    '.':'.', ':':':', '/':'/'
  };
  return String(text).split('').map(c => fonts[c] || c).join('');
};

// 💰 Standard Shorthand Parser Baby (Complete Edition)
const parseAmount = (str) => {
  if (!str) return NaN;
  str = str.toLowerCase().replace(/\s+/g, "");
  const suffixes = {
    vg: 1e63, nod: 1e60, ocd: 1e57, spd: 1e54, sxd: 1e51, qid: 1e48, qad: 1e45,
    td: 1e42, dd: 1e39, ud: 1e36, dc: 1e33, no: 1e30, oc: 1e27, sp: 1e24,
    sx: 1e21, qi: 1e18, qa: 1e15, t: 1e12, b: 1e9, m: 1e6, k: 1e3
  };
  let matched = Object.keys(suffixes).sort((a, b) => b.length - a.length).find(suf => str.endsWith(suf));
  let multiplier = matched ? suffixes[matched] : 1;
  if (matched) str = str.slice(0, -matched.length);
  let num = parseFloat(str);
  return isNaN(num) ? NaN : num * multiplier;
};

// 🏦 Standard Shorthand Formatter Baby (Complete Edition)
function formatMoney(num) {
  if (num === undefined || num === null || isNaN(num)) return "0";
  const suffixes = [
    { value: 1e63, symbol: "𝐕𝐠" }, { value: 1e60, symbol: "𝐍𝐨𝐝" },
    { value: 1e57, symbol: "𝐎𝐜𝐝" }, { value: 1e54, symbol: "𝐒𝐩𝐝" },
    { value: 1e51, symbol: "𝐒𝐱𝐝" }, { value: 1e48, symbol: "𝐐𝐢𝐝" },
    { value: 1e45, symbol: "𝐐𝐚𝐝" }, { value: 1e42, symbol: "𝐓𝐝" },
    { value: 1e39, symbol: "𝐃𝐝" },  { value: 1e36, symbol: "𝐔𝐝" },
    { value: 1e33, symbol: "𝐃𝐜" },  { value: 1e30, symbol: "𝐍𝐨" },
    { value: 1e27, symbol: "𝐎𝐜" },  { value: 1e24, symbol: "𝐒𝐩" },
    { value: 1e21, symbol: "𝐒𝐱" },  { value: 1e18, symbol: "𝐐𝐢" },
    { value: 1e15, symbol: "𝐐𝐚" },  { value: 1e12, symbol: "𝐓" },
    { value: 1e9,  symbol: "𝐁" },   { value: 1e6,  symbol: "𝐌" },
    { value: 1e3,  symbol: "𝐊" }
  ];
  for (const s of suffixes) {
    if (Math.abs(num) >= s.value) return f((num / s.value).toFixed(2)) + s.symbol;
  }
  return f(Math.floor(num).toString());
}

// 🎡 রুলেট চাকার ইমোজি ও সংখ্যা
const rouletteNumbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36,
  11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9,
  22, 18, 29, 7, 28, 12, 35, 3, 26
]; // ইউরোপিয়ান রুলেট অর্ডার
const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
function isRed(num) { return redNumbers.includes(num); }
const wheelEmoji = "🎡";

// 🎬 বিল্ড ফ্রেম ফাংশন (wheel style)
function buildFrame(betAmount, betType, betValue, resultNum, status) {
  const line1 = `🎡 ${f("ROULETTE — BABY")}`;
  const line2 = `━━━━━━━━━━━━━━━━━━━`;
  const betInfo = `💵 ${f("Bet:")} ${formatMoney(betAmount)}  🎯 ${f("On:")} ${f(betType === 'number' ? `Number ${betValue}` : betValue)}`;
  
  let wheelSpinLine = "";
  if (status === "spinning") {
    wheelSpinLine = `🌀 ${f("Wheel spinning... [")} ${f(resultNum)} ${f("]")}`;
  } else if (status === "result") {
    const color = isRed(resultNum) ? "🔴" : (resultNum === 0 ? "🟢" : "⚫");
    wheelSpinLine = `${wheelEmoji} ${f("Landed on:")} ${color} ${f(resultNum)}`;
  }
  
  return `${line1}\n${line2}\n${betInfo}\n${wheelSpinLine}`;
}

const delay = (ms) => new Promise(r => setTimeout(r, ms));

module.exports = {
  config: {
    name: "roulette",
    aliases: ["rl", "rlt"],
    version: "1.0",
    author: "Saif",
    category: "game",
    countDown: 20,
    description: "🎡 European Roulette — Bet on number or color Baby",
    guide: "{pn} <amount> <red/black/number>\nExample: rl 10k red, rl 5m 17"
  },

  onStart: async function({ api, event, args, usersData, role }) {
    const { senderID, threadID, messageID, mentions, messageReply } = event;
    const now = Date.now();
    
    // 👑 Admin Refresh
    if (args[0] === "refresh" && role >= 2) {
      let targetID = messageReply ? messageReply.senderID : 
        (Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : args[1]);
      if (!targetID) return api.sendMessage(f("❌ Usage: roulette refresh @tag or UID Baby"), threadID, messageID);
      let tData = await usersData.get(targetID);
      if (!tData.data) tData.data = {};
      tData.data.rouletteLimit = { lastReset: now, count: 0 };
      await usersData.set(targetID, { data: tData.data });
      return api.sendMessage(f("✅ Roulette limit refreshed Baby! 🎀"), threadID, messageID);
    }
    
    // 👤 User Data
    const userData = await usersData.get(senderID);
    if (!userData.data) userData.data = {};
    
    // 📖 First time rules
    if (!userData.data.rouletteSeen) {
      userData.data.rouletteSeen = true;
      await usersData.set(senderID, { data: userData.data });
      return api.sendMessage(
        `🎡 ${f("ROULETTE — RULES BABY")}\n` +
        `━━━━━━━━━━━━━━━━━━━\n\n` +
        `📌 ${f("How To Play:")}\n` +
        f("Command: roulette [amount] [bet]\n") +
        f("Bet Types:\n") +
        `🔢 ${f("Number (0-36):")} Win = ${f("35x")} your bet\n` +
        `🔴⚫ ${f("Color (red/black):")} Win = ${f("2x")} your bet\n\n` +
        f("Example: roulette 5m red\n") +
        f("         roulette 2m 17\n\n") +
        `⏰ ${f("Daily Limit: 20 bets / 12 hours\n")}` +
        `⚠️ ${f("Bet over $10M → Auto Lose (Penalty)!")}\n` +
        f("Keep your bet under $10M Baby.\n\n") +
        `✅ ${f("Now type roulette [amount] [bet] to play Baby.")}`,
        threadID, messageID
      );
    }
    
    // 🕐 12h limit reset
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    if (!userData.data.rouletteLimit || !userData.data.rouletteLimit.lastReset) {
      userData.data.rouletteLimit = { lastReset: now, count: 0 };
    } else if (now - userData.data.rouletteLimit.lastReset >= TWELVE_HOURS) {
      userData.data.rouletteLimit = { lastReset: now, count: 0 };
    }
    
    if (userData.data.rouletteLimit.count >= 20) {
      const timeLeft = TWELVE_HOURS - (now - userData.data.rouletteLimit.lastReset);
      const h = Math.floor(timeLeft / 3600000);
      const m = Math.floor((timeLeft % 3600000) / 60000);
      return api.sendMessage(f(`⚠️ Limit reached! 20/20 bets used.\n⏰ Reset in: ${h}h ${m}m Baby.`), threadID, messageID);
    }
    
    // 💵 Parse bet amount
    const betAmount = parseAmount(args[0]);
    if (isNaN(betAmount) || betAmount <= 0)
      return api.sendMessage(f("❌ Invalid amount! Usage: roulette [amount] [bet]"), threadID, messageID);
    if (betAmount > userData.money)
      return api.sendMessage(f("💰 Not enough balance! You have: ") + formatMoney(userData.money || 0), threadID, messageID);
    
    // 🎯 Parse bet type: number or red/black
    const betInput = args[1]?.toLowerCase();
    let betType, betValue;
    const num = parseInt(betInput);
    if (!isNaN(num) && num >= 0 && num <= 36) {
      betType = "number";
      betValue = num;
    } else if (betInput === "red" || betInput === "black") {
      betType = "color";
      betValue = betInput;
    } else {
      return api.sendMessage(f("❌ Invalid bet! Use a number (0-36) or 'red'/'black'."), threadID, messageID);
    }
    
    // ⚠️ Bet Cap Penalty (>10M)
    const BET_CAP = 10_000_000;
    if (betAmount > BET_CAP) {
      userData.money -= betAmount;
      userData.data.rouletteLimit.count += 1;
      await usersData.set(senderID, { money: userData.money, data: userData.data });
      return api.sendMessage(
        `🎡 ${f("ROULETTE — BABY")}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `⚠️ ${f("PENALTY — Bet over $10M!")}\n` +
        `💥 ${f("Ball fell off the wheel... Auto lose!")}\n\n` +
        `❌ ${f("Lost:")} ${formatMoney(betAmount)}\n` +
        `💰 ${f("Balance:")} ${formatMoney(userData.money)}\n` +
        `📈 ${f("Daily:")} ${f(String(userData.data.rouletteLimit.count))}/𝟐𝟎 ${f("Baby")}\n\n` +
        `⚠️ ${f("Keep bet under $10M Baby!")}`,
        threadID, messageID
      );
    }
    
    // 🎡 Generate result
    const resultNumber = rouletteNumbers[Math.floor(Math.random() * rouletteNumbers.length)];
    let won = false;
    if (betType === "number") {
      won = (betValue === resultNumber);
    } else { // color
      if (resultNumber === 0) won = false; // zero is green -> no color win
      else if (betValue === "red") won = isRed(resultNumber);
      else won = !isRed(resultNumber); // black
    }
    
    const multiplier = betType === "number" ? 35 : 2;
    const winnings = won ? betAmount * (multiplier - 1) : -betAmount; // net gain
    
    // 🎬 Animation frames
    const sent = await api.sendMessage(
      buildFrame(betAmount, betType, betValue, "?", "spinning"),
      threadID, messageID
    );
    const mid = sent.messageID;
    
    // Show 3 random numbers spinning
    for (let i = 0; i < 3; i++) {
      const fakeNum = Math.floor(Math.random() * 37);
      await delay(800);
      await api.editMessage(
        buildFrame(betAmount, betType, betValue, fakeNum, "spinning"),
        mid
      );
    }
    
    await delay(800);
    
    // Update balance
    userData.money += winnings;
    userData.data.rouletteLimit.count += 1;
    await usersData.set(senderID, { money: userData.money, data: userData.data });
    
    // Final result frame
    const finalFrame = buildFrame(betAmount, betType, betValue, resultNumber, "result") +
      `\n\n` +
      (won 
        ? `✅ ${f("YOU WON")} ${formatMoney(Math.abs(winnings))} ${f(`(${multiplier}x) 🎉`)}` 
        : `❌ ${f("YOU LOST")} ${formatMoney(betAmount)}`) +
      `\n💰 ${f("Balance:")} ${formatMoney(userData.money)}` +
      `\n📈 ${f("Daily:")} ${f(String(userData.data.rouletteLimit.count))}/𝟐𝟎 ${f("Baby")}`;
    
    await api.editMessage(finalFrame, mid);
  }
};
