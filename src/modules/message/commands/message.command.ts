import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { MessageService } from "../services/message.service";

export default {
	data: new SlashCommandBuilder()
		.setName("message")
		.setDescription("Faz a Wonder enviar uma mensagem em embed")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addChannelOption((option) =>
			option
				.setName("canal")
				.setDescription("Canal onde a mensagem será enviada")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("titulo")
				.setDescription("Título da mensagem")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("descricao")
				.setDescription("Descrição/conteúdo da mensagem")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("cor")
				.setDescription("Cor do embed em HEX. Exemplo: #5865F2")
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName("imagem")
				.setDescription("URL de uma imagem grande para o embed")
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName("thumbnail")
				.setDescription("URL de uma imagem pequena para o canto do embed")
				.setRequired(false)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const result = await MessageService.execute(interaction);
		await interaction.editReply(result);
	},
};