import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { AgendarService } from "../services/agendar.service";

export default {
	data: new SlashCommandBuilder()
		.setName("agendar")
		.setDescription("Cria um lembrete pessoal diário")
		.addStringOption((option) =>
			option
				.setName("horario")
				.setDescription("Horário diário. Exemplo: 10:00")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("mensagem")
				.setDescription("Mensagem do lembrete")
				.setRequired(true)
		),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const result = await AgendarService.createPersonal(interaction);
		await interaction.editReply(result);
	},
};