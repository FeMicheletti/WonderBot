import { DataDragonChampion, DataDragonItem } from "../interfaces/data-dragon.interface";

export class DataDragonService {
	private static readonly BASE_URL = "https://ddragon.leagueoflegends.com";
	private static cachedVersion: string | null = null;
	private static cachedChampions: DataDragonChampion[] | null = null;
	private static cachedItems: DataDragonItem[] | null = null;

	static async getLatestVersion(): Promise<string> {
		if (this.cachedVersion) return this.cachedVersion;

		const response = await fetch(`${this.BASE_URL}/api/versions.json`);

		if (!response.ok) {
			throw new Error("Não foi possível buscar a versão mais recente do Data Dragon.");
		}

		const versions = await response.json() as string[];

		this.cachedVersion = versions[0];

		return this.cachedVersion;
	}

	static async getChampions(): Promise<DataDragonChampion[]> {
		if (this.cachedChampions) return this.cachedChampions;

		const version = await this.getLatestVersion();

		const response = await fetch(
			`${this.BASE_URL}/cdn/${version}/data/pt_BR/champion.json`
		);

		if (!response.ok) {
			throw new Error("Não foi possível buscar os campeões do Data Dragon.");
		}

		const body = await response.json() as {
			data: Record<string, DataDragonChampion>;
		};

		this.cachedChampions = Object.values(body.data);

		return this.cachedChampions;
	}

	static async getItems(): Promise<DataDragonItem[]> {
		if (this.cachedItems) return this.cachedItems;

		const version = await this.getLatestVersion();

		const response = await fetch(
			`${this.BASE_URL}/cdn/${version}/data/pt_BR/item.json`
		);

		if (!response.ok) {
			throw new Error("Não foi possível buscar os itens do Data Dragon.");
		}

		const body = await response.json() as {
			data: Record<string, DataDragonItem>;
		};

		this.cachedItems = Object.values(body.data)
            .filter((item) => item.gold?.purchasable)
            .filter((item) => item.maps?.["11"])
            .filter((item) => !item.tags?.includes("Consumable"))
            .filter((item) => !item.tags?.includes("Trinket"));

		return this.cachedItems;
	}

	static getChampionImageUrl(version: string, imageFull: string): string {
		return `${this.BASE_URL}/cdn/${version}/img/champion/${imageFull}`;
	}

	static getItemImageUrl(version: string, imageFull: string): string {
		return `${this.BASE_URL}/cdn/${version}/img/item/${imageFull}`;
	}
}