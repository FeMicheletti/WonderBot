import type { AudioPlayer, VoiceConnection } from "@discordjs/voice";

export interface Track {
    title: string;
    url: string;
    requestedBy: string;
    duration?: string;
    thumbnail?: string;
}

export interface GuildMusicSession {
    guildId: string;
    connection: VoiceConnection;
    player: AudioPlayer;
    channelId: string;
    currentTrack: number;
    queue: Track[];
    isPlaying: boolean;
    idleTimeout?: NodeJS.Timeout;
}