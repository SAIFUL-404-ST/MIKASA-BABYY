const axios = require("axios");

// ══════════════════════════════════════════
//  UTILS
// ══════════════════════════════════════════

function parseAmount(str) {
  if (!str) return NaN;
  str = str.toLowerCase().replace(/\s+/g, "");
  const map = {
    'k': 1e3, 'm': 1e6, 'b': 1e9, 't': 1e12, 'q': 1e15, 'qd': 1e18, 'qi': 1e21,
    'sx': 1e24, 'sp': 1e27, 'oc': 1e30, 'no': 1e33, 'dc': 1e36, 'udc': 1e39,
    'ddc': 1e42, 'tdc': 1e45, 'qdc': 1e48, 'qid': 1e51, 'sxd': 1e54, 'spd': 1e57,
    'ocd': 1e60, 'nod': 1e63, 'vg': 1e66, 'ntg': 1e93, 'ct': 1e303
  };
  const sorted = Object.keys(map).sort((a, b) => b.length - a.length);
  for (const key of sorted) {
    if (str.endsWith(key)) {
      const num = parseFloat(str.slice(0, -key.length));
      return isNaN(num) ? NaN : num * map[key];
    }
  }
  return parseFloat(str);
}

function fancy(text) {
  if (text === undefined || text === null) return "";
  const map = {
    'a':'𝐚','b':'𝐛','c':'𝐜','d':'𝐝','e':'𝐞','f':'𝐟','g':'𝐠','h':'𝐡','i':'𝐢','j':'𝐣',
    'k':'𝐤','l':'𝐥','m':'𝐦','n':'𝐧','o':'𝐨','p':'𝐩','q':'𝐪','r':'𝐫','s':'𝐬','t':'𝐭',
    'u':'𝐮','v':'𝐯','w':'𝐰','x':'𝐱','y':'𝐲','z':'𝐳',
    'A':'𝐀','B':'𝐁','C':'𝐂','D':'𝐃','E':'𝐄','F':'𝐅','G':'𝐆','H':'𝐇','I':'𝐈','J':'𝐉',
    'K':'𝐊','L':'𝐋','M':'𝐌','N':'𝐍','O':'𝐎','P':'𝐏','Q':'𝐐','R':'𝐑','S':'𝐒','T':'𝐓',
    'U':'𝐔','V':'𝐕','W':'𝐖','X':'𝐗','Y':'𝐘','Z':'𝐙',
    '0':'𝟎','1':'𝟏','2':'𝟐','3':'𝟑','4':'𝟒','5':'𝟓','6':'𝟔','7':'𝟕','8':'𝟖','9':'𝟗',
    '.':'.', ':':':', ',':','
  };
  return String(text).split('').map(c => map[c] || c).join('');
}

function formatMoney(amount) {
  if (isNaN(amount) || amount === Infinity || amount === undefined) return fancy("0");
  const units = [
    { v: 1e303, s: "𝐂𝐭"  }, { v: 1e93,  s: "𝐍𝐭𝐠" }, { v: 1e66,  s: "𝐕𝐠"  },
    { v: 1e36,  s: "𝐃𝐜"  }, { v: 1e33,  s: "𝐍𝐨"  }, { v: 1e30,  s: "𝐎𝐜"  },
    { v: 1e27,  s: "𝐒𝐩"  }, { v: 1e24,  s: "𝐒𝐱"  }, { v: 1e21,  s: "𝐐𝐢"  },
    { v: 1e18,  s: "𝐐𝐝"  }, { v: 1e15,  s: "𝐐"   }, { v: 1e12,  s: "𝐓"   },
    { v: 1e9,   s: "𝐁"   }, { v: 1e6,   s: "𝐌"   }, { v: 1e3,   s: "𝐊"   }
  ];
  for (const u of units) {
    if (Math.abs(amount) >= u.v)
      return fancy((amount / u.v).toFixed(2)) + u.s;
  }
  return fancy(Math.floor(amount).toString());
}

// ══════════════════════════════════════════
//  CONSTANTS
// ══════════════════════════════════════════

