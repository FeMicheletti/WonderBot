import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, InteractionReplyOptions, MessageFlags } from "discord.js";
import play from "play-dl";
import { MusicDatabase } from "../../../storage/tables/music.table";
import { GuildMusicSession, Track } from "../../../storage/interfaces/music.interface";

export class MusicService {
    static async play(member: GuildMember, url: string, interaction: ChatInputCommandInteraction): Promise<InteractionReplyOptions> {
        const isYoutube = play.yt_validate(url) === "video";

        if (!isYoutube) return {
            content: "Envie um link válido de vídeo do YouTube.",
            flags: MessageFlags.Ephemeral
        };

        const video = await play.video_basic_info(url);

        const track = {
            title: video.video_details.title || "Unknown Title",
            url,
            requestedBy: interaction.user.username,
            duration: video.video_details.durationRaw,
            thumbnail: video.video_details.thumbnails?.[0]?.url,
        };

        const result = await MusicService.queueManager(interaction.guildId || "", member.voice.channelId!, track);

        return { content: result };
    }

    static async queue(guildId: string):  Promise<InteractionReplyOptions> {
        const musicDb = new MusicDatabase();
        const session = musicDb.findById(guildId);

        if (!session || !session.queue || session.queue.length === 0) return { content: "📭 A fila está vazia."};

        const embed = new EmbedBuilder()
            .setTitle("🎶 Fila de músicas")
            .setDescription(
                session.currentTrack
                    ? `**Tocando agora:** ${session.queue[session.currentTrack].title}\nPedido por: ${session.queue[session.currentTrack].requestedBy}`
                    : "Nada tocando no momento."
            )
            .addFields({
                name: "Próximas",
                value:
                    session.queue.length > 0
                        ? session.queue.map((track, index) =>`${index + 1}. **${track.title}** — pedido por ${track.requestedBy}`).join("\n") 
                        : "Nenhuma música na fila.",
            });

        return { embeds: [embed], content: "" };
    }

    static async stop(guildId: string): Promise<InteractionReplyOptions> {
        const musicDb = new MusicDatabase();
        const session = musicDb.findById(guildId);

        if (session) {
            session.queue = [];
            musicDb.upsert(session);
        }

        return { content: "⏹️ Música parada e fila limpa." };
    }

    static async skip(guildId: string): Promise<InteractionReplyOptions> {
        const musicDb = new MusicDatabase();
        const session = musicDb.findById(guildId);

        if (!session || !session.queue || session.queue.length === 0) return { content: "📭 A fila está vazia."};
        
        const skippedTrack = session.queue[session.currentTrack];
        session.currentTrack++;

        if (session.currentTrack >= session.queue.length) {
            session.currentTrack = 0;
            session.queue = [];
        }

        musicDb.upsert(session);

        return { content: `⏭️ Pulando: **${skippedTrack.title}**` };
    }

    static async queueManager(guild: string, channel: string, track: Track): Promise<string> {
        const musicDb = new MusicDatabase();
        const session = musicDb.findById(guild);

        if (!session) {
            const newSession: GuildMusicSession = {
                guildId: guild,
                channel: channel,
                connection: null,
                player: null,
                currentTrack: 0,
                queue: [track],
            };
            musicDb.upsert(newSession);

            return `🎵 Tocando agora: **${track.title}**`;
        } else {
            session.queue.push(track);
            musicDb.upsert(session);

            return `📥 Adicionado à fila: **${track.title}** (posição ${session.queue.length})`;
        }
    }
}