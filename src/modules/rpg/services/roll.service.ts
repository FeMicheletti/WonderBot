import { Interaction } from 'discord.js';
import { RollDiceValidationError } from "../dto/roll.dto";
import { RollDiceInput, RollDiceOutput } from "../interfaces/roll.interface";

export class RollService {
    static execute(input: RollDiceInput): RollDiceOutput {
        const { quantity, faces } = RollService.parseExpression(input.expression);
        const results = RollService.rollDice(quantity, faces);
        const total = results.reduce((sum, value) => sum + value, 0);

        return {
            quantity,
            faces,
            results,
            total,
            message: `🎲 **${input.username} rolou ${quantity}d${faces}**\nResultados: [${results.join(", ")}]\nTotal: **${total}**`,
        };
    }

    private static parseExpression(expression: string) {
        const normalizedExpression = expression.trim().toLowerCase();
        const match = normalizedExpression.match(/^(\d*)d(\d+)$/);

        if (!match) throw new RollDiceValidationError( "Formato inválido. Use algo como `1d20`, `2d6`, `4d10`." );

        const quantity = parseInt(match[1] || "1", 10);
        const faces = parseInt(match[2], 10);

        if (quantity < 1) throw new RollDiceValidationError( "Você precisa rolar pelo menos 1 dado." );

        if (quantity > 100) throw new RollDiceValidationError( "Você não pode rolar mais de 100 dados." );

        if (faces < 2) throw new RollDiceValidationError( "O dado precisa ter pelo menos 2 faces." );

        return { quantity, faces };
    }

    private static rollDice(quantity: number, faces: number): number[] {
        const results: number[] = [];

        for (let index = 0; index < quantity; index++) {
            const result = Math.floor(Math.random() * faces) + 1;
            results.push(result);
        }

        return results;
    }

    static async sendRollToGM(interaction: Interaction, resultado: RollDiceOutput) {
        const guild = interaction.guild;
        if (!guild) return;

        const gmChannel = guild.channels.cache.find( channel => channel.name === "roll-secreto" && channel.isTextBased() );

        if (!gmChannel || !gmChannel.isTextBased()) return;

        await gmChannel.send({
            content:
                `🎲 **Rolagem secreta**\n` +
                `Jogador: ${interaction.user.tag}\n` +
                `Rolagem: **${resultado.quantity}d${resultado.faces}**\n`+
                `Resultados: [${resultado.results.join(", ")}]\nTotal: **${resultado.total}**`,
        })
    }
}