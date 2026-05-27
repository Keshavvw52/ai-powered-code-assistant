// src/components/StreamOutput.tsx
import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface StreamOutputProps {
  content: string;
  isStreaming: boolean;
  language?: string;
  label?: string;
}

export default function StreamOutput({ content, isStreaming, language = 'plaintext', label }: StreamOutputProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [content]);

  return (
    <div className="flex flex-col h-full">
      {label && (
        <div className="flex items-center justify-between px-3 py-2 shrink-0" style={{ borderBottom: '1px solid #3c3c3c' }}>
          <span className="text-xs text-gray-400">{label}</span>
          {isStreaming && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#007acc' }}>
              <Loader2 size={12} className="animate-spin" />
              Generating...
            </div>
          )}
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <pre className="p-3 text-xs font-mono whitespace-pre-wrap break-words" style={{ color: '#d4d4d4', lineHeight: '1.6' }}>
          {content}
          {isStreaming && <span className="cursor-blink" />}
        </pre>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}