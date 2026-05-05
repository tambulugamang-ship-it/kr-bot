import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const afkUsers = new Map();

client.on('ready', () => {
  console.log(`Login sebagai ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;

  // SET AFK
  if (message.content.startsWith('kafk')) {
    const reason = message.content.slice(5).trim() || 'No reason';

    afkUsers.set(userId, {
      reason,
      time: Date.now()
    });

    try {
      await message.member.setNickname(`[AFK] ${message.member.displayName}`);
    } catch {}

    return message.reply(`Kamu sekarang AFK: ${reason}`);
  }

  // BALIK DARI AFK
  if (afkUsers.has(userId)) {
    afkUsers.delete(userId);

    try {
      let name = message.member.displayName.replace('[AFK] ', '');
      await message.member.setNickname(name);
    } catch {}

    message.reply('Welcome back, AFK dihapus!');
  }

  // CEK MENTION
  message.mentions.users.forEach(user => {
    if (afkUsers.has(user.id)) {
      const data = afkUsers.get(user.id);
      const diff = Date.now() - data.time;

      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);

      let waktu = `${minutes} menit`;
      if (hours > 0) waktu = `${hours} jam`;

      message.reply(`${user.username} sedang AFK ${waktu} lalu. Alasan: ${data.reason}`);
    }
  });
});

client.login(process.env.TOKEN);
