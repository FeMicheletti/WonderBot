export interface DataDragonChampion {
	id: string;
	key: string;
	name: string;
	title: string;
	image: {
		full: string;
	};
};

export interface DataDragonItem {
	id: string;
	name: string;
	description: string;
	plaintext?: string;
	gold: {
		total: number;
		purchasable: boolean;
	};
	maps: Record<string, boolean>;
	tags: string[];
	image: {
		full: string;
	};
	from?: string[];
	into?: string[];
};