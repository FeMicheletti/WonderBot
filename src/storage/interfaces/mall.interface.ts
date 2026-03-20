export interface MallItem {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    info?: {
        attack: string,
        range: string,
        critMargin: string,
        effect: string
    }, 
}

export type MallTableData = Record<string, MallItem>;