import { ChatInputCommandInteraction, GuildMember, InteractionEditReplyOptions, PermissionFlagsBits, TextChannel } from "discord.js";
import logger from "../../../shared/utils/logger.util";

export class ClearService {
	static async execute( deleteCount: number, interaction: ChatInputCommandInteraction ): Promise<InteractionEditReplyOptions> {
		if (!interaction.guild) return { content: "Esse comando só pode ser usado em um servidor." };

		if (deleteCount < 1 || deleteCount > 99) return { content: "Forneça um número entre **1 e 99 mensagens** para excluir." };

		const member = interaction.member as GuildMember;

		if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) return { content: "Você precisa da permissão **Gerenciar mensagens** para usar esse comando." };

		const channel = interaction.channel;

		if (!channel || !(channel instanceof TextChannel)) return { content: "Esse comando só pode ser usado em um canal de texto." };

		const botMember = interaction.guild.members.me;

		if (!botMember?.permissionsIn(channel).has(PermissionFlagsBits.ManageMessages)) return { content: "Eu preciso da permissão **Gerenciar mensagens** nesse canal." };

		try {
			const deletedMessages = await channel.bulkDelete(deleteCount, false);

			return { content: `🧹 ${deletedMessages.size} mensagem(ns) excluída(s) com sucesso.` };
		} catch (error) {
			logger.error("Erro ao excluir mensagens:", error);

			return { content: "Não foi possível excluir as mensagens. Verifique minhas permissões e se as mensagens não têm mais de 14 dias." };
		}
	}
}