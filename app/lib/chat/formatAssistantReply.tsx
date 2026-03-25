import type { ReactNode } from "react";

const EMAIL_TOKEN = (i: number) => `__E_${i}__`;

export function normalizeAssistantPlaintext(text: string): string {
  let t = text.replace(/\r\n/g, "\n");

  const emails: string[] = [];
  t = t.replace(/[\w%+.-]+@[\w.-]+\.\w+/gi, (m) => {
    emails.push(m);
    return EMAIL_TOKEN(emails.length - 1);
  });

  t = t.replace(/:\s*-\s+/g, ":\n\n- ");
  t = t.replace(/\.-\s+/g, ".\n\n- ");

  t = t.replace(/(?<!\.)\.(?!\s|$)(?!\d)(?!\.)/gu, ".\n\n");

  t = t.replace(/\n{3,}/g, "\n\n");

  t = t.replace(/__E_(\d+)__/g, (_, idx) => emails[Number(idx)] ?? "");

  return t;
}

function parseBlockLines(block: string): ReactNode[] {
  const lines = block.split("\n").map((l) => l.trimEnd());
  const nodes: ReactNode[] = [];
  let textBuf: string[] = [];
  let listBuf: string[] = [];
  let key = 0;

  const flushText = () => {
    const joined = textBuf.join(" ").replace(/\s+/g, " ").trim();
    textBuf = [];
    if (joined) {
      nodes.push(
        <p key={`p-${key++}`} className="bot-message-para">
          {joined}
        </p>,
      );
    }
  };

  const flushList = () => {
    if (listBuf.length === 0) return;
    const items = listBuf.map((raw) => raw.replace(/^\s*[-*]\s+/, "").trim());
    listBuf = [];
    nodes.push(
      <ul key={`ul-${key++}`} className="bot-message-list">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>,
    );
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[-*]\s+\S/.test(trimmed) || /^[-*]\s*$/.test(trimmed)) {
      flushText();
      if (trimmed) listBuf.push(trimmed);
    } else if (!trimmed) {
      flushText();
      flushList();
    } else {
      flushList();
      textBuf.push(trimmed);
    }
  }
  flushText();
  flushList();

  return nodes;
}

export function formatAssistantReply(text: string): ReactNode {
  const normalized = normalizeAssistantPlaintext(text);
  const blocks = normalized.split(/\n\s*\n+/).map((b) => b.trim()).filter(Boolean);
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
