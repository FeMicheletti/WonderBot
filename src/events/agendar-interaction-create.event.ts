import { ActionRowBuilder, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { randomUUID } from "crypto";
import { AgendarStorageService } from "../modules/agendar/services/agendar-storage.service";
import { AgendarTimeService } from "../modules/agendar/services/agendar-time.service";

export default {
	name: "interactionCreate",

	async execute(interaction: Interaction) {
		if (interaction.isButton()) {
			if (!interaction.customId.startsWith("agendar:snooze:")) return;

			const scheduleId = interaction.customId.replace("agendar:snooze:", "");

			const modal = new ModalBuilder().setCustomId(`agendar:snooze-modal:${scheduleId}`).setTitle("Adiar lembrete");

			const tempoInput = new TextInputBuilder()
				.setCustomId("tempo")
				.setLabel("Quando lembrar? Ex: 10m, 1h ou 1d")
				.setPlaceholder("10m")
				.setRequired(true)
				.setStyle(TextInputStyle.Short);

			modal.addComponents( new ActionRowBuilder<TextInputBuilder>().addComponents(tempoInput) );

			await interaction.showModal(modal);
			return;
		}

		if (interaction.isModalSubmit()) {
			if (!interaction.customId.startsWith("agendar:snooze-modal:")) return;

			const scheduleId = interaction.customId.replace("agendar:snooze-modal:", "");
			const schedule = AgendarStorageService.findScheduleById(scheduleId);

			if (!schedule) {
				await interaction.reply({ content: "Esse agendamento não existe mais.", ephemeral: true });
				return;
			}

			const tempo = interaction.fields.getTextInputValue("tempo");

			try {
				const delayMs = AgendarTimeService.parseDelayToMs(tempo);

				AgendarStorageService.addSnooze({
					id: randomUUID(),
					userId: interaction.user.id,
					message: schedule.message,
					sourceScheduleId: schedule.id,
					remindAt: new Date(Date.now() + delayMs).toISOString(),
					done: false,
					createdAt: new Date().toISOString(),
				});

				await interaction.reply({ content: `✅ Beleza, vou te lembrar em \`${tempo}\`.`, ephemeral: true });
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Tempo inválido. Use exemplos como 10m, 1h ou 1d.";

				await interaction.reply({ content: message, ephemeral: true });
			}
		}
	},
};