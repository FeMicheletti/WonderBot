export class RollDiceValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "RollDiceValidationError";
    }
}