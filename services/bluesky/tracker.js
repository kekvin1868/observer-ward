import 'dotenv/config';
import { sendToDiscord } from '../discord/message.js';
import { EmbedBuilder } from 'discord.js';
import { agent as blueskyAgent } from './client.js';
import { bluesky } from '../../config.js';
import fs from 'fs/promises';
import path from 'path';

const SEEN_PATH = path.resolve(process.env.SEEN_BSKY_PATH);

// Load memory
async function loadSeen() {
  try {
    const raw = await fs.readFile(SEEN_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === 'ENOENT') {
      return {};
    }
    console.error('❌ Error loading seen data:', e);
    return {};
  }
}

// Save memory
async function saveSeen(seen) {
  try {
    await fs.writeFile(SEEN_PATH, JSON.stringify(seen, null, 2));
  } catch (e) {
    console.error('❌ Error saving seen data:', e);
  }
}

// Fetch posts from `handles`
async function fetchPostsForUser(hdl, lm) {
  if (!blueskyAgent) { // Check if agent is initialized
    console.error('❌ Bluesky agent not available.');
    return { did: null, posts: [] };
  }

  try {
    const { data } = await blueskyAgent.resolveHandle({
      handle: hdl
    });

    const response = await blueskyAgent.app.bsky.feed.getAuthorFeed({
      actor: data.did,
      limit: lm,
    });

    return { did: data.did, posts: response.data.feed };
  } catch(e) {
    console.error('❌ Error fetching posts from Bluesky API: ', e);
    return { did: null, posts: [] };
  }
}

export async function runTracker() {
  console.log('--- Running Tracker Cycle ---');

  // Fetch seen posts
  const seen = await loadSeen();

  const testHandleChoices = ['nytimes.com', 'washingtonpost.com'];

  // Check posts
  for (const handle of testHandleChoices) {
    console.log(`🔨 Fetching handle from: ${handle}`);
    const limit = bluesky.feedLimit || 5;

    const { did, posts } = await fetchPostsForUser(handle, limit);
    if (!did || posts.length === 0) {
      console.log(`[Tracker] No new posts or DID not resolved for ${handle}.`);
      continue;
    }

    const seenUris = seen[did] || [];
    const newPosts = posts.filter(p => p.post && p.post.uri && !seenUris.includes(p.post.uri));

    if (newPosts.length === 0) {
      console.log(`[Tracker] No unseen posts for ${handle}`);
    }

    for (const n of newPosts) {
      const currentUri = n.post.uri;
      console.log(`[DEBUG] Processing post. DID: ${did}, Current URI: ${currentUri}`);

      const postUriSegment = currentUri ? currentUri.split('/').pop() : 'UNKNOWN_URI';
      const postUrl = `https://bsky.app/profile/${did}/post/${postUriSegment}`;

      console.log(`[DEBUG] Constructed Post URL: ${postUrl}`);

      const postText = (n.post && n.post.record && n.post.record.text) ? n.post.record.text : 'No text content';

      const embed = new EmbedBuilder()
        .setColor(0x1D9BF0)
        .setTitle(`New post from ${handle}`)
        .setURL(postUrl)
        .setDescription(postText.length > 2048 ? postText.substring(0, 2045) + '...' : postText)
        .setTimestamp(new Date(n.post.record.createdAt));

      const discordChannelId = process.env.DISCORD_CHANNEL_ID;
      if (discordChannelId) {
        await sendToDiscord(process.env.DISCORD_CHANNEL_ID, ``, embed)
      } else {
        console.warn('⚠️ DISCORD_CHANNEL_ID not set in .env. Cannot send Bluesky posts to Discord.');
      }
    }

    // Add new URIs based on current handles
    seen[did] = [...seenUris, ...newPosts.map(n => n.post.uri)];
  }

  await saveSeen(seen);
  console.log('--- Tracker Cycle Finished ---');
}

export async function startTracker(intervalMs) {
  console.log(`📡 Tracker started. Running every ${intervalMs / 1000} seconds.`);

  await runTracker();

  setInterval(async () => {
    await runTracker();
  }, intervalMs);
}