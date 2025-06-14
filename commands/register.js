import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
const commandsPath = path.join(__dirname); // Current directory

// Reads all command files
function readCommands(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dir, file.name);

      if (file.isDirectory()) {
        readCommands(filePath); // Read through the services commands
      } else if (file.isFile() && file.name.endsWith('.js')) {
        // Exclude register.js
        if (file.name === 'register.js') continue;

        commands.push(filePath); // Store the path to the command file
      }
    }
}

readCommands(commandsPath);

const loadedCommandData = []; // Holds command data

for (const commandFilePath of commands) {
    try {
        const command = await import(commandFilePath);
        if ('data' in command.default && 'execute' in command.default) {
            loadedCommandData.push(command.default.data.toJSON());
        } else {
            console.warn(`⚠️ Command at \n\n ${commandFilePath} \n\n Requires "data" or "execute" property.`);
        }
    } catch (error) {
        console.error(`❌ Error loading command from ${commandFilePath}:`, error);
    }
}

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CLIENT_ID = process.env.APP_ID;

if (!DISCORD_TOKEN) {
  console.error('❌ Discord Token is missing.');
  process.exit(1);
}
if (!DISCORD_CLIENT_ID) {
  console.error('❌ Discord client ID is missing.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log(`📡 Refreshing ${loadedCommandData.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationCommands(DISCORD_CLIENT_ID),
      { body: loadedCommandData },
    );

    console.log(`✅ Reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
})();