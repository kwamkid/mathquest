// components/visuals/ConceptBlockRenderer.tsx
//
// Switch over ConceptBlock.kind and render the right visual component.
// Phase 1 implements: text, callout, fractionBar, fractionCircle,
// fractionAddition, numberLine, mathExpression.
// Other kinds (image, shape, analogClock, ruler, barChart) render a
// "not yet supported" stub until Phase 2-3.

'use client';

import { ReactNode } from 'react';
import type { ConceptBlock } from '@/types/curriculum';
import FractionBar from './FractionBar';
import FractionCircle from './FractionCircle';
import FractionAddition from './FractionAddition';
import NumberLine from './NumberLine';

interface Props {
  block: ConceptBlock;
}

// Lightweight inline markdown — supports **bold** and `code`.
// Avoids pulling in a markdown lib for Phase 1.
const renderInline = (text: string): ReactNode => {
  const parts: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(
        <strong key={key++} className="font-bold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('`')) {
      parts.push(
        <code
          key={key++}
          className="rounded bg-white/10 px-1 font-mono text-[0.95em] text-pink-200"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
};

const renderMarkdown = (markdown: string): ReactNode =>
  markdown.split(/\n\n+/).map((para, i) => (
    <p key={i} className="leading-relaxed">
      {renderInline(para)}
    </p>
  ));

const calloutClass: Record<'info' | 'tip' | 'warning', string> = {
  info: 'learn-callout learn-callout-info',
  tip: 'learn-callout learn-callout-tip',
  warning: 'learn-callout learn-callout-warning',
};

const calloutIcon: Record<'info' | 'tip' | 'warning', string> = {
  info: 'ℹ️',
  tip: '💡',
  warning: '⚠️',
};

export default function ConceptBlockRenderer({ block }: Props) {
  switch (block.kind) {
    case 'text':
      return <div className="space-y-2 text-base text-white/90">{renderMarkdown(block.markdown)}</div>;

    case 'callout':
      return (
        <div className={calloutClass[block.tone]}>
          <span aria-hidden="true" className="text-xl leading-none">
            {calloutIcon[block.tone]}
          </span>
          <div className="space-y-1 text-base leading-relaxed">{renderMarkdown(block.markdown)}</div>
        </div>
      );

    case 'fractionBar':
      return (
        <div className="flex flex-col items-center gap-2">
          <FractionBar numerator={block.numerator} denominator={block.denominator} showLabel />
          {block.label && <span className="text-sm text-white/70">{block.label}</span>}
        </div>
      );

    case 'fractionCircle':
      return (
        <div className="flex flex-col items-center gap-2">
          <FractionCircle numerator={block.numerator} denominator={block.denominator} showLabel />
          {block.label && <span className="text-sm text-white/70">{block.label}</span>}
        </div>
      );

    case 'fractionAddition':
      return (
        <FractionAddition
          left={block.left}
          right={block.right}
          result={block.result}
          style={block.style}
        />
      );

    case 'numberLine':
      return (
        <div className="flex justify-center">
          <NumberLine from={block.from} to={block.to} step={block.step} highlight={block.highlight} />
        </div>
      );

    case 'mathExpression':
      return (
        <div
          className="learn-formula text-2xl"
        >
          {block.latex}
        </div>
      );

    case 'image':
    case 'shape':
    case 'analogClock':
    case 'ruler':
    case 'barChart':
      return (
        <div className="rounded-xl border-2 border-dashed border-white/20 bg-white/5 px-4 py-3 text-sm text-white/50">
          Visual “{block.kind}” — not yet implemented (Phase 2+).
        </div>
      );
  }
}
