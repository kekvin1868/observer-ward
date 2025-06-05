import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

discordClient.once('ready', () => {
  console.log(`✅ Discord Bot logged in as ${discordClient.user.tag}`);
});

await discordClient.login(process.env.DISCORD_TOKEN);

export { discordClient };