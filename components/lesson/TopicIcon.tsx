// components/lesson/TopicIcon.tsx
//
// Render a topic's visual identifier — Lucide icon when iconName is set,
// fallback to the legacy emoji string, fallback to a generic book.
// Kept tiny so it can drop into list rows, page headers, and breadcrumbs
// with consistent sizing.

'use client';

import {
  BookOpen,
  Calculator,
  Clock,
  Percent,
  PieChart,
  ShoppingCart,
} from 'lucide-react';
import type { Topic } from '@/types/curriculum';

const ICON_MAP = {
  percent: Percent,
  'shopping-cart': ShoppingCart,
  clock: Clock,
  'pie-chart': PieChart,
  'book-open': BookOpen,
  calculator: Calculator,
} as const;

interface Props {
  topic: Pick<Topic, 'icon' | 'iconName'>;
  className?: string;
  // For emoji fallback — Lucide icons get className directly. Default sizes
  // assume a list-row context (≈24px); pass `text-3xl` etc. for headers.
  emojiClassName?: string;
}

export default function TopicIcon({
  topic,
  className = 'h-6 w-6 text-pink-300',
  emojiClassName = 'text-2xl leading-none',
}: Props) {
  if (topic.iconName) {
    const LucideIcon = ICON_MAP[topic.iconName];
    return <LucideIcon className={className} aria-hidden="true" />;
  }
  if (topic.icon) {
    return (
      <span className={emojiClassName} aria-hidden="true">
        {topic.icon}
      </span>
    );
  }
  return <BookOpen className={className} aria-hidden="true" />;
}
