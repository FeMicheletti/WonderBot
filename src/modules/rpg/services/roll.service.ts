import { Interaction } from "discord.js";
import { RollDiceValidationError } from "../dto/roll.dto";
import { RollDiceInput, RollDiceOutput, DiceMode, ParsedTerm, DiceRollResult } from "../interfaces/roll.interface";

export class RollService {
	static execute(input: RollDiceInput): RollDiceOutput {
		const expression = RollService.normalizeExpression(input.expression);
		const terms = RollService.parseExpression(expression);

		const details: string[] = [];
		let total = 0;

		for (const term of terms) {
			if (term.type === "modifier") {
				const value = term.sign * term.value;
				total += value;

				details.push(`${value >= 0 ? "+" : "-"}${Math.abs(value)}`);
				continue;
			}

			const rollResult = RollService.rollDiceTerm(term);

			total += rollResult.total;
			details.push(RollService.formatDiceResult(rollResult));
		}

		return {
			expression,
			total,
			details,
			message:
				`🎲 **${input.username} rolou:** \`${expression}\`\n` +
				`${details.join("\n")}\n` +
				`Total: **${total}**`,
		};
	}

	private static normalizeExpression(expression: string): string {
		const normalized = expression.trim().toLowerCase().replace(/\s+/g, "");

		if (!normalized) {
			throw new RollDiceValidationError("Informe uma rolagem. Ex: `1d20`, `1d20+10`, `3d6kh2`.");
		}

		if (normalized.length > 100) {
			throw new RollDiceValidationError("A expressão é muito grande.");
		}

		if (!/^[0-9d+\-khla-z]+$/i.test(normalized)) {
			throw new RollDiceValidationError("A expressão contém caracteres inválidos.");
		}

		return normalized;
	}

	private static parseExpression(expression: string): ParsedTerm[] {
		const normalized = expression.startsWith("+") || expression.startsWith("-") ? expression : `+${expression}`;

		const tokenRegex = /([+-])([^+-]+)/g;
		const terms: ParsedTerm[] = [];

		let consumed = "";
		let match: RegExpExecArray | null;

		while ((match = tokenRegex.exec(normalized)) !== null) {
			const sign = match[1] === "-" ? -1 : 1;
			const rawTerm = match[2];

			consumed += match[0];

			if (!rawTerm) {
				throw new RollDiceValidationError("Formato inválido.");
			}

			terms.push(RollService.parseTerm(rawTerm, sign));
		}

		if (consumed !== normalized) {
			throw new RollDiceValidationError(
				"Formato inválido. Use exemplos como `1d20+10`, `3d6kh2`, `4d6dl1`."
			);
		}

		if (terms.length === 0) {
			throw new RollDiceValidationError("Nenhuma rolagem válida encontrada.");
		}

		return terms;
	}

	private static parseTerm(rawTerm: string, sign: 1 | -1): ParsedTerm {
		if (/^\d+$/.test(rawTerm)) {
			const value = parseInt(rawTerm, 10);

			if (value > 100000) {
				throw new RollDiceValidationError("O modificador é grande demais.");
			}

			return {
				type: "modifier",
				sign,
				value,
			};
		}

		const diceMatch = rawTerm.match(/^(\d*)d(\d+)(?:(kh|kl|dh|dl)(\d+))?$/);

		if (!diceMatch) {
			throw new RollDiceValidationError(
				"Formato inválido. Exemplos válidos: `1d20`, `1d20+10`, `3d6kh2`, `4d6dl1`."
			);
		}

		const quantity = parseInt(diceMatch[1] || "1", 10);
		const faces = parseInt(diceMatch[2], 10);
		const mode = diceMatch[3] as DiceMode | undefined;
		const modeValue = diceMatch[4] ? parseInt(diceMatch[4], 10) : undefined;

		if (quantity < 1) {
			throw new RollDiceValidationError("Você precisa rolar pelo menos 1 dado.");
		}

		if (quantity > 100) {
			throw new RollDiceValidationError("Você não pode rolar mais de 100 dados.");
		}

		if (faces < 2) {
			throw new RollDiceValidationError("O dado precisa ter pelo menos 2 faces.");
		}

		if (faces > 100000) {
			throw new RollDiceValidationError("O dado tem faces demais.");
		}

		if (mode) {
			if (!modeValue || modeValue < 1) {
				throw new RollDiceValidationError("O valor de `kh`, `kl`, `dh` ou `dl` precisa ser maior que zero.");
			}

			if ((mode === "kh" || mode === "kl") && modeValue > quantity) {
				throw new RollDiceValidationError("Você não pode manter mais dados do que rolou.");
			}

			if ((mode === "dh" || mode === "dl") && modeValue >= quantity) {
				throw new RollDiceValidationError("Você não pode descartar todos os dados.");
			}
		}

		return {
			type: "dice",
			sign,
			quantity,
			faces,
			mode,
			modeValue,
		};
	}

