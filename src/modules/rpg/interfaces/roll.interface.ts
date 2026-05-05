export interface RollDiceInput {
	expression: string;
	username: string;
}

export interface RollDiceOutput {
	expression: string;
	total: number;
	message: string;
	details: string[];
}

export type DiceMode = "kh" | "kl" | "dh" | "dl";

export type ParsedTerm = 
    | {
        type: "dice";
        sign: 1 | -1;
        quantity: number;
        faces: number;
        mode?: DiceMode;
        modeValue?: number;
	}
	| {
        type: "modifier";
        sign: 1 | -1;
        value: number;
    };

export type DiceRollResult = {
	termText: string;
	results: number[];
	usedResults: number[];
	ignoredResults: number[];
	total: number;
};