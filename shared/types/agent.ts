export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentChatRequest {
  message: string;
}

export interface AgentChatReply {
  reply: string;
}
