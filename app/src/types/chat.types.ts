

export enum Interlocutor {
    USER = "USER",
    GPT = "GPT"
}

export interface ChatTurn {
    id: number,
    interlocutor: Interlocutor,
    text: string
}

export enum ChatStatus {
    READY = "READY",
    WAITING = "WAITING",
    PROACTIVE_PROCESSING = "PROACTIVE_PROCESSING",
    REACTION_PROCESSING = "REACTION_PROCESSING"
}

export enum NonverbalCue{
    None = "None",
    BLENDSHAPES = "Blendshapes",
    VIDEO = "Video"
}

export enum TaskGroup {
    GROUP_A = "GROUP_A",
    GROUP_B = "GROUP_B",
    GROUP_C = "GROUP_C",
    GROUP_D = "GROUP_D",
    GROUP_E = "GROUP_E"
}

export enum LogMessage {
    MessageSent = "MessageSent",
    MessageReceived = "MessageReceived",
    RouteToPage = "RouteToPage"
}

export interface ChatLogTurn {
    role: string,
    content: string,
    createdAt: string
}

export interface Session {
    sessionId: string,
    userId: string,
    taskGroup: string,
    createdAt: Date,
    sessionState: string,
    taskOrder: string
}

export interface SessionLog {
    logId: string,
    sessionId: string,
    createdAt: Date,
    logType: string,
    log: string
}

export interface SurveyItem {
    id: string,
    text: string,
    value: number
}
export interface SurveyEntry {
    id: string,
    value: string,
    createdAt: Date,
}

export interface SessionMessage {
    messageId: number,
    sessionId: string,
    createdAt: Date,
    assistantId: string,
    threadId: string
    imageName: string
    userContent: string
    systemResponse: string
    imageAnalysis: string
}