const WIN_CHANCE   = 0.35;       // 35% win, 65% loss
const MAX_AMOUNT   = 10_000_000; // 10M cap
const DAILY_LIMIT  = 10;
const RESET_MS     = 12 * 60 * 60 * 1000; // 12h
const HUNT_CD_MS   = 5 * 60 * 1000;       // 5 min

const ITEM_DB = {
  common: [
    { name: "Fresh Fish",   emoji: "🐟", price: 50    },
    { name: "Rice Bag",     emoji: "🍚", price: 30    },
    { name: "Vegetables",   emoji: "🥬", price: 25    },
    { name: "Milk",         emoji: "🥛", price: 40    },
    { name: "Eggs",         emoji: "🥚", price: 35    }
  ],
  electronics: [
    { name: "Smartphone",   emoji: "📱", price: 15000 },
    { name: "Laptop",       emoji: "💻", price: 35000 },
    { name: "Headphones",   emoji: "🎧", price: 1200  }
  ],
  luxury: [
    { name: "Gold Necklace",emoji: "📿", price: 50000  },
    { name: "Diamond Ring", emoji: "💍", price: 120000 }
  ]
};

const activeListings = new Map();

// ══════════════════════════════════════════
//  DEFAULT USER DATA
// ══════════════════════════════════════════

function defaultStats() {
  return {
    level: 1,
    xp: 0,
    reputation: 50,
    skills: { trading: 1, negotiation: 1, investment: 1, production: 1, marketing: 1 },
    totalTrades: 0,
    totalProfit: 0,
    inventory: [],
    achievements: [],
    lastHunt: 0
  };
}

function defaultLimit(now) {
  return { lastReset: now, count: 0 };
}

function initUser(user, now) {
  if (!user.data) user.data = {};
  if (!user.data.marketStats) user.data.marketStats = defaultStats();
  if (!user.data.marketLimit || !user.data.marketLimit.lastReset)
    user.data.marketLimit = defaultLimit(now);
  else if (now - user.data.marketLimit.lastReset >= RESET_MS)
    user.data.marketLimit = defaultLimit(now);
  return user;
}

// ══════════════════════════════════════════
//  MODULE
// ══════════════════════════════════════════

