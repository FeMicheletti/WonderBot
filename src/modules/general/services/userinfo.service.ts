import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, InteractionEditReplyOptions, InteractionReplyOptions, User } from "discord.js";

export class UserInfoService {
	static async execute( interaction: ChatInputCommandInteraction, user: User | null ): Promise<InteractionReplyOptions> {
		if (!interaction.guild) return { content: "Esse comando só pode ser usado em um servidor." };

		const targetUser = user ?? interaction.user;

		let member: GuildMember | null = null;

		try {
			member = await interaction.guild.members.fetch(targetUser.id);
		} catch {
			member = null;
		}

		const createdAtTimestamp = Math.floor(targetUser.createdTimestamp / 1000);

		const joinedAtTimestamp = member?.joinedTimestamp ? Math.floor(member.joinedTimestamp / 1000) : null;

		const roles =
			member?.roles.cache
				.filter((role) => role.id !== interaction.guild!.id)
				.sort((a, b) => b.position - a.position)
				.map((role) => role.toString())
				.slice(0, 20) ?? [];

		const embed = new EmbedBuilder()
			.setTitle(`👤 Informações do usuário`)
			.setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
			.setColor(0x5865f2)
			.addFields(
				{ name: "Usuário", value: `${targetUser.tag}`, inline: true },
				{ name: "ID", value: targetUser.id, inline: true },
				{ name: "Conta criada em", value: `<t:${createdAtTimestamp}:F>\n<t:${createdAtTimestamp}:R>`, inline: false },
				{ name: "Entrou no servidor em", value: joinedAtTimestamp ? `<t:${joinedAtTimestamp}:F>\n<t:${joinedAtTimestamp}:R>` : "Não foi possível obter essa informação.", inline: false },
				{ name: `Cargos (${roles.length})`, value: roles.length > 0 ? roles.join(", ") : "Nenhum cargo.", inline: false }
			)
			.setFooter({
				text: `User ID: ${targetUser.id}`,
			});

		return { embeds: [embed] };
	}
}