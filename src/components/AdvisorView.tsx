import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, Sparkles, User, HelpCircle, Loader, MessageSquare, AlertCircle } from 'lucide-react';

export default function AdvisorView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your SmartBasket AI Retail Intelligence Advisor.

I monitor historical price distributions, regional shipping diesel rates, agricultural yields, and global food index charts.

Feel free to ask me questions like:
- **Why are tomato prices increasing?**
- **Should I buy rice this week?**
- **Which products are cheapest right now?**
- **Which market should I visit for maximum savings?**`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const presetQueries = [
    'Why are tomato prices increasing?',
    'Should I buy rice this week?',
    'Which products are cheapest?',
    'Which market should I visit?'
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const chatHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: chatHistory })
      });

      if (!res.ok) {
        throw new Error('Server returned an error responding to AI request.');
      }

      const data = await res.json();
      
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setError('Connection timeout. Please check your network credentials or try again.');
    } finally {
      setLoading(false);
    }
  };

  // Simple clean markdown bold/bullet points parser
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, lineIdx) => {
      // Check if it's a bullet point
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      let cleanedLine = line;
      if (isBullet) {
        cleanedLine = line.trim().substring(2);
      }

      // Regex for bold **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(cleanedLine)) !== null) {
        const matchIndex = match.index;
        if (matchIndex > lastIndex) {
          parts.push(cleanedLine.substring(lastIndex, matchIndex));
        }
        parts.push(
          <strong key={matchIndex} className="font-bold text-slate-900 dark:text-white">
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < cleanedLine.length) {
        parts.push(cleanedLine.substring(lastIndex));
      }

      const content = parts.length > 0 ? parts : cleanedLine;

      if (isBullet) {
        return (
          <li key={lineIdx} className="ml-5 list-disc text-sm leading-relaxed mb-1 text-slate-700 dark:text-slate-300">
            {content}
          </li>
        );
      }

      if (line.trim() === '') {
        return <div key={lineIdx} className="h-2" />;
      }

      return (
        <p key={lineIdx} className="text-sm leading-relaxed mb-2 text-slate-700 dark:text-slate-300">
          {content}
        </p>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]" id="advisor-workspace-grid">
      
      {/* Left panel: Quick Topic chips */}
      <div className="lg:col-span-1 bg-white dark:bg-[#121c15] p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 shadow-sm flex flex-col justify-between h-fit lg:h-full">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-[#166534] dark:text-emerald-400 animate-pulse" />
            <h3 className="text-sm font-extrabold text-[#166534] dark:text-[#86efac]">Suggested Inquiries</h3>
          </div>
          <p className="text-xs font-semibold text-slate-400 dark:text-emerald-500/60 mb-4 leading-relaxed">
            Tap any preset analysis topic below to immediately command the retail algorithm.
          </p>
          
          <div className="space-y-2.5">
            {presetQueries.map((query, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(query)}
                disabled={loading}
                className="w-full text-left px-3.5 py-3 rounded-xl border border-slate-200/60 dark:border-emerald-900/40 text-xs font-semibold text-slate-700 dark:text-emerald-100/80 hover:bg-[#f0f4f2]/60 dark:hover:bg-[#15803d]/20 hover:border-[#86efac] dark:hover:border-emerald-700 hover:text-[#166534] dark:hover:text-emerald-400 transition-all flex items-center justify-between gap-2 cursor-pointer"
              >
                <span>"{query}"</span>
                <HelpCircle className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-emerald-800" />
              </button>
            ))}
          </div>
        </div>

        <div className="hidden lg:block border-t border-slate-200/60 dark:border-emerald-900/30 pt-4 mt-6 text-[10px] font-medium text-slate-400 dark:text-emerald-600/70 leading-relaxed">
          SmartBasket AI Advisor utilizes advanced time-series LLMs to formulate optimal purchasing strategies and counter inflation pressure.
        </div>
      </div>

      {/* Right panel: Chat interface */}
      <div className="lg:col-span-3 bg-white dark:bg-[#121c15] rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 shadow-sm flex flex-col h-full overflow-hidden">
        
        {/* Chat header */}
        <div className="px-5 py-4 border-b border-slate-200/60 dark:border-emerald-900/30 flex items-center justify-between bg-[#f0f4f2]/40 dark:bg-emerald-950/10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-[#dcfce7] dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-[#166534] dark:text-emerald-400">
              <MessageSquare className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Advisor Chat</h3>
              <p className="text-[10px] text-[#166534] dark:text-emerald-400 font-extrabold uppercase tracking-wider font-mono">Gemini-2.5-Flash Core</p>
            </div>
          </div>
          <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
        </div>

        {/* Messages list */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-[#f0f4f2]/10 dark:bg-[#0b110d]/10">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div key={m.id} className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                
                {/* Assistant avatar */}
                {!isUser && (
                  <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-tr from-[#166534] to-[#22c55e] text-white shrink-0 flex items-center justify-center shadow-sm">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                )}

                <div className="space-y-1 max-w-[85%]">
                  <div className={`p-4 rounded-2xl text-sm ${
                    isUser 
                      ? 'bg-[#166534] text-white rounded-tr-none dark:bg-[#15803d] shadow-sm' 
                      : 'bg-white dark:bg-[#0c130f] text-slate-800 dark:text-emerald-100/90 rounded-tl-none border border-slate-200/60 dark:border-emerald-900/20 shadow-sm'
                  }`}>
                    {isUser ? (
                      <p className="leading-relaxed whitespace-pre-line font-medium">{m.content}</p>
                    ) : (
                      <div className="space-y-1">
                        {renderFormattedText(m.content)}
                      </div>
                    )}
                  </div>
                  <p className={`text-[9px] text-slate-400 font-mono px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    {m.timestamp}
                  </p>
                </div>

                {/* User avatar */}
                {isUser && (
                  <div className="h-8.5 w-8.5 rounded-xl bg-[#dcfce7] dark:bg-[#15803d]/30 text-[#166534] dark:text-emerald-400 shrink-0 flex items-center justify-center font-bold">
                    <User className="h-4.5 w-4.5" />
                  </div>
                )}

              </div>
            );
          })}

          {/* Loading bubble */}
          {loading && (
            <div className="flex gap-3.5 justify-start">
              <div className="h-8.5 w-8.5 rounded-xl bg-[#dcfce7] dark:bg-emerald-950 text-[#166534] dark:text-[#86efac] shrink-0 flex items-center justify-center font-bold">
                <Loader className="h-4 w-4 animate-spin text-[#166534] dark:text-emerald-400" />
              </div>
              <div className="bg-white dark:bg-[#0c130f] p-4 rounded-2xl rounded-tl-none border border-slate-200/60 dark:border-emerald-900/20 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-red-600 dark:text-red-400">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="p-4 border-t border-slate-200/60 dark:border-emerald-900/30 bg-[#f0f4f2]/40 dark:bg-[#0b110d]/40 flex gap-3"
        >
          <input
            type="text"
            required
            placeholder="Type your retail price question here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#10b981] focus:outline-none dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-white dark:focus:border-[#10b981]"
            id="advisor-chat-input"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            id="btn-advisor-send"
            className="bg-[#166534] hover:bg-[#15803d] disabled:opacity-50 text-white h-11 w-11 shrink-0 rounded-xl flex items-center justify-center shadow-md shadow-emerald-800/10 hover:shadow-emerald-800/20 transition-all active:scale-[0.97] cursor-pointer"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>

      </div>

    </div>
  );
}
