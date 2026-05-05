import { ChannelType, ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions } from "discord.js";

export class ServerInfoService {
	static async execute( interaction: ChatInputCommandInteraction ): Promise<InteractionReplyOptions> {
		const guild = interaction.guild;

		if (!guild) return { content: "Esse comando só pode ser usado em um servidor." };
		await guild.fetch();

		const owner = await guild.fetchOwner();

		const textChannels = guild.channels.cache.filter( (channel) => channel.type === ChannelType.GuildText ).size;

		const voiceChannels = guild.channels.cache.filter( (channel) => channel.type === ChannelType.GuildVoice ).size;

		const categories = guild.channels.cache.filter( (channel) => channel.type === ChannelType.GuildCategory ).size;

		const createdAtTimestamp = Math.floor(guild.createdTimestamp / 1000);

		const embed = new EmbedBuilder()
			.setTitle(`📊 Informações do servidor`)
			.setThumbnail(guild.iconURL({ size: 256 }) ?? null)
			.setColor(0x5865f2)
			.addFields(
				{ name: "Nome", value: guild.name, inline: true },
				{ name: "ID", value: guild.id, inline: true },
				{ name: "Dono", value: `${owner.user.tag}`, inline: true },
				{ name: "Membros", value: `${guild.memberCount}`, inline: true },
				{ name: "Canais", value: [ `Texto: **${textChannels}**`, `Voz: **${voiceChannels}**`, `Categorias: **${categories}**` ].join("\n"), inline: true },
				{ name: "Criado em", value: `<t:${createdAtTimestamp}:F>\n<t:${createdAtTimestamp}:R>`, inline: false }
			)
			.setFooter({ text: `Servidor ID: ${guild.id}` });

		return { embeds: [embed] };
	}
}