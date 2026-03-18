export interface RollDiceInput {
    expression: string;
    username: string;
}

export interface RollDiceOutput {
    quantity: number;
    faces: number;
    results: number[];
    total: number;
    message: string;
}