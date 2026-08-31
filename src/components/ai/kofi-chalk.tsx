'use client';

import type { ReactNode } from 'react';

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (/^\*\*(.+)\*\*$/.test(part)) {
      return (
        <strong key={i} className="chalk-color-yellow">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function buildBlocks(safeLines: string[]): ReactNode[] {
  const out: ReactNode[] = [];
  let list: { type: 'ul' | 'ol'; items: string[] } | null = null;

  const pushList = () => {
    if (!list) return;
    const Tag = list.type === 'ul' ? 'ul' : 'ol';
    const cls = list.type === 'ul' ? 'chalk-list' : 'chalk-ol';
    out.push(
      <Tag key={out.length} className={`my-1.5 ${cls}`}>
        {list.items.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </Tag>
    );
    list = null;
  };

  for (const raw of safeLines) {
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(raw);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(raw);
    if (bullet) {
      if (list && list.type !== 'ul') pushList();
      if (!list) list = { type: 'ul', items: [] };
      list.items.push(bullet[1]);
    } else if (numbered) {
      if (list && list.type !== 'ol') pushList();
      if (!list) list = { type: 'ol', items: [] };
      list.items.push(numbered[1]);
    } else if (raw.trim() === '') {
      pushList();
    } else {
      pushList();
      out.push(<p key={out.length} className="my-1">{renderInline(raw)}</p>);
    }
  }
  pushList();
  return out;
}

export function KofiChalk({ content }: { content: string }) {
  if (!content.trim()) return null;

  const safe = escapeHtml(content);
  const lines = safe.split('\n');
  if (lines.length <= 1) {
    return <div>{renderInline(safe.trim() || content.trim())}</div>;
  }

  return <div className="space-y-1">{buildBlocks(lines)}</div>;
}
