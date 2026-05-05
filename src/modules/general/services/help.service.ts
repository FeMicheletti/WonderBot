import { ChatInputCommandInteraction, EmbedBuilder, InteractionEditReplyOptions } from "discord.js";
import { LoadedCommand } from "../interfaces/help.interface";

export class HelpService {
	private static readonly HIDDEN_COMMANDS = new Set([ "reload", "botinfo", "health" ]);

	static async execute( interaction: ChatInputCommandInteraction ): Promise<InteractionEditReplyOptions> {
		const client = interaction.client as any;

		if (!client.commands) return { content: "Não consegui carregar a lista de comandos." };

		const commands = Array.from(client.commands.values()) as LoadedCommand[];

		const visibleCommands = commands
			.filter((command) => !this.HIDDEN_COMMANDS.has(command.data.name))
			.sort((a, b) => a.data.name.localeCompare(b.data.name));

		const description = visibleCommands
			.map((command) => this.formatCommand(command))
			.join("\n\n");

		const embed = new EmbedBuilder()
			.setTitle("📖 Lista de comandos")
			.setDescription(description || "Nenhum comando disponível.")
			.setColor(0x5865f2)
			.setFooter({
				text: `Total de comandos: ${visibleCommands.length}`,
			});

		return { embeds: [embed] };
	}

	private static formatCommand(command: LoadedCommand): string {
		const json = command.data.toJSON();

		const options = json.options ?? [];

		const formattedOptions = options.length > 0 ? options.map((option: any) => this.formatOption(option)).join("\n") : "Sem parâmetros.";

		return [
            `**/${json.name}**`,
            `**Descrição:** ${json.description}`,
            `**Parâmetros:**\n${formattedOptions}`,
        ].join("\n");
	}

	private static formatOption(option: any): string {
		const required = option.required ? "obrigatório" : "opcional";
		const type = this.getOptionTypeName(option.type);

		let text = `• \`${option.name}\` — ${option.description} `;
		text += `(${type}, ${required})`;

		const constraints: string[] = [];

		if (option.min_value !== undefined) constraints.push(`mín: ${option.min_value}`);

		if (option.max_value !== undefined) constraints.push(`máx: ${option.max_value}`);

		if (option.choices?.length > 0) {
			const choices = option.choices
				.map((choice: any) => `\`${choice.name}\``)
				.join(", ");

			constraints.push(`opções: ${choices}`);
		}

		if (constraints.length > 0) text += ` — ${constraints.join(", ")}`;

		return text;
	}

	private static getOptionTypeName(type: number): string {
		const types: Record<number, string> = {
			1: "subcomando",
			2: "grupo",
			3: "texto",
			4: "número inteiro",
			5: "booleano",
			6: "usuário",
			7: "canal",
			8: "cargo",
			9: "menção",
			10: "número",
			11: "arquivo",
		};

		return types[type] ?? "desconhecido";
	}
}