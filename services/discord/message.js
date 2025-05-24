import { client } from './client.js';

// Send a message to a specific channel
export async function sendToDiscord(channelId, content, embedData = null) {
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      console.error('❌ Channel not found.');
      return;
    }

    const messagePayload = embedData
      ? { content, embeds: [embedData] }
      : { content };

    await channel.send(messagePayload);
    console.log(`📨 Sent message to Discord channel ${channelId}`);
  } catch (err) {
    console.error('❌ Failed to send message to Discord: ', err);
  }
}