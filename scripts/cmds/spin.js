// 💰 Standard Shorthand Parser Baby (Complete Edition)
const parseShorthand = (str) => {
  if (!str) return NaN;
  str = str.toLowerCase().replace(/\s+/g, "");
  const map = {
    vg: 1e63, nod: 1e60, ocd: 1e57, spd: 1e54, sxd: 1e51, qid: 1e48, qad: 1e45,
    td: 1e42, dd: 1e39, ud: 1e36, dc: 1e33, no: 1e30, oc: 1e27, sp: 1e24,
    sx: 1e21, qi: 1e18, qa: 1e15, t: 1e12, b: 1e9, m: 1e6, k: 1e3
  };
  let suffix = Object.keys(map).sort((a, b) => b.length - a.length).find(s => str.endsWith(s));
  let multiplier = suffix ? map[suffix] : 1;
  if (suffix) str = str.slice(0, -suffix.length);
  const number = parseFloat(str);
  return isNaN(number) ? NaN : number * multiplier;
};

// ✨ Fancy Font Baby - Bold Sans-Serif Style
function fancy(text) {
  if (text === undefined || text === null) return "";
  const map = {
    'a': '𝐚','b': '𝐛','c': '𝐜','d': '𝐝','e': '𝐞','f': '𝐟','g': '𝐠','h': '𝐡','i': '𝐢','j': '𝐣','k': '𝐤','l': '𝐥','m': '𝐦','n': '𝐧','o': '𝐨','p': '𝐩','q': '𝐪','r': '𝐫','s': '𝐬','t': '𝐭','u': '𝐮','v': '𝐯','w': '𝐰','x': '𝐱','y': '𝐲','z': '𝐳',
    'A': '𝐀','B': '𝐁','C': '𝐂','D': '𝐃','E': '𝐄','F': '𝐅','G': '𝐆','H': '𝐇','I': '𝐈','J': '𝐉','K': '𝐊','L': '𝐋','M': '𝐌','N': '𝐍','O': '𝐎','P': '𝐏','Q': '𝐐','R': '𝐑','S': '𝐒','T': '𝐓','U': '𝐔','V': '𝐕','W': '𝐖','X': '𝐗','Y': '𝐘','Z': '𝐙',
    '0': '𝟎','1': '𝟏','2': '𝟐','3': '𝟑','4': '𝟒','5': '𝟓','6': '𝟔','7': '𝟕','8': '𝟖','9': '𝟗', '.': '.', ':': ':', '/': '/', '%': '%', '(': '(', ')': ')', '-': '-', '_': '_'
  };
  return String(text).split('').map(char => map[char] || char).join('');
}

// 🏦 Standard Shorthand Formatter Baby - Complete Edition
function formatMoney(num) {
  if (num === undefined || num === null || isNaN(num)) return "0";
  const negative = num < 0;
  num = Math.abs(num);
  const units = [
    { v: 1e63, s: "𝐕𝐠" }, { v: 1e60, s: "𝐍𝐨𝐝" }, { v: 1e57, s: "𝐎𝐜𝐝" },
    { v: 1e54, s: "𝐒𝐩𝐝" }, { v: 1e51, s: "𝐒𝐱𝐝" }, { v: 1e48, s: "𝐐𝐢𝐝" },
    { v: 1e45, s: "𝐐𝐚𝐝" }, { v: 1e42, s: "𝐓𝐝" }, { v: 1e39, s: "𝐃𝐝" },
    { v: 1e36, s: "𝐔𝐝" }, { v: 1e33, s: "𝐃𝐜" }, { v: 1e30, s: "𝐍𝐨" },
    { v: 1e27, s: "𝐎𝐜" }, { v: 1e24, s: "𝐒𝐩" }, { v: 1e21, s: "𝐒𝐱" },
    { v: 1e18, s: "𝐐𝐢" }, { v: 1e15, s: "𝐐𝐚" }, { v: 1e12, s: "𝐓" },
    { v: 1e9, s: "𝐁" }, { v: 1e6, s: "𝐌" }, { v: 1e3, s: "𝐊" }
  ];
  for (const u of units) {
    if (num >= u.v) return (negative ? "-" : "") + fancy((num / u.v).toFixed(2)) + u.s;
  }
  return (negative ? "-" : "") + fancy(Math.floor(num).toLocaleString());
}

