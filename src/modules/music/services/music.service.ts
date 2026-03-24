import {
    AudioPlayerStatus,
    NoSubscriberBehavior,
    VoiceConnectionStatus,
    createAudioPlayer,
    createAudioResource,
    entersState,
    getVoiceConnection,
    joinVoiceChannel,
    StreamType,
} from "@discordjs/voice";
import type { Guild, GuildMember } from "discord.js";
import play from "play-dl";
import { AppError } from "../../../shared/errors/app.error";
import { GuildMusicSession, Track } from "../interfaces/music.interface";

export class MusicService {
    private static sessions = new Map<string, GuildMusicSession>();

    static getSession(guildId: string): GuildMusicSession {
        let session = this.sessions.get(guildId);

        if (!session) {
            session = {
                guildId,
                connection: null,
                player: createAudioPlayer({
                    behaviors: {
                        noSubscriber: NoSubscriberBehavior.Pause,
                    },
                }),
                queue: [],
                currentTrack: null,
            };

            session.player.on(AudioPlayerStatus.Idle, async () => {
                await this.playNext(guildId);
            });

            session.player.on("error", async (error) => {
                console.error(`[MUSIC] Erro no player da guild ${guildId}`, error);
                await this.playNext(guildId);
            });

            this.sessions.set(guildId, session);
        }

        return session;
    }

    static async ensureConnection(guild: Guild, member: GuildMember): Promise<GuildMusicSession> {
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            throw new AppError("Você precisa estar em uma call para usar este comando.");
        }

        const session = this.getSession(guild.id);

        const currentConnection = getVoiceConnection(guild.id);
        if (currentConnection) {
            session.connection = currentConnection;
            return session;
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: true,
        });

        connection.on("stateChange", (_, newState) => {
            console.log("[VOICE] state:", newState.status);
        });

        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 15_000);
        } catch (error) {
            console.error("[VOICE] Não chegou em Ready", error);
            console.log("[VOICE] channelId:", voiceChannel.id);
            console.log("[VOICE] guildId:", guild.id);
            connection.destroy();
            throw new AppError("Não consegui conectar na call a tempo. Tente novamente.");
        }

        connection.subscribe(session.player);
        session.connection = connection;

        return session;
    }

    static async addTrack(params: { guild: Guild; member: GuildMember; track: Track }) {
        const session = await this.ensureConnection(params.guild, params.member);

        session.queue.push(params.track);

        const wasIdle = !session.currentTrack;

        if (wasIdle) await this.playNext(params.guild.id);

        return {
            position: session.queue.length,
            track: params.track,
            startedNow: wasIdle,
        };
    }

    static async playNext(guildId: string): Promise<void> {
        const session = this.sessions.get(guildId);
        if (!session) return;

        const nextTrack = session.queue.shift() ?? null;

        if (!nextTrack) {
            session.currentTrack = null;
            return;
        }

        session.currentTrack = nextTrack;

        try {
            const stream = await play.stream(nextTrack.url);

            const resource = createAudioResource(stream.stream, {
                inputType: stream.type ?? StreamType.Arbitrary,
            });

            session.player.play(resource);
        } catch (error) {
            console.error(`[MUSIC] Erro ao tocar ${nextTrack.title}`, error);
            session.currentTrack = null;
            await this.playNext(guildId);
        }
    }

    static skip(guildId: string) {
        const session = this.sessions.get(guildId);

        if (!session || !session.currentTrack) {
            throw new AppError("Não há música tocando no momento.");
        }

        const skippedTrack = session.currentTrack;
        session.player.stop(true);

        return { skippedTrack };
    }

    static stop(guildId: string) {
        const session = this.sessions.get(guildId);

        if (!session) {
            throw new AppError("Não há sessão de música ativa nesta guild.");
        }

        session.queue = [];
        session.currentTrack = null;
        session.player.stop(true);

        if (session.connection) {
            session.connection.destroy();
            session.connection = null;
        }

        this.sessions.delete(guildId);
    }

    static getQueue(guildId: string) {
        const session = this.sessions.get(guildId);

        if (!session) return { currentTrack: null, queue: [] };

        return {
            currentTrack: session.currentTrack,
            queue: session.queue,
        };
    }
}