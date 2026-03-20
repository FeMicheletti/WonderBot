import { BaseJsonTable } from '../BaseJsonTable';
import { MallItem, MallTableData } from '../interfaces/mall.interface';

export class MallDatabase extends BaseJsonTable<MallTableData> {
    constructor() {
        super('src/storage/data/mall.data.json');
    }

    protected getDefaultData(): MallTableData {
        return {};
    }

    public findById(itemId: string): MallItem | null {
        return Object.values(this.data).find(item => item.id === itemId) ?? null;
    }

    public upsert(item: MallItem): void {
        this.data[item.id] = item;
        this.save();
    }

    public remove(itemId: string): void {
        delete this.data[itemId];
        this.save();
    }
}