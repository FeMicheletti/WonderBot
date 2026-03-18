const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('ping').setDescription('Mostra a latência do bot'),
        
    async execute(interaction) {
        const sent = await interaction.reply({
            content: 'Calculando ping...',
            fetchReply: true,
        });

        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiPing = Math.round(interaction.client.ws.ping);

        await interaction.editReply(
            `🏓 Pong!\nLatência do bot: **${latency}ms**\nLatência da API: **${apiPing}ms**`
        );
    },
};