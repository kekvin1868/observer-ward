import 'dotenv/config';
import { login as loginBsky } from './services/bluesky/client.js';
import { discordClient } from './services/discord/client.js';
import { Events } from 'discord.js';
import { loadCommands, commands as commandsConstructor, commands } from './utils/commandLoader.js';
import { runTracker, startTracker } from './services/bluesky/tracker.js';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url); // Corrected __fileName to __filename for consistency
const __dirname = path.dirname(__filename);

const commandsPath = path.join(__dirname, 'commands');

async function startBot() {
  discordClient.commands = commandsConstructor;
  await loadCommands(commandsPath);
  console.log(`✅ Loaded ${discordClient.commands.size} application (/) commands.`);

  await loginBsky();

  await discordClient.login(process.env.DISCORD_TOKEN);

  discordClient.once(Events.ClientReady, c => {
    console.log(`🎉 Discord Bot Ready! Logged in as ${c.user.tag}`);
    
    startTracker(45 * 60 * 1000);
  });

  // Error monitoring
  discordClient.on(Events.Error, error => {
    console.error(`🔴 Discord Client Error:`, error);
  });

  discordClient.on(Events.Warn, info => {
    console.warn(`🟠 Discord Client Warning:`, info);
  });

  discordClient.on(Events.ShardReady, (id, unavailableGuilds) => {
    console.log(`🌐 Shard ${id} is ready. Unavailable Guilds: ${unavailableGuilds ? unavailableGuilds.size : 0}`);
  });
  discordClient.on(Events.Resumed, () => {
    console.log(`🟢 Connection Resumed!`);
  });
  discordClient.on(Events.Disconnect, (event) => {
    console.warn(`⚫ Disconnected from Discord:`, event);
  });

  discordClient.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`❌ No command matching ${interaction.commandName} was found in bot's collection.`);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Sorry, I couldn\'t find that command.', ephemeral: true });
      }
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`❌ Error executing command "${interaction.commandName}":`, error);
      console.error(error.stack);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
  });

  console.log('🤖 Bot is up and running!'); // This final log indicates successful startup
}

startBot().catch(console.error);