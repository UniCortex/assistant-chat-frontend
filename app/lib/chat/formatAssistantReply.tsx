import type { ReactNode } from "react";

export function normalizeAssistantPlaintext(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

function parseBlockLines(block: string): ReactNode {
  const lines = block.split("\n").map((l) => l.trimEnd());
  const nonEmptyLines = lines.filter(Boolean);

  const unorderedListLines = nonEmptyLines.filter((l) => /^[-*+]\s+\S/.test(l.trim()));
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
            <li key={i}>{renderInlineFormatting(line.trim().replace(/^\s*[-*+]\s+/, ""))}</li>
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

  const segments: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (/^#{1,6}\s+\S/.test(line)) {
      const level = Math.min(6, Math.max(1, line.match(/^#+/)?.[0].length ?? 1));
      const headingText = line.replace(/^#{1,6}\s+/, "");
      if (level === 1) segments.push(<h1 key={`h1-${i}`}>{renderInlineFormatting(headingText)}</h1>);
      if (level === 2) segments.push(<h2 key={`h2-${i}`}>{renderInlineFormatting(headingText)}</h2>);
      if (level === 3) segments.push(<h3 key={`h3-${i}`}>{renderInlineFormatting(headingText)}</h3>);
      if (level === 4) segments.push(<h4 key={`h4-${i}`}>{renderInlineFormatting(headingText)}</h4>);
      if (level === 5) segments.push(<h5 key={`h5-${i}`}>{renderInlineFormatting(headingText)}</h5>);
      if (level === 6) segments.push(<h6 key={`h6-${i}`}>{renderInlineFormatting(headingText)}</h6>);
      i += 1;
      continue;
    }

    if (/^>\s*\S/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s*\S/.test(lines[i].trim())) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      segments.push(
        <blockquote key={`q-${i}`} className="bot-message-para">
          {quoteLines.map((qLine, idx) => (
            <span key={`qline-${idx}`}>
              {renderInlineFormatting(qLine)}
              {idx < quoteLines.length - 1 ? <br /> : null}
            </span>
          ))}
        </blockquote>,
      );
      continue;
    }

    if (/^[-*+]\s+\S/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s+\S/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*+]\s+/, ""));
        i += 1;
      }
      segments.push(
        <ul key={`ul-${i}`} className="bot-message-list">
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineFormatting(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+\S/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+\S/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      segments.push(
        <ol key={`ol-${i}`} className="bot-message-list">
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineFormatting(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const current = lines[i].trim();
      if (
        !current ||
        /^[-*+]\s+\S/.test(current) ||
        /^\d+\.\s+\S/.test(current) ||
        /^#{1,6}\s+\S/.test(current) ||
        /^>\s*\S/.test(current)
      ) {
        break;
      }
      paragraphLines.push(lines[i]);
      i += 1;
    }

    if (paragraphLines.length > 0) {
      const rendered: ReactNode[] = [];
      paragraphLines.forEach((pLine, idx) => {
        rendered.push(<span key={`t-${idx}`}>{renderInlineFormatting(pLine)}</span>);
        if (idx < paragraphLines.length - 1) {
          rendered.push(<br key={`br-${idx}`} />);
        }
      });
      segments.push(
        <p key={`p-${i}`} className="bot-message-para">
          {rendered}
        </p>,
      );
    }
  }

  return <>{segments}</>;
}

function renderInlineFormatting(text: string): ReactNode {
  const tokens = text.split(
    /(`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|(?:\[[^\]\n]+\]\([^) \n]+\))|(?:https?:\/\/[^\s]+))/g,
  );

  return tokens.filter(Boolean).map((token, i) => {
    const mdLink = token.match(/^\[([^\]\n]+)\]\(([^)\s]+)\)$/);
    if (mdLink) {
      return (
        <a key={`ml-${i}`} href={mdLink[2]} target="_blank" rel="noopener noreferrer">
          {mdLink[1]}
        </a>
      );
    }

    if (/^https?:\/\/[^\s]+$/.test(token)) {
      return (
        <a key={`l-${i}`} href={token} target="_blank" rel="noopener noreferrer">
          {token}
        </a>
      );
    }

    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      return <strong key={`b-${i}`}>{token.slice(2, -2)}</strong>;
    }

    if (token.startsWith("__") && token.endsWith("__") && token.length > 4) {
      return <strong key={`u-${i}`}>{token.slice(2, -2)}</strong>;
    }

    if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      return <em key={`em-${i}`}>{token.slice(1, -1)}</em>;
    }

    if (token.startsWith("_") && token.endsWith("_") && token.length > 2) {
      return <em key={`emi-${i}`}>{token.slice(1, -1)}</em>;
    }

    if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      return <code key={`c-${i}`}>{token.slice(1, -1)}</code>;
    }

    return <span key={`t-${i}`}>{token}</span>;
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
