import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { AdminAuthService } from "../services/admin-auth.service";
import { BotInfoService } from "../services/botinfo.service";

export default {
	data: new SlashCommandBuilder()
		.setName("botinfo")
		.setDescription("Mostra informações internas do bot"),

	async execute(interaction: ChatInputCommandInteraction) {
		if (!AdminAuthService.isOwner(interaction)) return interaction.reply(AdminAuthService.denyMessage());

		const result = await BotInfoService.execute(interaction);

		await interaction.reply(result);
	},
};