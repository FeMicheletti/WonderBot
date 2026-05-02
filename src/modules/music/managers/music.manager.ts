import { AudioPlayerStatus, NoSubscriberBehavior, StreamType, VoiceConnection, VoiceConnectionStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel } from "@discordjs/voice";
import type { Guild, VoiceBasedChannel } from "discord.js";
import { Track, GuildMusicSession } from "../interfaces/music.interface";
import youtubeDl from "youtube-dl-exec";
import logger from "../../../shared/utils/logger.util";
import { request } from "undici";

export class MusicManager {
	private sessions = new Map<string, GuildMusicSession>();

	getSession(guildId: string): GuildMusicSession | undefined {
		return this.sessions.get(guildId);
	}

	async createOrGetSession(guild: Guild, voiceChannel: VoiceBasedChannel): Promise<GuildMusicSession> {
		const existing = this.sessions.get(guild.id);
		if (existing) return existing;

		const connection = joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: guild.id,
			adapterCreator: guild.voiceAdapterCreator as any,
			selfDeaf: true,
			selfMute: false,
		});

		await entersState(connection, VoiceConnectionStatus.Ready, 20_000);

		const player = createAudioPlayer({behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });

		connection.subscribe(player);

		const session: GuildMusicSession = {
			guildId: guild.id,
			connection,
			player,
			channelId: voiceChannel.id,
			currentTrack: 0,
			queue: [],
			isPlaying: false,
		};

		player.on(AudioPlayerStatus.Idle, async () => {
			session.currentTrack++;

			if (session.currentTrack >= session.queue.length) {
				this.destroySession(guild.id);
				return;
			}

			await this.playCurrent(guild.id);
		});

		player.on("error", (error) => {
			logger.error(`[MusicManager] Erro no player da guild ${guild.id}:`, error);
			session.currentTrack++;

			if (session.currentTrack >= session.queue.length) {
				this.destroySession(guild.id);
				return;
			}

			void this.playCurrent(guild.id);
		});

		connection.on("error", (error) => {
			logger.error(`[MusicManager] Erro na conexão da guild ${guild.id}:`, error);
			this.destroySession(guild.id);
		});

		this.sessions.set(guild.id, session);
		return session;
	}

	async enqueue(guild: Guild, voiceChannel: VoiceBasedChannel, track: Track): Promise<{ message: string; track: Track }> {
		const session = await this.createOrGetSession(guild, voiceChannel);

		session.queue.push(track);

		if (!session.isPlaying) {
			session.currentTrack = 0;
			await this.playCurrent(guild.id);
		}

		return { message: session.isPlaying ? `📥 Adicionado à fila: **${track.title}**` : `🎵 Tocando agora: **${track.title}**`, track };
	}

	async playCurrent(guildId: string): Promise<void> {
		const session = this.sessions.get(guildId);
		if (!session) return;

		const track = session.queue[session.currentTrack];

		if (!track?.url) {
			logger.warn(`[MusicManager] Track inválido: ${track?.title || "Desconhecido"}`);

			session.currentTrack++;

			if (session.currentTrack >= session.queue.length) {
				this.destroySession(guildId);
				return;
			}

			return this.playCurrent(guildId);
		}

		logger.info(`[MusicManager] Tocando: ${track.title} (${track.url})`);

		try {
			const info = await youtubeDl(track.url, { dumpSingleJson: true, noWarnings: true, noCheckCertificates: true, preferFreeFormats: true, cookies: "src/app/cookies.txt" }) as any;

			const audioFormat =
				info?.requested_downloads?.find((f: any) => f?.url && f?.acodec !== "none") ||
				info?.formats?.filter((f: any) => f?.url && f?.acodec !== "none")?.sort((a: any, b: any) => (b.abr ?? 0) - (a.abr ?? 0))[0];

			const audioUrl = audioFormat?.url;

			if (!audioUrl) {
				logger.error("[MusicManager] yt-dlp não retornou URL de áudio.", {
					title: info?.title,
					formatCount: info?.formats?.length,
				});
				throw new Error("Não consegui extrair uma URL de áudio com yt-dlp.");
			}

			logger.info("[MusicManager] Áudio extraído:", JSON.stringify({
				title: info?.title,
				formatId: audioFormat?.format_id,
				ext: audioFormat?.ext,
				acodec: audioFormat?.acodec,
				abr: audioFormat?.abr,
			}));

			const { body } = await request(audioUrl);

			const resource = createAudioResource(body, {
				inputType: StreamType.WebmOpus,
				inlineVolume: true,
			});

			session.isPlaying = true;
			session.player.play(resource);

			session.player.once(AudioPlayerStatus.Idle, () => {
				session.isPlaying = false;
			});
			logger.info(`[MusicManager] Iniciando reprodução: ${track.title}`);
		} catch (error) {
			logger.error("[MusicManager] Erro ao tocar faixa com yt-dlp:", error);

			session.currentTrack++;

			if (session.currentTrack >= session.queue.length) {
				this.destroySession(guildId);
				return;
			}

			return this.playCurrent(guildId);
		}
	}

	skip(guildId: string): string {
		const session = this.sessions.get(guildId);
		if (!session || session.queue.length === 0) return "📭 A fila está vazia.";

		const current = session.queue[session.currentTrack];
		session.player.stop(true);

		return `⏭️ Pulando: **${current.title}**`;
	}

	stop(guildId: string): string {
		const session = this.sessions.get(guildId);
		if (!session) return "📭 Não há sessão ativa.";

		this.destroySession(guildId);
		return "⏹️ Música parada e fila limpa.";
	}

	getQueue(guildId: string): { current?: Track; upcoming: Track[] } | null {
		const session = this.sessions.get(guildId);
		if (!session || session.queue.length === 0) return null;

		return {
			current: session.queue[session.currentTrack],
			upcoming: session.queue.slice(session.currentTrack + 1),
		};
	}

	destroySession(guildId: string): void {
		const session = this.sessions.get(guildId);
		if (!session) return;

		session.queue = [];
		session.isPlaying = false;

		try {
			session.player.stop();
		} catch {}

		try {
			session.connection.destroy();
		} catch {}

		this.sessions.delete(guildId);
	}
}