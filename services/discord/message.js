import { client } from './client.js';

// Send a message to a specific channel
export async function sendToDiscord(channelId, content) {
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      console.error('❌ Channel not found.');
      return;
    }

    await channel.send(content);
    console.log(`📨 Sent message to Discord channel ${channelId}`);
  } catch (err) {
    console.error('❌ Failed to send message to Discord: ', err);
  }
}