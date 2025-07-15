import { discordClient } from './client.js';

// Send a message to a specific channel
export async function sendToDiscord(channelId, content, embed = null) {
  try {
    if (discordClient.isReady()) {
      const channel = discordClient.channels.cache.get(channelId);

      if (!channel) {
        console.error(`❌ Discord Channel with ID ${channelId} not found or inaccessible.`);
        return;
      }

      const options = { content: content };

      if (embed) {
        options.embeds = [embed];
      }

      await channel.send(options);
      console.log(`✅ Message sent to '${channel.name}'.`);
    } else {
      console.warn(`⏳ [Discord Message] Waiting for client.`);
    }
  } catch (err) {
    console.error('❌ Failed to send message to Discord: ', err);
  }
}