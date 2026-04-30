import type { ReactNode } from "react";

export function normalizeAssistantPlaintext(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

function parseBlockLines(block: string): ReactNode {
  const lines = block.split("\n").map((l) => l.trimEnd());
  const nonEmptyLines = lines.filter(Boolean);

  const unorderedListLines = nonEmptyLines.filter((l) => /^[-*]\s+\S/.test(l.trim()));
  const isUnorderedListBlock =
    unorderedListLines.length > 0 && unorderedListLines.length === nonEmptyLines.length;
  const orderedListLines = nonEmptyLines.filter((l) => /^\d+\.\s+\S/.test(l.trim()));
  const isOrderedListBlock =
    orderedListLines.length > 0 && orderedListLines.length === nonEmptyLines.length;

  if (isUnorderedListBlock) {
    return (
      <ul className="bot-message-list">
        {lines
          .filter(Boolean)
          .map((line, i) => (
            <li key={i}>{renderInlineFormatting(line.trim().replace(/^\s*[-*]\s+/, ""))}</li>
          ))}
      </ul>
    );
  }

  if (isOrderedListBlock) {
    return (
      <ol className="bot-message-list">
        {lines
          .filter(Boolean)
          .map((line, i) => (
            <li key={i}>{renderInlineFormatting(line.trim().replace(/^\s*\d+\.\s+/, ""))}</li>
          ))}
      </ol>
    );
  }

  const rendered: ReactNode[] = [];
  lines.forEach((line, i) => {
    rendered.push(<span key={`t-${i}`}>{renderInlineFormatting(line)}</span>);
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

function renderInlineFormatting(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={`b-${i}`}>{part.slice(2, -2)}</strong>;
    }

    return <span key={`t-${i}`}>{part}</span>;
  });
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
