export interface LoadedCommand {
	data: {
		name: string;
		description: string;
		toJSON: () => any;
	};
	execute: Function;
};