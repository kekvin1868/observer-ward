import { discordClient } from './client.js';

// Send a message to a specific channel
export async function sendToDiscord(channelId, content, embed = null) {
  try {
    if (discordClient.isReady()) {
      const channel = discordClient.channels.cache.get(channelId);

      if (!channel) {
        try {
          channel = await discordClient.channels.fetch(channelId);
          console.log(`[Discord Message] Channel ${channelId} fetched successfully (was not in cache).`);
        } catch (fetchError) {
          console.error(`❌ Discord Channel with ID ${channelId} not found or inaccessible after fetching:`, fetchError.message);
          return; // Return if fetching also fails
        }
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