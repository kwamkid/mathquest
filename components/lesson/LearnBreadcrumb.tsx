// components/lesson/LearnBreadcrumb.tsx
//
// Shared breadcrumb for the /learn flow. Items are passed top-down so each
// page only needs to know its own segment. Last item is the current page
// (rendered as plain text, not a link).

'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string; // omit to mark as the current (terminal) crumb
}

interface Props {
  items: BreadcrumbItem[];
}

export default function LearnBreadcrumb({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="-mx-1 mb-3 text-sm">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-white/60">
        <li>
          <Link
            href="/learn"
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:bg-white/10 hover:text-white"
          >
            <Home className="h-3.5 w-3.5" />
            <span>เรียน</span>
          </Link>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-white/30" />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="max-w-[16ch] truncate rounded-md px-1.5 py-0.5 hover:bg-white/10 hover:text-white sm:max-w-[22ch]"
                  title={item.label}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current="page"
                  className="max-w-[18ch] truncate px-1.5 py-0.5 font-semibold text-white sm:max-w-[28ch]"
                  title={item.label}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
