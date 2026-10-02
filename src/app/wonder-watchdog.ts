import { Client } from "discord.js";
import logger from "../shared/utils/logger.util";

export class WonderWatchdog {
	private static lastReadyAt = Date.now();
	private static lastDisconnectAt: number | null = null;
	private static interval: NodeJS.Timeout | null = null;

	static start(client: Client) {
		if (this.interval) return;

		client.on("ready", () => {
			this.lastReadyAt = Date.now();
			this.lastDisconnectAt = null;
			logger.info("Watchdog: Wonder está ready.");
		});

		client.on("shardReady", () => {
			this.lastReadyAt = Date.now();
			this.lastDisconnectAt = null;
			logger.info("Watchdog: shard ready.");
		});

		client.on("shardResume", () => {
			this.lastReadyAt = Date.now();
			this.lastDisconnectAt = null;
			logger.info("Watchdog: shard resumido.");
		});

		client.on("shardDisconnect", () => {
			this.lastDisconnectAt = Date.now();
			logger.warn("Watchdog: shard desconectado.");
		});

		client.on("shardReconnecting", () => {
			if (!this.lastDisconnectAt) {
				this.lastDisconnectAt = Date.now();
			}

			logger.warn("Watchdog: tentando reconectar.");
		});

		this.interval = setInterval(() => {
			this.check(client);
		}, 60_000);

		logger.info("Watchdog iniciado.");
	}

	private static check(client: Client) {
		const now = Date.now();
		const disconnectedForMs = this.lastDisconnectAt ? now - this.lastDisconnectAt : 0;
		const isReady = client.isReady();

		logger.info(`Watchdog check: ready=${isReady} ping=${client.ws.ping} disconnectedForMs=${disconnectedForMs}`);

		if (!isReady && disconnectedForMs > 5 * 60 * 1000) {
			logger.error("Wonder ficou offline por mais de 5 minutos. Reiniciando processo.");
			process.exit(1);
		}

		if (this.lastDisconnectAt && disconnectedForMs > 10 * 60 * 1000) {
			logger.error("Wonder ficou desconectada por mais de 10 minutos. Reiniciando processo.");
			process.exit(1);
		}
	}
}