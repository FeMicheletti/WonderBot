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
    connection: VoiceConnection | null;
    player: AudioPlayer;
    queue: Track[];
    currentTrack: Track | null;
};