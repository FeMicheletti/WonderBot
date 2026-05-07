import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { TrollService } from "../services/troll.service";

export default {
	data: new SlashCommandBuilder()
		.setName("troll")
		.setDescription("Gera um campeão, lane e build troll de LoL"),

	async execute(interaction: ChatInputCommandInteraction) {
		const result = await TrollService.execute(interaction);

		await interaction.editReply(result);
	},
};