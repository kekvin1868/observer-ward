import 'dotenv/config';
import { login } from './services/bluesky/client.js';

async function startBot() {
  await login();

  console.log('🤖 Bot is up and running!');
}

startBot().catch(console.error);