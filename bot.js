import 'dotenv/config';
import { login as loginBsky } from './services/bluesky/client.js';
import { discordClient } from './services/discord/client.js';

async function startBot() {
  await loginBsky();

  discordClient.on('messageCreate', async message => {
    // Ignore bot messages
    if (message.author.bot) return;

    if (message.content.startsWith('/hello')) {
      message.reply('Hello there! I am online and listening.');
    }
  });

  console.log('🤖 Bot is up and running!');
}

startBot().catch(console.error);