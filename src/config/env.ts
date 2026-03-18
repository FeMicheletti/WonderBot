import dotenv from "dotenv";

function required(name:string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
    return value;
}

dotenv.config();

const env = {
    discordToken: required('DISCORD_TOKEN'),
    clientId: required('CLIENT_ID'),
    guildId: required('GUILD_ID')
};

export default env;