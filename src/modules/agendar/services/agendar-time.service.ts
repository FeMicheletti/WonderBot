export class AgendarTimeService {
	static readonly DEFAULT_TIMEZONE = "America/Sao_Paulo";

	static isValidHour(hour: string) {
		return /^([01]\d|2[0-3]):[0-5]\d$/.test(hour);
	}

	static getRunKey(date = new Date(), timeZone = this.DEFAULT_TIMEZONE) {
		return new Intl.DateTimeFormat("sv-SE", {
			timeZone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		}).format(date);
	}

	static getHourMinute(date = new Date(), timeZone = this.DEFAULT_TIMEZONE) {
		const runKey = this.getRunKey(date, timeZone);
		return runKey.slice(11, 16);
	}

	static parseDelayToMs(input: string) {
		const normalized = input.trim().toLowerCase();

		const match = normalized.match(/^(\d+)\s*(m|min|h|d)$/);

		if (!match) throw new Error("Tempo inválido. Use exemplos como 10m, 1h ou 1d.");

		const amount = Number(match[1]);
		const unit = match[2];

		if (!Number.isFinite(amount) || amount <= 0) throw new Error("Tempo inválido.");

		if (amount > 30 && unit === "d") throw new Error("O máximo permitido é 30d.");

		if (unit === "m" || unit === "min") return amount * 60 * 1000;
		if (unit === "h") return amount * 60 * 60 * 1000;
		if (unit === "d") return amount * 24 * 60 * 60 * 1000;

		throw new Error("Tempo inválido.");
	}
}