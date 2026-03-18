export interface MallItem {
    id: string;
    name: string;
    price: number;
    stock: number;
}

export type MallTableData = Record<string, MallItem>;