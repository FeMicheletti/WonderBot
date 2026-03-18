import { RollDiceValidationError } from "../dto/roll.dto";
import { RollDiceInput, RollDiceOutput } from "../interfaces/roll.interface";

export class RollService {
    static execute(input: RollDiceInput): RollDiceOutput {
        const expression = input.expression.trim().toLowerCase();
        const match = expression.match(/^(\d*)d(\d+)$/);

        if (!match) throw new RollDiceValidationError("Formato inválido. Use algo como `1d20`, `2d6`, `4d10`.");

        const quantity = parseInt(match[1] || "1", 10);
        const faces = parseInt(match[2], 10);

        if (quantity > 100) throw new RollDiceValidationError("Você não pode rolar mais de 100 dados.");

        if (quantity < 1) throw new RollDiceValidationError("Você precisa rolar pelo menos 1 dado.");

        if (faces < 2) throw new RollDiceValidationError("O dado precisa ter pelo menos 2 faces.");

        const results: number[] = [];
        let total = 0;

        for (let index = 0; index < quantity; index++) {
            const roll = Math.floor(Math.random() * faces) + 1;
            results.push(roll);
            total += roll;
        }

        return {
            quantity,
            faces,
            results,
            total,
            message: `🎲 **${input.username} rolou ${quantity}d${faces}**\nResultados: [${results.join(", ")}]\nTotal: **${total}**`,
        };
    }
}