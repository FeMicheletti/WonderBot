import { AudioPlayerStatus, NoSubscriberBehavior, VoiceConnectionStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel } from "@discordjs/voice";
import type { Guild, VoiceBasedChannel } from "discord.js";
import { Track, GuildMusicSession } from "../interfaces/music.interface";
import youtubeDl from "youtube-dl-exec";
import logger from "../../../shared/utils/logger.util";
import { request } from "undici";
import { CookieService } from "../services/cookies.service";

export class MusicManager {
	private readonly IDLE_TIMEOUT_MS = 5 * 60 * 1000;
	private readonly PAUSE_TIMEOUT_MS = 10 * 60 * 1000;

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
			isPaused: false,
		};

		player.on(AudioPlayerStatus.Idle, async () => {
			session.isPlaying = false;
			session.currentTrack++;

			if (session.currentTrack >= session.queue.length) {
				session.queue = [];
				session.currentTrack = 0;

				this.scheduleIdleDestroy(guild.id);
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

		this.clearIdleDestroy(session);

		const wasPlaying = session.isPlaying;

		session.queue.push(track);

		if (!session.isPlaying && !session.isPaused) {
			session.currentTrack = session.queue.length - 1;
			await this.playCurrent(guild.id);
		}

		return {
			message: wasPlaying ? `📥 Adicionado à fila: **${track.title}**` : `🎵 Tocando agora: **${track.title}**`,
			track,
		};
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
			await CookieService.refreshYoutubeCookiesIfNeeded();

			const info = await youtubeDl(track.url, { 
				dumpSingleJson: true, 
				noWarnings: true, 
				noCheckCertificates: true, 
				preferFreeFormats: true, 
				cookies: "cookies.txt", 
				format: "bestaudio/best",
				remoteComponent: "ejs:github",
			}) as any;

			const audioFormat =
				info?.requested_downloads?.[0] ||
				info?.formats ?.filter((f: any) => f?.url && f?.acodec !== "none") ?.sort((a: any, b: any) => (b.abr ?? 0) - (a.abr ?? 0))[0];

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
				inlineVolume: true,
			});

			this.clearPauseDestroy(session);

			session.isPaused = false;
			session.isPlaying = true;
			session.player.play(resource);

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

	pause(guildId: string): string {
		const session = this.sessions.get(guildId);

		if (!session || session.queue.length === 0) {
			return "📭 Não há música tocando no momento.";
		}

		if (session.isPaused) {
			return "⏸️ A música já está pausada.";
		}

		const paused = session.player.pause();

		if (!paused) {
			return "Não consegui pausar a música.";
		}

		session.isPlaying = false;
		session.isPaused = true;

		this.schedulePauseDestroy(guildId);

		return `⏸️ Música pausada: **${session.queue[session.currentTrack]?.title ?? "Desconhecida"}**`;
	}

	resume(guildId: string): string {
		const session = this.sessions.get(guildId);

		if (!session || session.queue.length === 0) {
			return "📭 Não há música para continuar.";
		}

		if (!session.isPaused) {
			return "▶️ A música não está pausada.";
		}

		const resumed = session.player.unpause();

		if (!resumed) {
			return "Não consegui continuar a música.";
		}

		this.clearPauseDestroy(session);

		session.isPaused = false;
		session.isPlaying = true;

		return `▶️ Continuando: **${session.queue[session.currentTrack]?.title ?? "Desconhecida"}**`;
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

		if (session.idleTimeout) {
			clearTimeout(session.idleTimeout);
			session.idleTimeout = undefined;
		}

		if (session.pauseTimeout) {
			clearTimeout(session.pauseTimeout);
			session.pauseTimeout = undefined;
		}

		session.queue = [];
		session.isPlaying = false;
		session.isPaused = false;

		try {
			session.player.stop();
		} catch {}

		try {
			session.connection.destroy();
		} catch {}

		this.sessions.delete(guildId);
	}

	private scheduleIdleDestroy(guildId: string): void {
		const session = this.sessions.get(guildId);
		if (!session) return;

		if (session.idleTimeout) {
			clearTimeout(session.idleTimeout);
		}

		logger.info(`[MusicManager] Fila encerrada. Aguardando 5 minutos antes de sair da call. Guild: ${guildId}`);

		session.idleTimeout = setTimeout(() => {
			const currentSession = this.sessions.get(guildId);

			if (!currentSession) return;

			if (!currentSession.isPlaying && !currentSession.isPaused && currentSession.queue.length === 0) {
				logger.info(`[MusicManager] Timeout de inatividade atingido. Encerrando sessão da guild ${guildId}.`);
				this.destroySession(guildId);
			}
		}, this.IDLE_TIMEOUT_MS);
	}

	private clearIdleDestroy(session: GuildMusicSession): void {
		if (session.idleTimeout) {
			clearTimeout(session.idleTimeout);
			session.idleTimeout = undefined;
		}
	}

	private schedulePauseDestroy(guildId: string): void {
		const session = this.sessions.get(guildId);
		if (!session) return;

		this.clearPauseDestroy(session);

		logger.info(`[MusicManager] Música pausada. Aguardando 10 minutos antes de sair da call. Guild: ${guildId}`);

		session.pauseTimeout = setTimeout(() => {
			const currentSession = this.sessions.get(guildId);

			if (!currentSession) return;

			if (currentSession.isPaused && !currentSession.isPlaying) {
				logger.info(`[MusicManager] Timeout de pause atingido. Encerrando sessão da guild ${guildId}.`);
				this.destroySession(guildId);
			}
		}, this.PAUSE_TIMEOUT_MS);
	}

	private clearPauseDestroy(session: GuildMusicSession): void {
		if (session.pauseTimeout) {
			clearTimeout(session.pauseTimeout);
			session.pauseTimeout = undefined;
		}
	}
}