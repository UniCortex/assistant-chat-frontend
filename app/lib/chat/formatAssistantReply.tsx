import type { ReactNode } from "react";

export function normalizeAssistantPlaintext(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

function parseBlockLines(block: string): ReactNode {
  const lines = block.split("\n").map((l) => l.trimEnd());

  const listLines = lines.filter((l) => /^[-*]\s+\S/.test(l.trim()));
  const isListBlock = listLines.length > 0 && listLines.length === lines.filter(Boolean).length;

  if (isListBlock) {
    return (
      <ul className="bot-message-list">
        {lines
          .filter(Boolean)
          .map((line, i) => (
            <li key={i}>{line.trim().replace(/^\s*[-*]\s+/, "")}</li>
          ))}
      </ul>
    );
  }

  const rendered: ReactNode[] = [];
  lines.forEach((line, i) => {
    rendered.push(<span key={`t-${i}`}>{line}</span>);
    if (i < lines.length - 1) {
      rendered.push(<br key={`br-${i}`} />);
    }
  });

  return (
    <p className="bot-message-para">
      {rendered}
    </p>
  );
}

export function formatAssistantReply(text: string): ReactNode {
  const normalized = normalizeAssistantPlaintext(text);
  const blocks = normalized.split("\n\n").map((b) => b.trim()).filter(Boolean);
  if (blocks.length === 0) return null;
  return (
    <div className="message-text-bot-inner">
      {blocks.map((block, i) => (
        <div key={i} className="bot-message-block">
          {parseBlockLines(block)}
        </div>
      ))}
    </div>
  );
}
