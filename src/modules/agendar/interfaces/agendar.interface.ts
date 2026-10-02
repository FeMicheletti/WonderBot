export type AgendamentoType = "server" | "personal";

export type AgendamentoConfig = {
    id: string;
    type: AgendamentoType;
    guildId?: string;
    channelId?: string;
    roleId?: string;
    userId?: string;
    message: string;
    hour: string;
    enabled: boolean;
    lastRunKey?: string;
    createdBy: string;
    createdAt: string;
};

export type AgendamentoSnooze = {
    id: string;
    userId: string;
    message: string;
    remindAt: string;
    sourceScheduleId?: string;
    done: boolean;
    createdAt: string;
};