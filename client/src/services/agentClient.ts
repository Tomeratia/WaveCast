import { api } from './api';
import type { ApiResponse, AgentChatReply } from '@wavecast/shared';

export async function sendAgentMessage(message: string): Promise<string> {
  const res = await api.post<ApiResponse<AgentChatReply>>('/api/agent/chat', { message });
  if (!res.data.data) {
    throw new Error('Empty response from agent');
  }
  return res.data.data.reply;
}
