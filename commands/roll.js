const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("roll")
		.setDescription("Rola dados no formato NdX (ex: 1d20, 2d6)")
		.addStringOption(option =>
			option
				.setName("dados")
				.setDescription("Formato do dado (ex: 1d20)")
				.setRequired(true)
		),

	async execute(interaction) {
		const input = interaction.options.getString("dados").toLowerCase();

		const match = input.match(/^(\d*)d(\d+)$/);

		if (!match) {
			return interaction.reply({
				content: "Formato inválido. Use algo como `1d20`, `2d6`, `4d10`.",
				ephemeral: true
			});
		}

		let quantidade = parseInt(match[1] || "1");
		const faces = parseInt(match[2]);

		if (quantidade > 100) {
			return interaction.reply({
				content: "Você não pode rolar mais de 100 dados.",
				ephemeral: true
			});
		}

		if (faces < 2) {
			return interaction.reply({
				content: "O dado precisa ter pelo menos 2 faces.",
				ephemeral: true
			});
		}

		const resultados = [];
		let total = 0;

		for (let i = 0; i < quantidade; i++) {
			const roll = Math.floor(Math.random() * faces) + 1;
			resultados.push(roll);
			total += roll;
		}

		await interaction.reply(
			`🎲 **${interaction.user.username} rolou ${quantidade}d${faces}**\n` +
			`Resultados: [${resultados.join(", ")}]\n` +
			`Total: **${total}**`
		);
	}
};