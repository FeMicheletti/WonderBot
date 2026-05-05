import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { AdminAuthService } from "../services/admin-auth.service";
import { CommandLoader } from "../../../app/commandLoader";

export default {
	data: new SlashCommandBuilder()
		.setName("reload")
		.setDescription("Recarrega os comandos do bot sem reiniciar"),

	async execute(interaction: ChatInputCommandInteraction) {
		if (!AdminAuthService.isOwner(interaction)) return interaction.reply(AdminAuthService.denyMessage());

		const client = interaction.client as any;

		if (!client.commands) {
			return interaction.reply({
				content: "❌ O client não possui uma coleção de comandos carregada.",
			});
		}

		client.commands.clear();

		const loader = new CommandLoader();
		await loader.loadCommands(client);

		await interaction.reply({
			content: `🔄 Comandos recarregados com sucesso. Total: **${client.commands.size}**`,
		});
	},
};