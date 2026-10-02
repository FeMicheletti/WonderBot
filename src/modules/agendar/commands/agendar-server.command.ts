import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { AgendarService } from "../services/agendar.service";

export default {
	data: new SlashCommandBuilder()
		.setName("agendar-server")
		.setDescription("Cria um lembrete diário no servidor")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.addChannelOption((option) =>
			option
				.setName("canal")
				.setDescription("Canal onde a Wonder vai enviar o lembrete")
				.setRequired(true)
		)
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
		)
		.addRoleOption((option) =>
			option
				.setName("cargo")
				.setDescription("Cargo que será mencionado")
				.setRequired(false)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const result = await AgendarService.createServer(interaction);
		await interaction.editReply(result);
	},
};