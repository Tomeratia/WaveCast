import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Bot, Send } from 'lucide-react';
import { sendAgentMessage } from '../services/agentClient';
import type { ChatMessage } from '@wavecast/shared';

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: "Hi! I'm your WaveCast surf assistant. Ask me about conditions at any spot, or where to surf this week.",
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="h-2 w-2 rounded-full bg-ocean-400 animate-bounce [animation-delay:-0.3s]" />
      <span className="h-2 w-2 rounded-full bg-ocean-400 animate-bounce [animation-delay:-0.15s]" />
      <span className="h-2 w-2 rounded-full bg-ocean-400 animate-bounce" />
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-ocean-600">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'rounded-br-sm bg-ocean-500 text-white'
            : 'rounded-bl-sm bg-app-card text-gray-200'
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

export function AgentPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function handleSubmit() {
    const text = input.trim();
    if (!text || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const reply = await sendAgentMessage(text);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setError('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-52px)] max-w-3xl flex-col px-4 py-4">
      <div className="mb-4 flex items-center gap-2">
        <Bot className="h-5 w-5 text-ocean-400" />
        <h1 className="text-lg font-bold text-white">AI Surf Assistant</h1>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl bg-app-surface p-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-ocean-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="rounded-2xl rounded-bl-sm bg-app-card">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}
        className="mt-3 flex items-end gap-2"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about surf conditions... (Enter to send, Shift+Enter for newline)"
          rows={2}
          disabled={isLoading}
          className="flex-1 resize-none rounded-xl border border-app-border bg-app-card px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:border-ocean-500 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-ocean-500 text-white transition-colors hover:bg-ocean-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
