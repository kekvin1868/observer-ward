import { AtpAgent } from '@atproto/api';
import { bluesky } from '../../config.js';

const agent = new AtpAgent({
  service: 'https://bsky.social',
});

export async function login() {
  try {
    await agent.login({
      identifier: bluesky.handle,
      password: bluesky.pass,
    });

    console.log(`✅ Logged in to Bluesky as ${bluesky.handle}`);
  } catch (error) {
    console.error('❌ Bluesky login failed:', error);
  }
}

await login();

export { agent };