// ✨ Bold Sans-Serif Font
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

const teams = [
  { flag: "🇧🇩", name: "Bangladesh" },
  { flag: "🇮🇳", name: "India" },
  { flag: "🇧🇷", name: "Brazil" },
  { flag: "🇦🇷", name: "Argentina" },
  { flag: "🇩🇪", name: "Germany" },
  { flag: "🇫🇷", name: "France" },
  { flag: "🇪🇸", name: "Spain" },
  { flag: "🇮🇹", name: "Italy" },
  { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", name: "England" },
  { flag: "🇳🇱", name: "Netherlands" },
  { flag: "🇵🇹", name: "Portugal" },
  { flag: "🇧🇪", name: "Belgium" },
  { flag: "🇺🇾", name: "Uruguay" },
  { flag: "🇨🇴", name: "Colombia" },
  { flag: "🇲🇽", name: "Mexico" }
];

const delay = ms => new Promise(r => setTimeout(r, ms));

function matchFrame(home, away, homeScore, awayScore, status) {
  const scoreText = (homeScore === "?" && awayScore === "?")
    ? `? - ?`
    : `${f(homeScore)} - ${f(awayScore)}`;

  const statusText = {
    kickoff: "⚽ " + f("Kick Off..."),
    half1:   "🔴 " + f("1st Half — Action"),
    final:   "⏹️ " + f("Full Time")
  }[status] || "";

  return (
    `🏆 ${f("INTERNATIONAL FRIENDLY")}\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `${home.flag} ${f(home.name)}  ${scoreText}  ${away.flag} ${f(away.name)}\n` +
    `${statusText}`
  );
}

async function processBet(api, event, userData, betAmount, home, away, userTeam, usersData) {
  const { senderID, threadID, messageID } = event;

  const BET_CAP = 10_000_000;
  if (betAmount > BET_CAP) {
    userData.money -= betAmount;
    userData.data.betLimit.count += 1;
    await usersData.set(senderID, { money: userData.money, data: userData.data });
    return api.sendMessage(`🚨 ${f("FIXING SCANDAL!")}\nMatch void. Lost: ${formatMoney(betAmount)}`, threadID, messageID);
  }

  const roll = Math.random();
  let outcome = roll < 0.05 ? "jackpot" : (roll < 0.45 ? "win" : "lose");

  const userIsHome = (userTeam.name === home.name);
  let homeScore, awayScore;

  if (outcome === "jackpot") {
    homeScore = userIsHome ? 3 : 0; awayScore = userIsHome ? 0 : 3;
  } else if (outcome === "win") {
    homeScore = userIsHome ? 2 : 1; awayScore = userIsHome ? 1 : 2;
  } else {
    homeScore = userIsHome ? 0 : 2; awayScore = userIsHome ? 2 : 0;
  }

  const userWon = outcome !== "lose";
  const winnings = userWon ? betAmount * (outcome === "jackpot" ? 3 : 2) : 0;
  const netGain = userWon ? winnings - betAmount : -betAmount;

  const initMsg = await api.sendMessage(matchFrame(home, away, "?", "?", "kickoff"), threadID, messageID);
  const mid = initMsg.messageID;

  const steps = [
    { progress: 0.5, status: "half1" },
    { progress: 1.0, status: "final" }
  ];

  for (const step of steps) {
    await delay(1500);
    let curH = step.progress === 1.0 ? homeScore : Math.floor(homeScore / 2);
    let curA = step.progress === 1.0 ? awayScore : Math.floor(awayScore / 2);

    let frame = matchFrame(home, away, curH, curA, step.status);
    if (step.status === "final") {
      userData.money += netGain;
      userData.data.betLimit.count += 1;
      await usersData.set(senderID, { money: userData.money, data: userData.data });
      frame += `\n\n${userWon ? "✅" : "❌"} ${userWon ? f("WIN") : f("LOST")}\n💵 ${f("Payout")}: ${formatMoney(winnings)}\n💰 ${f("Balance")}: ${formatMoney(userData.money)}`;
    }
    await api.editMessage(frame, mid);
  }
}

module.exports = {
  config: {
    name: "bet",
    aliases: ["football", "soccer"],
    version: "10.0",
    author: "Saif",
    category: "game",
    countDown: 5,
    description: "⚽ Football bet — reply to pick team",
    guide: "{pn} <amount>  — then reply with 1/2/team name"
  },

  onStart: async function({ api, event, args, usersData, role, commandName }) {
    const { senderID, threadID, messageID } = event;
    let userData = await usersData.get(senderID);
    if (!userData.data) userData.data = {};

    const now = Date.now();
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;

    // Reset 12h limit if expired
    if (!userData.data.betLimit?.lastReset || now - userData.data.betLimit.lastReset >= TWELVE_HOURS) {
      userData.data.betLimit = { lastReset: now, count: 0 };
    }

    if (userData.data.betLimit.count >= 20) {
      const timeLeft = TWELVE_HOURS - (now - userData.data.betLimit.lastReset);
      const h = Math.floor(timeLeft / 3600000);
      const m = Math.floor((timeLeft % 3600000) / 60000);
      return api.sendMessage(f(`⚠️ Limit reached! Reset in ${h}h ${m}m.`), threadID, messageID);
    }

    // Admin refresh
    if (args[0] === "refresh" && role >= 2) {
      const targetID = event.messageReply ? event.messageReply.senderID : args[1];
      if (!targetID) return api.sendMessage(f("❌ Usage: bet refresh @tag or reply"), threadID, messageID);
      let tData = await usersData.get(targetID);
      if (!tData.data) tData.data = {};
      tData.data.betLimit = { lastReset: now, count: 0 };
      await usersData.set(targetID, { data: tData.data });
      return api.sendMessage(f("✅ Limit refreshed!"), threadID, messageID);
    }

    // Parse amount
    const betAmount = parseAmount(args[0]);
    if (isNaN(betAmount) || betAmount <= 0)
      return api.sendMessage(f("❌ Invalid amount! Example: .bet 5m"), threadID, messageID);
    if (betAmount > (userData.money || 0))
      return api.sendMessage(f("💰 Not enough balance!"), threadID, messageID);

    // Random teams
    let hIdx = Math.floor(Math.random() * teams.length);
    let aIdx = Math.floor(Math.random() * teams.length);
    while (aIdx === hIdx) aIdx = Math.floor(Math.random() * teams.length);
    const home = teams[hIdx];
    const away = teams[aIdx];

    // Team provided inline
    const teamInput = args.slice(1).join(" ").trim().toLowerCase();
    if (teamInput) {
      let userTeam = null;
      if (teamInput === "1") userTeam = home;
      else if (teamInput === "2") userTeam = away;
      else userTeam = teams.find(t =>
        t.name.toLowerCase() === teamInput || t.flag === teamInput
      );

      if (!userTeam)
        return api.sendMessage(
          `❌ ${f("Team not in this match!")}\n` +
          `1️⃣ ${home.flag} ${f(home.name)}\n` +
          `2️⃣ ${away.flag} ${f(away.name)}`,
          threadID, messageID
        );

      return processBet(api, event, userData, betAmount, home, away, userTeam, usersData);
    }

    // Ask user to pick — register onReply
    const promptMsg = await api.sendMessage(
      `⚽ ${f("Pick your team:")}\n` +
      `1️⃣ ${home.flag} ${f(home.name)}\n` +
      `2️⃣ ${away.flag} ${f(away.name)}\n\n` +
      f("Reply with 1, 2, team name or flag."),
      threadID, messageID
    );

    // ✅ Use GoatBot onReply — works WITHOUT prefix
    global.GoatBot.onReply.set(promptMsg.messageID, {
      commandName,
      authorID: senderID,
      betAmount,
      homeIdx: hIdx,
      awayIdx: aIdx
    });
  },

  // ✅ Fires when user replies to the team selection prompt
  onReply: async function({ api, event, Reply, usersData }) {
    const { senderID, threadID, messageID } = event;

    // Only the original bettor can reply
    if (senderID !== Reply.authorID)
      return;

    const home = teams[Reply.homeIdx];
    const away = teams[Reply.awayIdx];
    const sel = (event.body || "").trim().toLowerCase();

    let userTeam = null;
    if (sel === "1") userTeam = home;
    else if (sel === "2") userTeam = away;
    else userTeam = teams.find(t =>
      t.name.toLowerCase() === sel || t.flag === sel
    );

    if (!userTeam) {
      return api.sendMessage(
        `❌ ${f("Invalid team! Choose:")}\n` +
        `1️⃣ ${home.flag} ${f(home.name)}\n` +
        `2️⃣ ${away.flag} ${f(away.name)}\n` +
        f("Or type name/flag."),
        threadID, messageID
      );
    }

    // Remove reply listener
    global.GoatBot.onReply.delete(event.messageReply.messageID);

    let userData = await usersData.get(senderID);
    if (!userData.data) userData.data = {};
    if (!userData.data.betLimit) userData.data.betLimit = { lastReset: Date.now(), count: 0 };

    return processBet(api, event, userData, Reply.betAmount, home, away, userTeam, usersData);
  }
};
