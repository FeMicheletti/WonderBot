import { ChatInputCommandInteraction } from "discord.js";
import env from "../../../config/env";

export class AdminAuthService {
	static isOwner(interaction: ChatInputCommandInteraction): boolean {
		return interaction.user.id === env.ownerId;
	}

	static denyMessage() {
		return { content: "⛔ Você não tem permissão para usar esse comando." };
	}
}