import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, InteractionEditReplyOptions, InteractionReplyOptions } from "discord.js";
import { Track } from "../interfaces/music.interface";
import { MusicManager } from "../managers/music.manager";
import youtubeDl from "youtube-dl-exec";
import logger from "../../../shared/utils/logger.util";

export class MusicService {
	private static manager = new MusicManager();

	static normalizeYouTubeUrl(rawUrl: string): string | null {
		try {
			const url = new URL(rawUrl);

			if (url.hostname === "youtu.be" || url.hostname === "www.youtu.be" ) {
				const id = url.pathname.slice(1);
				if (!id) return null;
				return `https://www.youtube.com/watch?v=${id}`;
			}

			if ( url.hostname === "youtube.com" || url.hostname === "www.youtube.com" || url.hostname === "m.youtube.com") {
				const id = url.searchParams.get("v");
				if (!id) return null;
				return `https://www.youtube.com/watch?v=${id}`;
			}

			return null;
		} catch {
			return null;
		}
	}

	static async play( member: GuildMember, url: string, interaction: ChatInputCommandInteraction ): Promise<InteractionEditReplyOptions> {
		if (!interaction.guild) return { content: "Esse comando só pode ser usado em servidor." };

		const voiceChannel = member.voice.channel;
		if (!voiceChannel) return { content: "Você precisa estar em um canal de voz." };

		const normalizedUrl = this.normalizeYouTubeUrl(url);

		if (!normalizedUrl) return { content: "Envie um link válido de vídeo do YouTube." };

		// const video = await youtubeDl(normalizedUrl, {
		// 	dumpSingleJson: true,
		// 	noWarnings: true,
		// 	noCheckCertificates: true,
		// 	skipDownload: true,
		// 	cookies: "src/app/cookies.txt",
		// 	remoteComponent: "ejs:github",
		// }) as any;

		const track: Track = {
			title: "Carregando título...",
			url: normalizedUrl,
			requestedBy: interaction.user.username,
			duration: undefined,
			thumbnail: undefined,
		};
		logger.info(JSON.stringify(track));

		const result = await this.manager.enqueue(interaction.guild, voiceChannel, track);

		return { content: result.message };
	}

	static async queue(guildId: string): Promise<InteractionReplyOptions> {
		const queue = this.manager.getQueue(guildId);

		if (!queue || !queue.current) return { content: "📭 A fila está vazia." };

		const embed = new EmbedBuilder()
			.setTitle("🎶 Fila de músicas")
			.setDescription( `**Tocando agora:** ${queue.current.title}\nPedido por: ${queue.current.requestedBy}` )
			.addFields({
				name: "Próximas",
				value:
				queue.upcoming.length > 0
					? queue.upcoming
						.map((track: Track, index: number) => `${index + 1}. **${track.title}** — pedido por ${track.requestedBy}`)
						.join("\n")
					: "Nenhuma música na fila.",
			});

		return { embeds: [embed] };
	}

	static async stop(guildId: string): Promise<InteractionReplyOptions> {
		return { content: this.manager.stop(guildId) };
	}

	static async skip(guildId: string): Promise<InteractionReplyOptions> {
		return { content: this.manager.skip(guildId) };
	}
}