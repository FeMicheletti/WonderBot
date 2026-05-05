import { ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions, User } from "discord.js";

export class AvatarService {
	static async execute( interaction: ChatInputCommandInteraction, user: User | null ): Promise<InteractionReplyOptions> {
		const targetUser = user ?? interaction.user;

		const avatarUrl = targetUser.displayAvatarURL({
			size: 1024,
			extension: "png",
			forceStatic: false,
		});

		const embed = new EmbedBuilder()
			.setTitle(`🖼️ Avatar de ${targetUser.username}`)
			.setImage(avatarUrl)
			.setColor(0x5865f2)
			.setDescription(`[Abrir avatar em tamanho completo](${avatarUrl})`);

		return { embeds: [embed] };
	}
}