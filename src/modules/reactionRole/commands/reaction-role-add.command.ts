import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { ReactionRoleService } from "../services/reaction-role.service";

export default {
	data: new SlashCommandBuilder()
		.setName("reaction-role-add")
		.setDescription("Adiciona um cargo automático por reação em uma mensagem")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
		.addChannelOption((option) =>
			option
				.setName("canal")
				.setDescription("Canal onde está a mensagem")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("mensagem_id")
				.setDescription("ID da mensagem")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("emoji")
				.setDescription("Emoji que será usado na reação")
				.setRequired(true)
		)
		.addRoleOption((option) =>
			option
				.setName("cargo")
				.setDescription("Cargo que será entregue")
				.setRequired(true)
		),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const result = await ReactionRoleService.add(interaction);
		await interaction.editReply(result);
	},
};