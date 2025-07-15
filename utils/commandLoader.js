import { Collection } from 'discord.js'; // Needed for Collection
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const commands = new Collection();

export async function loadCommands(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(dir, file.name);

    if (file.isDirectory()) {
      await loadCommands(filePath);
      continue;
    }

    if (!file.isFile() || !file.name.endsWith('.js')) {
      continue;
    }

    if (file.name === 'register.js') {
      continue;
    }

    try {
      const command = await import(filePath);

      if (!('data' in command.default) || !('execute' in command.default)) {
        console.warn(`[WARNING] Command at ${filePath} is missing "data" or "execute" property.`);
        continue;
      }

      commands.set(command.default.data.name, command.default);
    } catch (error) {
      console.error(`❌ Error loading command from ${filePath}:`, error);
      console.error(error.stack);
    }
  }
}