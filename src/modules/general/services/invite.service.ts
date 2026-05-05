import { ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions, PermissionFlagsBits } from "discord.js";

export class InviteService {
	static async execute( interaction: ChatInputCommandInteraction ): Promise<InteractionReplyOptions> {
		const clientId = interaction.client.user?.id;

		if (!clientId) return { content: "Não consegui identificar o ID do bot." };

		const permissions =
			PermissionFlagsBits.SendMessages |
			PermissionFlagsBits.EmbedLinks |
			PermissionFlagsBits.ReadMessageHistory |
			PermissionFlagsBits.ManageMessages |
			PermissionFlagsBits.Connect |
			PermissionFlagsBits.Speak |
			PermissionFlagsBits.UseVAD;

		const inviteUrl =
			`https://discord.com/oauth2/authorize` +
			`?client_id=${clientId}` +
			`&permissions=${permissions.toString()}` +
			`&integration_type=0` +
			`&scope=bot+applications.commands`;

		const embed = new EmbedBuilder()
			.setTitle("🔗 Invite do bot")
			.setDescription(`[Clique aqui para adicionar o bot ao seu servidor](${inviteUrl})`)
			.setColor(0x5865f2);

		return { embeds: [embed] };
	}
}