module.exports = {
  config: {
    name: "market",
    aliases: ["trade", "p2p", "sell", "economy"],
    version: "102.0",
    author: "Saif",
    countDown: 5,
    role: 0,
    category: "game",
    description: fancy("Ultimate Market System Baby")
  },

  onStart: async function ({ api, event, usersData, args, role }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;
    const now  = Date.now();
    const sub  = args[0]?.toLowerCase();

    // ── Admin: refresh limit ─────────────────────────────────
    if (sub === "refresh" && role >= 2) {
      let targetID = messageReply?.senderID
        ?? Object.keys(mentions)[0]
        ?? args[1];
      if (!targetID)
        return api.sendMessage(fancy("❌ Usage: market refresh @tag or UID Baby"), threadID, messageID);
      let tData = await usersData.get(targetID);
      if (!tData.data) tData.data = {};
      tData.data.marketLimit = defaultLimit(now);
      await usersData.set(targetID, { data: tData.data });
      return api.sendMessage(fancy("✅ Market limit refreshed Baby! 🎀"), threadID, messageID);
    }

    // ── Load & init user ─────────────────────────────────────
    let user = await usersData.get(senderID);
    user = initUser(user, now);
    const stats = user.data.marketStats;
    const limit = user.data.marketLimit;

    // ── HELP ────────────────────────────────────────────────
    if (!sub || sub === "help") {
      const timeLeft = RESET_MS - (now - limit.lastReset);
      const h = Math.floor(timeLeft / 3600000);
      const m = Math.floor((timeLeft % 3600000) / 60000);
      const msg =
        `🏙️ ${fancy("ULTIMATE MARKET")} 🏙️\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📊 ${fancy("market profile")}          » ${fancy("Your stats")}\n` +
        `🛍️ ${fancy("market shop [cat]")}       » ${fancy("Buy from shop")}\n` +
        `📦 ${fancy("market sell [item] [price]")} » ${fancy("List item")}\n` +
        `🛒 ${fancy("market buy [ID]")}          » ${fancy("Buy listing")}\n` +
        `📋 ${fancy("market list")}              » ${fancy("View listings")}\n` +
        `💼 ${fancy("market invest [amount]")}   » ${fancy("Invest money")}\n` +
        `⚡ ${fancy("market hunt")}              » ${fancy("Find items")}\n` +
        `👥 ${fancy("market partner @tag")}      » ${fancy("Partnership")}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 ${fancy("Balance:")} ${formatMoney(user.money || 0)}\n` +
        `📊 ${fancy("Actions:")} ${limit.count}/${DAILY_LIMIT}\n` +
        `⏰ ${fancy("Reset in:")} ${h}h ${m}m\n` +
        `🎯 ${fancy("Win rate:")} ❓%`;
      return api.sendMessage(msg, threadID, messageID);
    }

    // ── PROFILE ─────────────────────────────────────────────
    if (sub === "profile" || sub === "stats") {
      const xpNeeded = stats.level * 100;
      const bar = Math.floor((stats.xp / xpNeeded) * 10);
      const xpBar = "█".repeat(bar) + "░".repeat(10 - bar);
      const msg =
        `👤 ${fancy("MARKET PROFILE")} 👤\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `${fancy("Name:")}       ${fancy(user.name || senderID)}\n` +
        `${fancy("Level:")}      ${fancy(stats.level)}\n` +
        `${fancy("XP:")}         [${xpBar}] ${fancy(stats.xp)}/${fancy(xpNeeded)}\n` +
        `${fancy("Reputation:")} ${fancy(stats.reputation)}/100\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `${fancy("Trades:")}     ${fancy(stats.totalTrades)}\n` +
        `${fancy("Profit:")}     ${formatMoney(stats.totalProfit)}\n` +
        `${fancy("Inventory:")}  ${fancy(stats.inventory.length)} items\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `📈 ${fancy("Skills")}\n` +
        `Trading:     ${fancy(stats.skills.trading)}\n` +
        `Investment:  ${fancy(stats.skills.investment)}\n` +
        `Negotiation: ${fancy(stats.skills.negotiation)}`;
      return api.sendMessage(msg, threadID, messageID);
    }

    // ── LIMIT CHECK (actions below consume 1 slot) ───────────
    if (limit.count >= DAILY_LIMIT) {
      const left = RESET_MS - (now - limit.lastReset);
      const h = Math.floor(left / 3600000);
      const m = Math.floor((left % 3600000) / 60000);
      return api.sendMessage(
        fancy(`⛔ Daily limit reached! (${DAILY_LIMIT}/${DAILY_LIMIT})\n⏰ Resets in: ${h}h ${m}m Baby`),
        threadID, messageID
      );
    }

    // ── SHOP ────────────────────────────────────────────────
    if (sub === "shop") {
      const cat = args[1]?.toLowerCase();
      if (!cat || !ITEM_DB[cat]) {
        const cats = Object.keys(ITEM_DB).join(", ");
        return api.sendMessage(
          `🛍️ ${fancy("SHOP CATEGORIES")}\n━━━━━━━━━━━━━━━━━━\n${fancy(cats)}\n━━━━━━━━━━━━━━━━━━\n${fancy("Usage: market shop [category]")}`,
          threadID, messageID
        );
      }
      const items = ITEM_DB[cat];
      let msg = `🛍️ ${fancy(cat.toUpperCase())} ${fancy("SHOP")}\n━━━━━━━━━━━━━━━━━━\n`;
      items.forEach((item, i) => {
        const disc = Math.floor(item.price * (stats.skills.trading * 0.01));
        msg += `${i + 1}. ${item.emoji} ${fancy(item.name)}\n   ${fancy("Price:")} ${formatMoney(item.price - disc)}`;
        if (disc > 0) msg += ` (${fancy("Discount:")} ${formatMoney(disc)})`;
        msg += "\n";
      });
      msg += `━━━━━━━━━━━━━━━━━━\n${fancy("Reply with item number to buy.")}`;

      return api.sendMessage(msg, threadID, (err, info) => {
        if (err) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          type: "shop_selection",
          category: cat,
          userID: senderID
        });
      }, messageID);
    }

    // ── SELL ────────────────────────────────────────────────
    if (sub === "sell" || sub === "post") {
      const priceRaw = args[args.length - 1];
      const price    = parseAmount(priceRaw);
      const itemName = args.slice(1, -1).join(" ");
      if (!itemName || isNaN(price) || price <= 0)
        return api.sendMessage(fancy("❌ Usage: market sell [item name] [price]\nExample: market sell Gold Bar 5k"), threadID, messageID);
      if (price > MAX_AMOUNT)
        return api.sendMessage(fancy(`❌ Max listing price is ${formatMoney(MAX_AMOUNT)} Baby`), threadID, messageID);

      const listingID = Math.random().toString(36).substring(2, 7).toUpperCase();
      activeListings.set(listingID, {
        id: listingID,
        ownerID: senderID,
        ownerName: user.name || senderID,
        item: itemName,
        price,
        time: now
      });

      limit.count++;
      await usersData.set(senderID, user);

      return api.sendMessage(
        `📢 ${fancy("ITEM LISTED!")} 📢\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `📦 ${fancy("Item:")}  ${fancy(itemName)}\n` +
        `💰 ${fancy("Price:")} ${formatMoney(price)}\n` +
        `🆔 ${fancy("ID:")}    ${listingID}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `${fancy("Others can buy with: market buy")} ${listingID}`,
        threadID, messageID
      );
    }

    // ── LIST ────────────────────────────────────────────────
    if (sub === "list") {
      if (activeListings.size === 0)
        return api.sendMessage(fancy("📋 No active listings right now Baby."), threadID, messageID);

      let msg = `🏪 ${fancy("ACTIVE LISTINGS")} 🏪\n━━━━━━━━━━━━━━━━━━\n`;
      activeListings.forEach((l) => {
        const ago = Math.floor((now - l.time) / 60000);
        msg += `🆔 ${fancy(l.id)}\n📦 ${fancy(l.item)}\n💰 ${formatMoney(l.price)} | 👤 ${fancy(l.ownerName)} | ⏰ ${ago}m ago\n──────────────────\n`;
      });
      msg += `${fancy("Buy with: market buy [ID]")}`;
      return api.sendMessage(msg, threadID, messageID);
    }

    // ── BUY ─────────────────────────────────────────────────
    if (sub === "buy") {
      const lid     = args[1]?.toUpperCase();
      const listing = activeListings.get(lid);
      if (!listing)
        return api.sendMessage(fancy(`❌ Listing "${lid}" not found Baby.`), threadID, messageID);
      if (listing.ownerID === senderID)
        return api.sendMessage(fancy("❌ Can't buy your own listing Baby."), threadID, messageID);
      if ((user.money || 0) < listing.price)
        return api.sendMessage(fancy(`❌ Not enough money. Need ${formatMoney(listing.price)}`), threadID, messageID);

      const seller = await usersData.get(listing.ownerID);
      if (!seller.data) seller.data = {};
      if (!seller.data.marketStats) seller.data.marketStats = defaultStats();

      user.money   -= listing.price;
      seller.money  = (seller.money || 0) + listing.price;

      stats.totalTrades++;
      stats.xp     += 10;
      stats.skills.trading = Math.min(100, stats.skills.trading + 1);
      stats.inventory.push({ name: listing.item, boughtAt: listing.price, from: listing.ownerName, time: now });

      seller.data.marketStats.totalTrades++;
      seller.data.marketStats.totalProfit += listing.price;

      limit.count++;
      activeListings.delete(lid);

      await usersData.set(senderID, user);
      await usersData.set(listing.ownerID, seller);

      return api.sendMessage(
        `✅ ${fancy("PURCHASE SUCCESSFUL!")} ✅\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `📦 ${fancy(listing.item)}\n` +
        `💰 ${fancy("Paid:")}   ${formatMoney(listing.price)}\n` +
        `👤 ${fancy("Seller:")} ${fancy(listing.ownerName)}\n` +
        `📈 ${fancy("Trading Skill +1")}`,
        threadID, messageID
      );
    }

    // ── HUNT ────────────────────────────────────────────────
    if (sub === "hunt" || sub === "find") {
      const cd = HUNT_CD_MS - (now - (stats.lastHunt || 0));
      if (cd > 0) {
        const m = Math.ceil(cd / 60000);
        return api.sendMessage(fancy(`⏳ Hunt cooldown! Try again in ${m} min Baby.`), threadID, messageID);
      }

      stats.lastHunt = now;
      const win = Math.random() < WIN_CHANCE; // 35%

      if (win) {
        const cats  = Object.keys(ITEM_DB);
        const cat   = cats[Math.floor(Math.random() * cats.length)];
        const items = ITEM_DB[cat];
        const found = items[Math.floor(Math.random() * items.length)];

        stats.inventory.push({ name: found.name, value: found.price, foundAt: now });
        stats.xp += 5;
        limit.count++;
        await usersData.set(senderID, user);

        return api.sendMessage(
          `🎯 ${fancy("HUNT SUCCESS!")} 🎯\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `${found.emoji} ${fancy(found.name)}\n` +
          `💰 ${fancy("Value:")} ${formatMoney(found.price)}\n` +
          `⭐ ${fancy("XP +5")}`,
          threadID, messageID
        );
      } else {
        limit.count++;
        await usersData.set(senderID, user);
        return api.sendMessage(
          `💨 ${fancy("HUNT FAILED!")} 💨\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `${fancy("Nothing found this time Baby.")}\n` +
          `${fancy("Win chance: 35% — try again!")}`,
          threadID, messageID
        );
      }
    }

    // ── INVEST ──────────────────────────────────────────────
    if (sub === "invest") {
      const amount = parseAmount(args[1]);
      if (isNaN(amount) || amount <= 0)
        return api.sendMessage(fancy("❌ Usage: market invest [amount]\nExample: market invest 5k"), threadID, messageID);
      if (amount > MAX_AMOUNT)
        return api.sendMessage(fancy(`❌ Max investment: ${formatMoney(MAX_AMOUNT)} Baby`), threadID, messageID);
      if ((user.money || 0) < amount)
        return api.sendMessage(fancy(`❌ Not enough money. You have ${formatMoney(user.money || 0)}`), threadID, messageID);

      const win    = Math.random() < WIN_CHANCE; // 35%
      const mult   = 0.1 + Math.random() * 0.4;
      const change = Math.floor(amount * mult);

      if (win) {
        user.money += change;
        stats.totalProfit += change;
        stats.skills.investment = Math.min(100, stats.skills.investment + 2);
        stats.xp += 10;
        limit.count++;
        stats.totalTrades++;
        await usersData.set(senderID, user);
        return api.sendMessage(
          `📈 ${fancy("INVEST WIN!")} 📈\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `💸 ${fancy("Invested:")} ${formatMoney(amount)}\n` +
          `✅ ${fancy("Profit:")}   +${formatMoney(change)}\n` +
          `💰 ${fancy("Balance:")} ${formatMoney(user.money)}\n` +
          `📊 ${fancy("Investment Skill +2")} | ${fancy("XP +10")}`,
          threadID, messageID
        );
      } else {
        user.money  = Math.max(0, user.money - change);
        stats.totalProfit -= change;
        stats.xp += 2;
        limit.count++;
        stats.totalTrades++;
        await usersData.set(senderID, user);
        return api.sendMessage(
          `📉 ${fancy("INVEST LOSS!")} 📉\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `💸 ${fancy("Invested:")} ${formatMoney(amount)}\n` +
          `❌ ${fancy("Lost:")}    -${formatMoney(change)}\n` +
          `💰 ${fancy("Balance:")} ${formatMoney(user.money)}\n` +
          `${fancy("Win chance: 35% — better luck Baby!")}`,
          threadID, messageID
        );
      }
    }

    // ── PARTNER ─────────────────────────────────────────────
    if (sub === "partner" || sub === "collab") {
      const targetID = Object.keys(mentions)[0];
      if (!targetID)
        return api.sendMessage(fancy("❌ Please tag someone. Example: market partner @Name"), threadID, messageID);
      if (targetID === senderID)
        return api.sendMessage(fancy("❌ Can't partner with yourself Baby."), threadID, messageID);

      const partnerData = await usersData.get(targetID);
      const partnerSkill = partnerData.data?.marketStats?.skills?.trading || 1;
      const bonus = Math.floor(((stats.skills.trading + partnerSkill) / 2) * 10);

      return api.sendMessage(
        `🤝 ${fancy("PARTNERSHIP OFFER")} 🤝\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `👤 ${fancy(user.name || senderID)}\n` +
        `   ↕️\n` +
        `👤 ${fancy(partnerData.name || targetID)}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `💰 ${fancy("Signing Bonus:")} ${formatMoney(bonus)} ${fancy("each")}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `${fancy("Reply 'accept' to confirm Baby!")}`,
        threadID,
        (err, info) => {
          if (err) return;
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            type: "partnership",
            fromID: senderID,
            fromName: user.name || senderID,
            toID: targetID,
            bonus
          });
        },
        messageID
      );
    }

    // ── Fallback ─────────────────────────────────────────────
    return api.sendMessage(fancy("❌ Unknown command. Type market help Baby."), threadID, messageID);
  },

  // ══════════════════════════════════════════
  //  ON REPLY
  // ══════════════════════════════════════════

  onReply: async function ({ api, event, Reply, usersData }) {
    const { senderID, body, threadID, messageID } = event;
    const { type } = Reply;

    // ── Partnership accept ───────────────────────────────────
    if (type === "partnership") {
      if (senderID !== Reply.toID) return;
      if (body.trim().toLowerCase() !== "accept")
        return api.sendMessage(fancy("❌ Type 'accept' to confirm the partnership Baby."), threadID, messageID);

      const from = await usersData.get(Reply.fromID);
      const to   = await usersData.get(Reply.toID);
      from.money  = (from.money  || 0) + Reply.bonus;
      to.money    = (to.money    || 0) + Reply.bonus;
      await usersData.set(Reply.fromID, from);
      await usersData.set(Reply.toID,   to);

      return api.sendMessage(
        `✅ ${fancy("PARTNERSHIP CONFIRMED!")} ✅\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🤝 ${fancy(Reply.fromName)} & ${fancy(to.name || Reply.toID)}\n` +
        `💰 ${fancy("Bonus:")} ${formatMoney(Reply.bonus)} ${fancy("each received!")}`,
        threadID, messageID
      );
    }

    // ── Shop selection ───────────────────────────────────────
    if (type === "shop_selection") {
      if (senderID !== Reply.userID) return;

      const num   = parseInt(body.trim());
      const items = ITEM_DB[Reply.category];

      if (!items || isNaN(num) || num < 1 || num > items.length)
        return api.sendMessage(fancy(`❌ Choose a number between 1 and ${items?.length || "?"} Baby.`), threadID, messageID);

      const selected = items[num - 1];
      let user = await usersData.get(senderID);
      user = initUser(user, Date.now());

      const disc       = Math.floor(selected.price * (user.data.marketStats.skills.trading * 0.01));
      const finalPrice = selected.price - disc;

      if ((user.money || 0) < finalPrice)
        return api.sendMessage(fancy(`❌ Not enough money. Need ${formatMoney(finalPrice)}`), threadID, messageID);

      if (user.data.marketLimit.count >= DAILY_LIMIT)
        return api.sendMessage(fancy("⛔ Daily limit reached! Come back later Baby."), threadID, messageID);

      user.money -= finalPrice;
      user.data.marketStats.inventory.push({ name: selected.name, boughtAt: finalPrice, time: Date.now() });
      user.data.marketStats.totalTrades++;
      user.data.marketLimit.count++;
      await usersData.set(senderID, user);

      return api.sendMessage(
        `✅ ${fancy("PURCHASED!")} ✅\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `${selected.emoji} ${fancy(selected.name)}\n` +
        `💰 ${fancy("Paid:")} ${formatMoney(finalPrice)}\n` +
        (disc > 0 ? `🏷️ ${fancy("Discount:")} ${formatMoney(disc)}\n` : "") +
        `💼 ${fancy("Added to inventory!")}`,
        threadID, messageID
      );
    }
  }
};
