'use client';

import React, { useState } from 'react';
import { Mic, MicOff, Send, Bot, User, Radio } from 'lucide-react';
import { IntercomMessage } from '@/types/telemetry';

interface IntercomConsoleProps {
  onSendMessage: (text: string) => Promise<void>;
  messages: IntercomMessage[];
}

export const IntercomConsole: React.FC<IntercomConsoleProps> = ({
  onSendMessage,
  messages,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTalking, setIsTalking] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const txt = inputText;
    setInputText('');
    await onSendMessage(txt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "State your name and affiliation.",
    "Deposit package in the verified airlock hatch.",
    "You are trespassing on monitored property. Depart immediately."
  ];

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-lg p-4 font-mono flex flex-col h-full">
      <div className="flex items-center justify-between pb-2 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyber-cyan" />
          <span className="text-xs font-semibold text-gray-400">TACTICAL TWO-WAY INTERCOM</span>
        </div>
        <span className="text-[10px] text-gray-500 font-mono">HOLD [SPACE] FOR PTT</span>
      </div>

      {/* Message Transcript Log */}
      <div className="flex-1 my-3 overflow-y-auto space-y-2 max-h-48 pr-1 text-xs">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center py-6 text-[11px] italic">
            Intercom channel standby. Audio feed open.
          </div>
        ) : (
          messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-2 rounded border ${
                m.sender === 'OPERATOR'
                  ? 'bg-cyber-dark/80 border-cyber-cyan/40 text-cyber-cyan ml-4'
                  : 'bg-cyber-dark/90 border-cyber-border text-gray-200 mr-4'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-0.5">
                {m.sender === 'OPERATOR' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3 text-cyber-green" />}
                <span className="font-bold">{m.sender}</span>
                <span suppressHydrationWarning>• {new Date(m.timestamp * 1000).toLocaleTimeString()}</span>
              </div>
              <p className="leading-relaxed">{m.transcript}</p>
            </div>
          ))
        )}
      </div>

      {/* Quick Prompts */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
        {quickPrompts.map((q, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(q)}
            className="text-[10px] bg-cyber-dark hover:bg-cyber-border text-gray-400 hover:text-white px-2 py-1 rounded whitespace-nowrap border border-cyber-border transition"
          >
            {q.length > 28 ? q.slice(0, 28) + '...' : q}
          </button>
        ))}
      </div>

      {/* Input controls */}
      <div className="flex gap-2">
        <button
          onMouseDown={() => setIsTalking(true)}
          onMouseUp={() => setIsTalking(false)}
          className={`px-3 py-2 rounded text-xs font-bold transition flex items-center gap-1 border ${
            isTalking
              ? 'bg-cyber-red text-white border-cyber-red animate-pulse'
              : 'bg-cyber-dark hover:bg-cyber-border text-gray-300 border-cyber-border'
          }`}
        >
          {isTalking ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-gray-400" />}
          <span>{isTalking ? 'TALKING' : 'PTT'}</span>
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Transmit tactical directive or challenge..."
          className="flex-1 bg-cyber-dark border border-cyber-border rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan transition font-mono"
        />

        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="bg-cyber-cyan hover:bg-cyber-cyan/90 disabled:bg-cyber-border/40 text-black px-3 py-2 rounded transition font-bold"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
