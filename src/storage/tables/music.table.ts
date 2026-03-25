import { BaseJsonTable } from '../BaseJsonTable';
import { GuildMusicSession } from '../interfaces/music.interface';

export class MusicDatabase extends BaseJsonTable<Record<string, GuildMusicSession>> {
    constructor() {
        super('src/storage/data/music.data.json');
    }

    protected getDefaultData(): Record<string, GuildMusicSession> {
        return {};
    }

    public findById(guildId: string): GuildMusicSession | null {
        return Object.values(this.data).find(session => session.guildId === guildId) ?? null;
    }

    public upsert(item: GuildMusicSession): void {
        this.data[item.guildId] = item;
        this.save();
    }

    public remove(guildId: string): void {
        delete this.data[guildId];
        this.save();
    }
}