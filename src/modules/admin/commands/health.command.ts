import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { AdminAuthService } from "../services/admin-auth.service";
import { HealthService } from "../services/health.service";

export default {
	data: new SlashCommandBuilder()
		.setName("health")
		.setDescription("Checa o status interno do bot"),

	async execute(interaction: ChatInputCommandInteraction) {
		if (!AdminAuthService.isOwner(interaction)) return interaction.reply(AdminAuthService.denyMessage());

		const result = await HealthService.execute(interaction);

		await interaction.reply(result);
	},
};