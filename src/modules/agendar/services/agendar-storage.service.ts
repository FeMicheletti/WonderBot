import fs from "fs";
import path from "path";
import { AgendamentoConfig, AgendamentoSnooze } from "../interfaces/agendar.interface";

export class AgendarStorageService {
	private static readonly DATA_DIR = path.resolve( process.cwd(), "src", "storage", "data" );
	private static readonly SCHEDULES_PATH = path.join( this.DATA_DIR, "agendamentos.data.json" );
	private static readonly SNOOZES_PATH = path.join( this.DATA_DIR, "agendamentos-snoozes.data.json");

	private static ensureFile(filePath: string) {
		if (!fs.existsSync(this.DATA_DIR)) fs.mkdirSync(this.DATA_DIR, { recursive: true });
		if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([], null, 2));
	}

	private static readJson<T>(filePath: string): T[] {
		this.ensureFile(filePath);

		const file = fs.readFileSync(filePath, "utf-8");
		if (!file.trim()) return [];

		try {
			return JSON.parse(file) as T[];
		} catch {
			fs.writeFileSync(filePath, JSON.stringify([], null, 2));
			return [];
		}
	}

	private static writeJson<T>(filePath: string, data: T[]) {
		this.ensureFile(filePath);
		fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
	}

	static getSchedules(): AgendamentoConfig[] {
		return this.readJson<AgendamentoConfig>(this.SCHEDULES_PATH);
	}

	static saveSchedules(schedules: AgendamentoConfig[]) {
		this.writeJson(this.SCHEDULES_PATH, schedules);
	}

	static addSchedule(schedule: AgendamentoConfig) {
		const schedules = this.getSchedules();
		schedules.push(schedule);
		this.saveSchedules(schedules);
	}

	static findScheduleById(id: string) {
		return this.getSchedules().find((schedule) => schedule.id === id);
	}

	static removeSchedule(id: string) {
		const schedules = this.getSchedules();
		const filtered = schedules.filter((schedule) => schedule.id !== id);

		this.saveSchedules(filtered);

		return schedules.length - filtered.length;
	}

	static updateSchedule(schedule: AgendamentoConfig) {
		const schedules = this.getSchedules();

		const updated = schedules.map((item) => item.id === schedule.id ? schedule : item);

		this.saveSchedules(updated);
	}

	static getSnoozes(): AgendamentoSnooze[] {
		return this.readJson<AgendamentoSnooze>(this.SNOOZES_PATH);
	}

	static saveSnoozes(snoozes: AgendamentoSnooze[]) {
		this.writeJson(this.SNOOZES_PATH, snoozes);
	}

	static addSnooze(snooze: AgendamentoSnooze) {
		const snoozes = this.getSnoozes();
		snoozes.push(snooze);
		this.saveSnoozes(snoozes);
	}

	static markSnoozeDone(id: string) {
		const snoozes = this.getSnoozes();
		const updated = snoozes.map((snooze) => snooze.id === id ? { ...snooze, done: true } : snooze);
		this.saveSnoozes(updated);
	}
}