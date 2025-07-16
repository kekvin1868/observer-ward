import { AtpAgent } from '@atproto/api';
import { bluesky } from '../../config.js';

export let agent;

export async function login() {
  agent = new AtpAgent({
    service: 'https://bsky.social',
  });

  try {
    await agent.login({
      identifier: bluesky.handle,
      password: bluesky.pass,
    });

    console.log(`✅ Logged in to Bluesky`);
  } catch (error) {
    console.error('❌ Bluesky login failed:', error);
  }
}