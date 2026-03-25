import chalk from "chalk";

const logger = {
    timeStamp() {
        const date = new Date();
        const pad = (num: number) => num.toString().padStart(2, '0');

        const hours = pad(date.getUTCHours() - 3); // Ajuste para UTC-3
        const minutes = pad(date.getUTCMinutes());
        const seconds = pad(date.getUTCSeconds());

        const timeOnly = `${hours}:${minutes}:${seconds}`;

        return timeOnly;
    },

    info(message: string, ...args: unknown[]) {
        console.log(chalk.blue(`[INFO] ${this.timeStamp()} ${message}`, ...args));
    },

    warn(message: string, ...args: unknown[]) {
        console.warn(chalk.yellow(`[WARN] ${this.timeStamp()} ${message}`, ...args));
    },

    error(message: string, ...args: unknown[]) {
        console.error(chalk.red.bold(`[ERROR] ${message}`, ...args));
    },
};

export default logger;