// ⏳ Small sleep helper Baby
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 📅 Date helpers Baby
function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function formatDate(ts) {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

// 📊 Fresh stats object Baby
function freshStats(now) {
  return {
    firstPlayed: now,
    totalGames: 0,
    todayKey: dayKey(now),
    todayGames: 0,
    todayWins: 0,
    wins: 0,
    losses: 0,
    doubleWins: 0,
    jackpots: 0,
    totalWagered: 0,
    totalWon: 0,
    totalLost: 0,
    biggestBet: 0,
    biggestWin: 0,
    currentStreak: 0,
    bestStreak: 0,
    history: [] // { result: 'win'|'jackpot'|'loss', amount, symbols, time }
  };
}

// 🔧 Make sure stats exist + roll today counter Baby
function ensureStats(user, now) {
  if (!user.data.spinStats) user.data.spinStats = freshStats(now);
  const stats = user.data.spinStats;
  if (stats.todayKey !== dayKey(now)) {
    stats.todayKey = dayKey(now);
    stats.todayGames = 0;
    stats.todayWins = 0;
  }
  return stats;
}

// 📈 Record a played round into stats Baby
function recordRound(stats, { isWin, isJackpot, betAmount, winnings, symbols, now }) {
  stats.totalGames += 1;
  stats.todayGames += 1;
  stats.totalWagered += betAmount;
  if (betAmount > stats.biggestBet) stats.biggestBet = betAmount;

  if (isWin) {
    stats.wins += 1;
    stats.todayWins += 1;
    stats.totalWon += winnings;
    if (winnings > stats.biggestWin) stats.biggestWin = winnings;
    if (isJackpot) stats.jackpots += 1; else stats.doubleWins += 1;
    stats.currentStreak = stats.currentStreak >= 0 ? stats.currentStreak + 1 : 1;
  } else {
    stats.losses += 1;
    stats.totalLost += Math.abs(winnings);
    stats.currentStreak = stats.currentStreak <= 0 ? stats.currentStreak - 1 : -1;
  }
  if (Math.abs(stats.currentStreak) > Math.abs(stats.bestStreak)) stats.bestStreak = stats.currentStreak;

  stats.history.unshift({
    result: isJackpot ? "jackpot" : isWin ? "win" : "loss",
    amount: isWin ? winnings : Math.abs(winnings),
    symbols,
    time: now
  });
  if (stats.history.length > 10) stats.history.length = 10;
}

// 🖼️ Build the "spin info" card Baby — player database only
function buildInfoCard(stats) {
  const winRate = stats.totalGames > 0 ? ((stats.wins / stats.totalGames) * 100).toFixed(1) : "0.0";
  const netProfit = stats.totalWon - stats.totalLost;
  const avgBet = stats.totalGames > 0 ? stats.totalWagered / stats.totalGames : 0;
  const avgWin = stats.wins > 0 ? stats.totalWon / stats.wins : 0;
  const avgLoss = stats.losses > 0 ? stats.totalLost / stats.losses : 0;

  const historyLines = stats.history.length
    ? stats.history.map((h, i) => {
        const tag = h.result === "jackpot" ? "🎉" : h.result === "win" ? "✅" : "❌";
        const sign = h.result === "loss" ? "-" : "+";
        return `${i + 1}. ${tag} ${sign}$${formatMoney(h.amount)}  [ ${h.symbols.join(" | ")} ]`;
      }).join("\n")
    : fancy("No games played yet.");

  return (
    "🎰 " + fancy("SPIN — YOUR INFO BABY") + "\n" +
    "━━━━━━━━━━━━━━━━━━━\n\n" +
    fancy("📊 Your Database:") + "\n" +
    "• " + fancy("First Played:") + " " + fancy(formatDate(stats.firstPlayed)) + "\n" +
    "• " + fancy("Total Games:") + " " + fancy(stats.totalGames) + "\n" +
    "• " + fancy("Today Games:") + " " + fancy(stats.todayGames) + "\n" +
    "• " + fancy("Wins/Losses:") + " " + fancy(stats.wins) + "/" + fancy(stats.losses) + "\n" +
    "• " + fancy("Win Rate:") + " " + fancy(winRate) + "%\n" +
    "• " + fancy("Double Wins:") + " " + fancy(stats.doubleWins) + "\n" +
    "• " + fancy("Jackpots:") + " " + fancy(stats.jackpots) + "\n" +
    "• " + fancy("Total Won:") + " $" + formatMoney(stats.totalWon) + "\n" +
    "• " + fancy("Total Lost:") + " $" + formatMoney(stats.totalLost) + "\n" +
    "• " + fancy("Net Profit:") + " " + (netProfit < 0 ? "-" : "") + "$" + formatMoney(Math.abs(netProfit)) + "\n" +
    "• " + fancy("Biggest Bet:") + " $" + formatMoney(stats.biggestBet) + "\n" +
    "• " + fancy("Biggest Win:") + " $" + formatMoney(stats.biggestWin) + "\n" +
    "• " + fancy("Average Bet:") + " $" + formatMoney(avgBet) + "\n" +
    "• " + fancy("Average Win:") + " $" + formatMoney(avgWin) + "\n" +
    "• " + fancy("Average Loss:") + " $" + formatMoney(avgLoss) + "\n" +
    "• " + fancy("Current Streak:") + " " + fancy(stats.currentStreak) + "\n" +
    "• " + fancy("Best Streak:") + " " + fancy(stats.bestStreak) + "\n\n" +
    fancy("🕘 Last 10 Games:") + "\n" + historyLines
  );
}

// 🎬 Live reel animation Baby — edits ONE message: ❔❔❔ → s1❔❔ → s1s2❔ → s1s2s3
// Sends the first frame as a REPLY to the user's command, then edits that same
// message. Returns the messageID so the caller can edit the FINAL result into
// the same message too.
async function animateReel(api, threadID, replyToMessageID, s1, s2, s3) {
  const frame = (a, b, c) =>
    ">🎀\n" +
    fancy("🎰 Spinning Baby... Please Wait ⏳") + "\n" +
    fancy("Reels are rolling, hold tight!") + "\n\n" +
    "[ " + a + " | " + b + " | " + c + " ]";

  let msgInfo;
  try {
    msgInfo = await api.sendMessage(frame("❔", "❔", "❔"), threadID, replyToMessageID);
  } catch (e) {
    return null; // couldn't even send the first frame — caller will send result normally
  }
  const msgID = msgInfo && msgInfo.messageID;
  if (!msgID) return null;

  const steps = [
    frame(s1, "❔", "❔"),
    frame(s1, s2, "❔"),
    frame(s1, s2, s3)
  ];

  for (const text of steps) {
    await sleep(3000);
    try {
      await api.editMessage(text, msgID);
    } catch (e) {
      // editMessage not supported on this bot setup — stop animating,
      // caller will just send the final result as a fresh message Baby.
      return null;
    }
  }

  await sleep(3000);
  return msgID;
}

module.exports = {
  config: {
    name: "spin",
    version: "12.0-animated",
    author: "SAIF",
    category: "game",
    countDown: 20
  },

  onStart: async function ({ api, event, args, usersData, role }) {
    const { senderID, threadID, messageID, mentions, messageReply } = event;
    const now = Date.now();
    const sub = (args[0] || "").toLowerCase();

    // 🔄 Admin Refresh Logic Baby
    if (sub === "refresh" && role >= 2) {
      let targetID = messageReply ? messageReply.senderID : (Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : args[1]);
      if (!targetID) return api.sendMessage(fancy("❌ Usage: spin refresh @tag or UID Baby"), threadID, messageID);
      let tData = await usersData.get(targetID);
      if (!tData.data) tData.data = {};
      tData.data.spinLimit = { lastReset: now, count: 0 };
      await usersData.set(targetID, { data: tData.data });
      return api.sendMessage(fancy("✅ SPIN LIMIT REFRESHED BABY! 🎀"), threadID, messageID);
    }

    let user = await usersData.get(senderID);
    if (!user.data) user.data = {};

    // 📌 Simple rules/usage message Baby — first play AND anytime "spin" is typed with no amount
    const rulesMsg =
      `🎀 𝐒𝐏𝐈𝐍 𝐁𝐀𝐁𝐘\n` +
      `━━━━━━━━━━━━━━━━━━━\n\n` +
      fancy(`📌 How To Play:\n`) +
      fancy(`Type: spin [amount]\n`) +
      fancy(`Example: spin 5m\n\n`) +
      `💰 ${fancy("Bet Limit:")} 10M\n` +
      `⏰ ${fancy("Refresh Time:")} ${fancy("every 12 hours (20 spins)")}\n`;

    if (!user.data.spinSeen) {
      user.data.spinSeen = true;
      await usersData.set(senderID, { data: user.data });
      return api.sendMessage(rulesMsg, threadID, messageID);
    }

    if (!sub) {
      return api.sendMessage(rulesMsg, threadID, messageID);
    }

    const stats = ensureStats(user, now);

    // ℹ️ spin info Baby
    if (sub === "info") {
      await usersData.set(senderID, { data: user.data });
      return api.sendMessage(buildInfoCard(stats), threadID, messageID);
    }

    // 📜 spin history Baby
    if (sub === "history") {
      if (!stats.history.length) return api.sendMessage(fancy("📭 No games played yet Baby."), threadID, messageID);
      const lines = stats.history.map((h, i) => {
        const tag = h.result === "jackpot" ? "🎉" : h.result === "win" ? "✅" : "❌";
        const sign = h.result === "loss" ? "-" : "+";
        return `${i + 1}. ${tag} ${sign}$${formatMoney(h.amount)}  [ ${h.symbols.join(" | ")} ]`;
      }).join("\n");
      return api.sendMessage(
        fancy("🕘 LAST 10 GAMES BABY\n━━━━━━━━━━━━━━━━━━━\n") + lines,
        threadID, messageID
      );
    }

    // 🏆 spin top Baby (leaderboard by net profit)
    if (sub === "top") {
      if (typeof usersData.getAll !== "function") {
        return api.sendMessage(fancy("⚠️ Leaderboard isn't supported on this bot setup Baby."), threadID, messageID);
      }
      try {
        const all = await usersData.getAll();
        const ranked = all
          .filter(u => u.data && u.data.spinStats && u.data.spinStats.totalGames > 0)
          .map(u => {
            const s = u.data.spinStats;
            return { id: u.userID || u.id, name: u.name || "Unknown", net: s.totalWon - s.totalLost, games: s.totalGames };
          })
          .sort((a, b) => b.net - a.net)
          .slice(0, 10);

        if (!ranked.length) return api.sendMessage(fancy("📭 Nobody has played yet Baby."), threadID, messageID);

        const lines = ranked.map((r, i) =>
          `${i + 1}. ${fancy(r.name)} — ${r.net < 0 ? "-" : ""}$${formatMoney(Math.abs(r.net))} ${fancy(`(${r.games} games)`)}`
        ).join("\n");

        return api.sendMessage(
          fancy("🏆 SPIN TOP 10 — NET PROFIT BABY\n━━━━━━━━━━━━━━━━━━━\n") + lines,
          threadID, messageID
        );
      } catch (e) {
        return api.sendMessage(fancy("⚠️ Couldn't load leaderboard right now Baby."), threadID, messageID);
      }
    }

    // 🕐 12 Hours Reset System Baby
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;

    if (!user.data.spinLimit || !user.data.spinLimit.lastReset) {
      user.data.spinLimit = { lastReset: now, count: 0 };
    } else {
      if (now - user.data.spinLimit.lastReset >= TWELVE_HOURS) {
        user.data.spinLimit = { lastReset: now, count: 0 };
      }
    }

    if (user.data.spinLimit.count >= 20) {
      const timeLeft = TWELVE_HOURS - (now - user.data.spinLimit.lastReset);
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      return api.sendMessage(
        fancy(`⚠️ You have reached your limit of 20 spins!\n⏰ Reset in: ${hoursLeft}h ${minutesLeft}m`),
        threadID, messageID
      );
    }

    const BET_CAP = 10_000_000; // 10M

    const betAmount = parseShorthand(args[0]);
    if (isNaN(betAmount) || betAmount <= 0) return api.sendMessage(fancy("⚠️ ENTER A VALID BET AMOUNT BABY."), threadID, messageID);
    if (betAmount > BET_CAP) return api.sendMessage(fancy("🥹 Slot limit is 10M Baby."), threadID, messageID);
    if (betAmount > user.money) return api.sendMessage(fancy("💰 NOT ENOUGH BALANCE BABY."), threadID, messageID);

    // 💖 Love-only emoji list
    const slots = ["❤️","🧡","💛","💚","💙","💜","🖤"];
    let s1, s2, s3, winnings, isWin = false, isJackpot = false;

    // Normal game: 3% Rare Jackpot (triple) | 37% Double | 60% Lose
    const roll = Math.random();
    if (roll < 0.03) {
      // Rare Jackpot (triple)
      isWin = true;
      isJackpot = true;
      const symbol = slots[Math.floor(Math.random() * slots.length)];
      s1 = s2 = s3 = symbol;
      winnings = betAmount * 3;
    } else if (roll < 0.40) {
      // Double (Normal win)
      isWin = true;
      const symbol = slots[Math.floor(Math.random() * slots.length)];
      const pos = Math.floor(Math.random() * 3);
      if (pos === 0) {
        s1 = slots[Math.floor(Math.random() * slots.length)];
        s2 = symbol;
        s3 = symbol;
      } else if (pos === 1) {
        s1 = symbol;
        s2 = slots[Math.floor(Math.random() * slots.length)];
        s3 = symbol;
      } else {
        s1 = symbol;
        s2 = symbol;
        s3 = slots[Math.floor(Math.random() * slots.length)];
      }
      winnings = betAmount * 2;
    } else {
      // Loss (no match, 60%)
      do {
        s1 = slots[Math.floor(Math.random() * slots.length)];
        s2 = slots[Math.floor(Math.random() * slots.length)];
        s3 = slots[Math.floor(Math.random() * slots.length)];
      } while (s1 === s2 || s1 === s3 || s2 === s3);
      winnings = -betAmount;
    }

    // 📈 Record round into stats Baby
    recordRound(stats, { isWin, isJackpot, betAmount, winnings, symbols: [s1, s2, s3], now });

    // Update spin count & money
    user.data.spinLimit.count += 1;
    const newBalance = user.money + winnings;
    await usersData.set(senderID, { money: newBalance, data: user.data });

    // 🎬 Play the reel animation Baby (edits one message: ❔❔❔ → reveal → reveal → reveal)
    const animMsgID = await animateReel(api, threadID, messageID, s1, s2, s3);

    // 🎯 Today's win rate Baby
    const todayRate = stats.todayGames > 0 ? ((stats.todayWins / stats.todayGames) * 100).toFixed(1) : "0.0";

    // 🎤 Final result message Baby
    const amtFormatted = formatMoney(Math.abs(winnings));
    let resultMsg;

    if (isJackpot) {
      resultMsg =
        ">🎀\n" +
        "• " + fancy("Baby, You Win With Three Love Symbol — Rare Jackpot! 🎉") + "\n" +
        "• $" + amtFormatted + "\n" +
        "• " + fancy("Game Results:") + " [ " + s1 + " | " + s2 + " | " + s3 + " ]\n\n" +
        "🎯 " + fancy("Win Rate Today:") + " " + fancy(todayRate) + "% " + fancy(`(${stats.todayWins}/${stats.todayGames})`);
    } else {
      const status = isWin ? fancy("Won") : fancy("Lost");
      resultMsg =
        ">🎀\n" +
        "• " + fancy("Baby, You ") + status + " $" + amtFormatted + "\n" +
        "• " + fancy("Game Results:") + " [ " + s1 + " | " + s2 + " | " + s3 + " ]\n\n" +
        "🎯 " + fancy("Win Rate Today:") + " " + fancy(todayRate) + "% " + fancy(`(${stats.todayWins}/${stats.todayGames})`);
    }

    // If the animation is still live (editMessage worked), edit the FINAL result
    // straight into that same message. Otherwise fall back to a normal send Baby.
    if (animMsgID) {
      try {
        await api.editMessage(resultMsg, animMsgID);
        return;
      } catch (e) {
        // fall through to normal send below
      }
    }

    return api.sendMessage(resultMsg, threadID, messageID);
  }
};
