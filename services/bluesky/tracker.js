import 'dotenv/config';
import { agent } from './client.js';
import { bluesky } from '../../config.js';
import fs from 'fs/promises';
import path from 'path';

const SEEN_PATH = path.resolve(process.env.SEEN_BSKY_PATH);

// Set handles
const handleChoices = ['nytimes.com', 'washingtonpost.com', 'bloomberg.com'];

// Load memory
async function loadSeen() {
  try {
    const raw = await fs.readFile(SEEN_PATH, 'utf-8');

    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Save memory
async function saveSeen(seen) {
  await fs.writeFile(SEEN_PATH, JSON.stringify(seen, null, 2));
}

// Fetch posts from `handles`
async function fetchPostsForUser(hdl, lm) {
  try {
    const { data } = await agent.resolveHandle({
      handle: hdl
    });

    const response = await agent.app.bsky.feed.getAuthorFeed({
      actor: data.did,
      limit: lm,
    });
    
    return { did: data.did, posts: response.data.feed };
  } catch(e) {
    console.error('Error fetching posts: ', e);
    
    return { did: null, posts: [] };
  }
}

async function runTracker() {
  // Fetch seen posts
  const seen = await loadSeen();

  // Check posts
  for (const handle of handleChoices) {
    console.log(`🔨 Fetching handle from: ${handle}`);
    const limit = bluesky.feedLimit;

    const { did, posts } = await fetchPostsForUser(handle, limit);
    if (!did || posts.length === 0) continue;

    const seenUris = seen[did] || [];
    const newPosts = posts.filter(p => !seenUris.includes(p.post.uri));

    for (const n of newPosts) {
      console.log(`📰 New post from ${handle}: ${n.post.uri}`);
    }

    // Add new URIs based of current handle
    seen[did] = [...seenUris, ...newPosts.map(n => n.post.uri)];
  }

  await saveSeen(seen);
}

runTracker();