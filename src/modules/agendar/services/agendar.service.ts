import { ChatInputCommandInteraction, InteractionEditReplyOptions, PermissionFlagsBits, Role, TextChannel } from "discord.js";
import { randomUUID } from "crypto";
import { AgendarStorageService } from "./agendar-storage.service";
import { AgendarTimeService } from "./agendar-time.service";

export class AgendarService {
	static async createPersonal(interaction: ChatInputCommandInteraction): Promise<InteractionEditReplyOptions> {
		const hour = interaction.options.getString("horario", true);
		const message = interaction.options.getString("mensagem", true);

		if (!AgendarTimeService.isValidHour(hour)) return { content: "Horário inválido. Use o formato `HH:mm`. Exemplo: `10:00`." };

		const id = randomUUID();

		AgendarStorageService.addSchedule({
			id,
			type: "personal",
			userId: interaction.user.id,
			message,
			hour,
			enabled: true,
			createdBy: interaction.user.id,
			createdAt: new Date().toISOString(),
		});

		return {
			content: [
				"✅ Agendamento pessoal criado.",
				`ID: \`${id}\``,
				`Horário: \`${hour}\``,
				`Mensagem: ${message}`,
			].join("\n"),
		};
	}

	static async createServer(interaction: ChatInputCommandInteraction): Promise<InteractionEditReplyOptions> {
		if (!interaction.guild) return { content: "Esse comando só pode ser usado dentro de um servidor." };
		if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) return { content: "Você precisa da permissão `Gerenciar Servidor` para criar agendamentos do servidor." };

		const channel = interaction.options.getChannel("canal", true);
		const role = interaction.options.getRole("cargo");
		const hour = interaction.options.getString("horario", true);
		const message = interaction.options.getString("mensagem", true);

		if (!(channel instanceof TextChannel)) return { content: "O canal precisa ser um canal de texto." };
		if (role && !(role instanceof Role)) return { content: "O cargo informado é inválido." };
		if (!AgendarTimeService.isValidHour(hour)) return { content: "Horário inválido. Use o formato `HH:mm`. Exemplo: `10:00`." };

		const id = randomUUID();

		AgendarStorageService.addSchedule({
			id,
			type: "server",
			guildId: interaction.guild.id,
			channelId: channel.id,
			roleId: role?.id,
			message,
			hour,
			enabled: true,
			createdBy: interaction.user.id,
			createdAt: new Date().toISOString(),
		});

		return {
			content: [
				"✅ Agendamento do servidor criado.",
				`ID: \`${id}\``,
				`Canal: ${channel}`,
				role ? `Cargo: ${role}` : "Cargo: nenhum",
				`Horário: \`${hour}\``,
				`Mensagem: ${message}`,
				"",
				"Obs: para o cargo ser notificado, ele precisa ser mencionável ou a Wonder precisa ter permissão para mencionar cargos.",
			].join("\n"),
		};
	}

	static async list(interaction: ChatInputCommandInteraction): Promise<InteractionEditReplyOptions> {
		const canSeeServerSchedules = interaction.guild && interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild);

		const schedules = AgendarStorageService.getSchedules().filter((schedule) => {
			if (schedule.type === "personal") return schedule.userId === interaction.user.id;
			if (schedule.type === "server") return canSeeServerSchedules && schedule.guildId === interaction.guild?.id;
			return false;
		});

		if (schedules.length === 0) return { content: "Nenhum agendamento encontrado." };

		const lines = schedules.map((schedule) => {
			const type = schedule.type === "server" ? "Servidor" : "Pessoal";

			return [
				`**${type}**`,
				`ID: \`${schedule.id}\``,
				`Horário: \`${schedule.hour}\``,
				`Mensagem: ${schedule.message}`,
				schedule.roleId ? `Cargo: <@&${schedule.roleId}>` : null,
				schedule.channelId ? `Canal: <#${schedule.channelId}>` : null,
			].filter(Boolean).join("\n");
		});

		return { content: lines.join("\n\n") };
	}

	static async remove(interaction: ChatInputCommandInteraction): Promise<InteractionEditReplyOptions> {
		const id = interaction.options.getString("id", true);
		const schedule = AgendarStorageService.findScheduleById(id);

		if (!schedule) return { content: "Não encontrei nenhum agendamento com esse ID." };
		if (schedule.type === "personal" && schedule.userId !== interaction.user.id) return { content: "Você só pode remover seus próprios agendamentos pessoais." };

		if (schedule.type === "server") {
			const canRemove = interaction.guild && schedule.guildId === interaction.guild.id && interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild);
			if (!canRemove) return { content: "Você precisa da permissão `Gerenciar Servidor` para remover agendamentos do servidor." };
		}

		AgendarStorageService.removeSchedule(id);

		return { content: `✅ Agendamento removido: \`${id}\`` };
	}
}