	private static rollDiceTerm(term: Extract<ParsedTerm, { type: "dice" }>): DiceRollResult {
		const results: number[] = [];

		for (let index = 0; index < term.quantity; index++) {
			results.push(Math.floor(Math.random() * term.faces) + 1);
		}

		const { usedResults, ignoredResults } = RollService.applyDiceMode(
			results,
			term.mode,
			term.modeValue
		);

		const rawTotal = usedResults.reduce((sum, value) => sum + value, 0);
		const total = term.sign * rawTotal;

		const modeText = term.mode && term.modeValue ? `${term.mode}${term.modeValue}` : "";
		const signText = term.sign === -1 ? "-" : "";

		return {
			termText: `${signText}${term.quantity}d${term.faces}${modeText}`,
			results,
			usedResults,
			ignoredResults,
			total,
		};
	}

	private static applyDiceMode( results: number[], mode?: DiceMode, modeValue?: number): { usedResults: number[]; ignoredResults: number[] } {
		if (!mode || !modeValue) {
			return {
				usedResults: [...results],
				ignoredResults: [],
			};
		}

		const indexedResults = results.map((value, index) => ({ value, index }));

		const sortedAscending = [...indexedResults].sort((a, b) => {
			if (a.value === b.value) return a.index - b.index;
			return a.value - b.value;
		});

		let selectedIndexes: Set<number>;

		if (mode === "kh") {
			selectedIndexes = new Set(
				sortedAscending
					.slice(-modeValue)
					.map((item) => item.index)
			);
		} else if (mode === "kl") {
			selectedIndexes = new Set(
				sortedAscending
					.slice(0, modeValue)
					.map((item) => item.index)
			);
		} else if (mode === "dh") {
			const droppedIndexes = new Set(
				sortedAscending
					.slice(-modeValue)
					.map((item) => item.index)
			);

			selectedIndexes = new Set(
				indexedResults
					.filter((item) => !droppedIndexes.has(item.index))
					.map((item) => item.index)
			);
		} else {
			const droppedIndexes = new Set(
				sortedAscending
					.slice(0, modeValue)
					.map((item) => item.index)
			);

			selectedIndexes = new Set(
				indexedResults
					.filter((item) => !droppedIndexes.has(item.index))
					.map((item) => item.index)
			);
		}

		const usedResults: number[] = [];
		const ignoredResults: number[] = [];

		for (const item of indexedResults) {
			if (selectedIndexes.has(item.index)) {
				usedResults.push(item.value);
			} else {
				ignoredResults.push(item.value);
			}
		}

		return {
			usedResults,
			ignoredResults,
		};
	}

	private static formatDiceResult(result: DiceRollResult): string {
		const totalText = result.total >= 0
			? `+${result.total}`
			: `${result.total}`;

		if (result.ignoredResults.length === 0) {
			return `\`${result.termText}\` → [${result.results.join(", ")}] = **${totalText}**`;
		}

		return (
			`\`${result.termText}\` → ` +
			`rolados [${result.results.join(", ")}], ` +
			`usados [${result.usedResults.join(", ")}], ` +
			`ignorados [${result.ignoredResults.join(", ")}] ` +
			`= **${totalText}**`
		);
	}

	static async sendRollToGM(interaction: Interaction, resultado: RollDiceOutput) {
		const guild = interaction.guild;
		if (!guild) return;

		const gmChannel = guild.channels.cache.find(
			(channel) => channel.name === "roll-secreto" && channel.isTextBased()
		);

		if (!gmChannel || !gmChannel.isTextBased()) return;

		await gmChannel.send({
			content:
				`🎲 **Rolagem secreta**\n` +
				`Jogador: ${interaction.user.tag}\n` +
				`Rolagem: **${resultado.expression}**\n` +
				`${resultado.details.join("\n")}\n` +
				`Total: **${resultado.total}**`,
		});
	}
}