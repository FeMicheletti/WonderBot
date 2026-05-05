import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import logger from "../../../shared/utils/logger.util";

export class CookieService {
	private static isRefreshing = false;
	private static lastRefresh = 0;

	private static readonly COOKIE_PATH = path.resolve(process.cwd(), "cookies.txt");
	private static readonly PROFILE_PATH = path.resolve(process.cwd(), "youtube-profile/.config/chromium");

	static async refreshYoutubeCookiesIfNeeded(force = false): Promise<void> {
		const now = Date.now();
		const tenMinutes = 10 * 60 * 1000;

		if (!force && fs.existsSync(this.COOKIE_PATH) && now - this.lastRefresh < tenMinutes) {
			return;
		}

		if (this.isRefreshing) {
			logger.info("[CookieService] Refresh já está em andamento.");
			return;
		}

		this.isRefreshing = true;

		try {
			logger.info("[CookieService] Atualizando cookies do YouTube...");

			const context = await chromium.launchPersistentContext(this.PROFILE_PATH, {
				headless: true,
				args: [
					"--no-sandbox",
					"--disable-dev-shm-usage",
				],
			});

			const page = await context.newPage();

			await page.goto("https://www.youtube.com/", {
				waitUntil: "networkidle",
				timeout: 60_000,
			});

			const cookies = await context.cookies();

			if (!cookies.length) {
				throw new Error("Nenhum cookie foi encontrado no perfil do Chromium.");
			}

			this.writeNetscapeCookies(cookies);

			await context.close();

			this.lastRefresh = Date.now();

			logger.info(`[CookieService] cookies.txt atualizado em ${this.COOKIE_PATH}`);
		 } catch (error) {
			logger.error("[CookieService] Erro ao atualizar cookies:", error);
			throw error;
		} finally {
			this.isRefreshing = false;
		}
	}

	private static writeNetscapeCookies(cookies: any[]): void {
		const lines = [
			"# Netscape HTTP Cookie File",
			"# Generated automatically for yt-dlp",
			"",
		];

		for (const cookie of cookies) {
			let domain = cookie.domain || "";

			const includeSubdomains = domain.startsWith(".") ? "TRUE" : "FALSE";
			const pathValue = cookie.path || "/";
			const secure = cookie.secure ? "TRUE" : "FALSE";
			const expires = cookie.expires && cookie.expires > 0 ? Math.floor(cookie.expires) : 0;
			const name = cookie.name || "";
			const value = cookie.value || "";

			if (cookie.httpOnly && !domain.startsWith("#HttpOnly_")) {
				domain = `#HttpOnly_${domain}`;
			}

			lines.push([
				domain,
				includeSubdomains,
				pathValue,
				secure,
				expires,
				name,
				value,
			].join("\t"));
		}

		fs.writeFileSync(this.COOKIE_PATH, lines.join("\n"), "utf8");
	}
}