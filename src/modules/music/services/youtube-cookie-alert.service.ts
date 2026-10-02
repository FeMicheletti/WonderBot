import { Client, TextChannel } from "discord.js";
import env from "../../../config/env";
import logger from "../../../shared/utils/logger.util";

export class YoutubeCookieAlertService {
	private static lastAlertAt = 0;
	private static readonly COOLDOWN_MS = 30 * 60 * 1000;

	static isCookieError(error: unknown) {
		const message = String(error instanceof Error ? error.message : error).toLowerCase();

		return (
			message.includes("sign in to confirm") ||
			message.includes("not a bot") ||
			message.includes("cookies") ||
			message.includes("use --cookies")
		);
	}

	static async notify(client: Client, error: unknown) {
		if (!this.isCookieError(error)) return;

		const now = Date.now();

		if (now - this.lastAlertAt < this.COOLDOWN_MS) return;

		this.lastAlertAt = now;

		const content = [
			"🚨 **Wonder detectou problema nos cookies do YouTube**",
			"",
			"O `/play` falhou porque o YouTube pediu login novamente.",
			"",
			"**Como resolver na VPS:**",
			"```bash",
			"docker rm -f youtube-login",
			"docker run -d --name youtube-login -p 3001:3001 -v /data/youtube-profile:/config lscr.io/linuxserver/chromium:latest",
			"```",
			"",
			"Depois abra:",
			"```txt",
			"https://177.7.48.66:3001",
			"```",
			"",
			"Faça login no YouTube, abra qualquer vídeo e depois rode:",
			"```bash",
			"docker stop youtube-login",
			"docker rm youtube-login",
			"docker restart <CONTAINER_DA_WONDER>",
			"```",
			"",
			"Também lembra de abrir temporariamente a porta `3001 TCP` no firewall da Hostinger e fechar depois.",
		].join("\n");

		await this.sendAlert(client, content);
	}

	private static async sendAlert(client: Client, content: string) {
		try {
			if (env.alertChannelId) {
				const channel = await client.channels
					.fetch(env.alertChannelId)
					.catch(() => null);

				if (channel instanceof TextChannel) {
					await channel.send({ content });
					return;
				}
			}

			if (env.ownerId) {
				const owner = await client.users.fetch(env.ownerId).catch(() => null);

				if (owner) {
					await owner.send({ content });
					return;
				}
			}

			logger.warn("Cookie alert não enviado: sem ALERT_CHANNEL_ID ou OWNER_ID válido.");
		} catch (alertError) {
			logger.error("Erro ao enviar alerta de cookie do YouTube.", alertError);
		}
	}
}