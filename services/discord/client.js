import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds],
});

export { discordClient };