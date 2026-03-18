export interface PingInput {
    interactionCreatedTimestamp: number;
    replyCreatedTimestamp: number;
    wsPing: number;
}

export interface PingOutput {
    latency: number;
    apiPing: number;
    message: string;
}