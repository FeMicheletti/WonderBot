import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	InteractionEditReplyOptions,
	TextChannel,
} from "discord.js";

export class MessageService {
	static async execute( interaction: ChatInputCommandInteraction ): Promise<InteractionEditReplyOptions> {
		const channel = interaction.options.getChannel("canal", true);
		const title = interaction.options.getString("titulo", true);
		const description = interaction.options.getString("descricao", true);
		const color = interaction.options.getString("cor") ?? "#5865F2";
		const image = interaction.options.getString("imagem");
		const thumbnail = interaction.options.getString("thumbnail");

		if (!interaction.guild) return { content: "Esse comando só pode ser usado dentro de um servidor." };
		if (!(channel instanceof TextChannel)) return { content: "O canal informado precisa ser um canal de texto." };

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setDescription(description)
			.setColor(this.parseColor(color))
			.setFooter({
				text: `Mensagem enviada por ${interaction.user.username}`,
				iconURL: interaction.user.displayAvatarURL(),
			})
			.setTimestamp();

		if (image) embed.setImage(image);
		if (thumbnail) embed.setThumbnail(thumbnail);

		const message = await channel.send({ embeds: [embed] });

		return {
			content: [
				"✅ Mensagem enviada com sucesso.",
				`Canal: ${channel}`,
				`ID da mensagem: \`${message.id}\``,
				"",
				"Para adicionar cargo por reação, use:",
				`\`/reaction-role-add canal:${channel.name} mensagem_id:${message.id} emoji:✅ cargo:@Cargo\``,
			].join("\n"),
		};
	}

	private static parseColor(color: string): number {
		const normalized = color.replace("#", "");
		const isValidHex = /^[0-9A-Fa-f]{6}$/.test(normalized);

		if (!isValidHex) return 0x5865f2;

		return parseInt(normalized, 16);
	}
}