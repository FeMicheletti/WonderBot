import { ChatInputCommandInteraction, InteractionEditReplyOptions, Role, TextChannel } from "discord.js";
import { ReactionRoleStorageService } from "./reaction-role-storage.service";

export class ReactionRoleService {
	static async add( interaction: ChatInputCommandInteraction ): Promise<InteractionEditReplyOptions> {
		const channel = interaction.options.getChannel("canal", true);
		const messageId = interaction.options.getString("mensagem_id", true);
		const emoji = interaction.options.getString("emoji", true);
		const role = interaction.options.getRole("cargo", true);

		if (!interaction.guild) return { content: "Esse comando só pode ser usado dentro de um servidor." };
		if (!(channel instanceof TextChannel)) return { content: "O canal informado precisa ser um canal de texto." };
		if (!(role instanceof Role)) return { content: "O cargo informado é inválido." };

		const botMember = await interaction.guild.members.fetchMe();
		if (role.position >= botMember.roles.highest.position) return { content: "Não consigo entregar esse cargo. O cargo da Wonder precisa estar acima dele na hierarquia." };

		const message = await channel.messages.fetch(messageId).catch(() => null);
		if (!message) return { content: "Não encontrei essa mensagem nesse canal. Confere o canal e o ID da mensagem." };

		await message.react(emoji);

		ReactionRoleStorageService.add({
			guildId: interaction.guild.id,
			channelId: channel.id,
			messageId: message.id,
			emoji,
			roleId: role.id,
			createdAt: new Date().toISOString(),
		});

		return {
			content: [
				"✅ Reaction role configurado com sucesso.",
				`Mensagem: \`${message.id}\``,
				`Emoji: ${emoji}`,
				`Cargo: ${role}`,
			].join("\n"),
		};
	}

	static async remove(interaction: ChatInputCommandInteraction): Promise<InteractionEditReplyOptions> {
		const channel = interaction.options.getChannel("canal", true);
		const messageId = interaction.options.getString("mensagem_id", true);
		const emoji = interaction.options.getString("emoji", true);

		if (!interaction.guild) return { content: "Esse comando só pode ser usado dentro de um servidor." };
		if (!(channel instanceof TextChannel)) return { content: "O canal informado precisa ser um canal de texto." };

		const removed = ReactionRoleStorageService.remove({ guildId: interaction.guild.id, messageId, emoji });
		const message = await channel.messages.fetch(messageId).catch(() => null);

		if (message) {
			const reaction = message.reactions.cache.find((item) => item.emoji.toString() === emoji);
			if (reaction) await reaction.users.remove(interaction.client.user!.id).catch(() => null);
		}

		if (removed === 0) return { content: "Não encontrei nenhuma configuração com esse ID de mensagem e emoji." };

		return {
			content: [
				"✅ Reaction role removido com sucesso.",
				`Mensagem: \`${messageId}\``,
				`Emoji: ${emoji}`,
			].join("\n"),
		};
	}
}