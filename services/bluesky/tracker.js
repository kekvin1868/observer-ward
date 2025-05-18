import { agent } from './client.js';
import fs from 'fs/promises';
import path from 'path';

const SEEN_PATH = path.resolve(process.env.SEEN_BSKY_PATH);

async function loadSeen() {
  try {
    const raw = await fs.readFile(SEEN_PATH, 'utf-8');

    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveSeen(seen) {
  await fs.writeFile(SEEN_PATH, JSON.stringify(seen, null, 2));
}

async function fetchPostsForUser(hdl, lm) {
  try {
    const { did } = await agent.resolveHandle(hdl);
    console.log('NYT DID:', did);

    const response = await agent.app.bsky.feed.getAuthorFeed({
      actor: did,
      limit: lm,
    });
    
    return response.data;
  } catch(e) {
    console.error('Error fetching posts: ', e);
  }
}

fetchPostsForUser('nytimes.com', 5).then(p => {
  console.log(p);
});