import fs from "fs";
import path from "path";

export type ReactionRoleConfig = {
	guildId: string;
	channelId: string;
	messageId: string;
	emoji: string;
	roleId: string;
	createdAt: string;
};

export class ReactionRoleStorageService {
	private static readonly DATA_DIR = path.resolve( process.cwd(), "src", "storage", "data");
	private static readonly FILE_PATH = path.join(this.DATA_DIR,"reaction-roles.data.json");

	private static ensureFile() {
		if (!fs.existsSync(this.DATA_DIR)) fs.mkdirSync(this.DATA_DIR, { recursive: true });
		if (!fs.existsSync(this.FILE_PATH)) fs.writeFileSync(this.FILE_PATH, JSON.stringify([], null, 2));
	}

	static getAll(): ReactionRoleConfig[] {
		this.ensureFile();
		const file = fs.readFileSync(this.FILE_PATH, "utf-8");
		return JSON.parse(file) as ReactionRoleConfig[];
	}

	static saveAll(configs: ReactionRoleConfig[]) {
		this.ensureFile();
		fs.writeFileSync(this.FILE_PATH, JSON.stringify(configs, null, 2));
	}

	static add(config: ReactionRoleConfig) {
		const configs = this.getAll();

		const alreadyExists = configs.some((item) => item.guildId === config.guildId && item.messageId === config.messageId && item.emoji === config.emoji);

		if (alreadyExists) throw new Error("Já existe uma configuração para esse emoji nessa mensagem.");

		configs.push(config);

		this.saveAll(configs);
	}

	static remove(params: { guildId: string; messageId: string; emoji: string; }) {
		const configs = this.getAll();

		const filtered = configs.filter((item) => !(item.guildId === params.guildId && item.messageId === params.messageId && item.emoji === params.emoji));

		const removed = configs.length - filtered.length;
		this.saveAll(filtered);

		return removed;
	}

	static findByReaction(params: { guildId: string; messageId: string; emoji: string; }) {
		const configs = this.getAll();

		return configs.find((item) => item.guildId === params.guildId && item.messageId === params.messageId && item.emoji === params.emoji);
	}
}