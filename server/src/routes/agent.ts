import { Router } from 'express';
import { agentService } from '../services/agentService.js';
import { ValidationError } from '../middleware/errorHandler.js';
import type { ApiResponse, AgentChatReply } from '@wavecast/shared';

const router = Router();

router.post('/chat', async (req, res) => {
  const { message } = req.body as { message?: unknown };

  if (typeof message !== 'string' || message.trim().length === 0) {
    throw new ValidationError('message must be a non-empty string');
  }

  const reply = await agentService.chat(message.trim());
  const response: ApiResponse<AgentChatReply> = { success: true, data: { reply } };
  res.json(response);
});

export default router;
