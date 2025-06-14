import { SlashCommandBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('subscribe')
        .setDescription('Subscribe to a news feed from bluesky.')
        .addStringOption(option =>
            option.setName('platform')
                .setDescription('The platform (e.g., bluesky, youtube).')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('handle')
                .setDescription('The handle or channel name to subscribe to.')
                .setRequired(true)),

    async execute(interaction) {
        const platform = interaction.options.getString('platform');
        const handle = interaction.options.getString('handle');

        // Bot reply after command interaction
        await interaction.reply({
            content: `💡 Acknowledged \n\n You're about to subscribe to **${handle}** on **${platform}**.`,
            flags: MessageFlags.Ephemeral
        });
        
        // Debugging (CORRECTED LINE BELOW)
        console.log(`[SLASH COMMAND] User ${interaction.user.tag} (ID: ${interaction.user.id}) used /subscribe for "${handle}" on "${platform}" in channel "${interaction.channel.name}" (ID: ${interaction.channel.id}).`);
    },
};