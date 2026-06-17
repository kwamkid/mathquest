// app/not-found.tsx
//
// Custom 404. Triggered by Next when no route matches — also when a page
// calls notFound() explicitly. Keeps the brand look so the page doesn't
// feel like an internal-server crash.

import Link from 'next/link';
import { ArrowLeft, BookOpen, Gamepad2, Home, Lightbulb, Pi } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="learn-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12 text-center">
      {/* Quiet floating π in the background — keeps the page on-brand
        * without competing with the message. */}
      <Pi
        className="pointer-events-none absolute -top-10 -right-10 h-72 w-72 text-metaverse-purple/15 sm:h-96 sm:w-96"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-xl space-y-6">
        <div className="flex flex-col items-center gap-2">
          <span className="text-7xl font-extrabold text-transparent bg-gradient-to-r from-metaverse-purple to-metaverse-red bg-clip-text sm:text-8xl">
            404
          </span>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            ไม่พบหน้านี้
          </h1>
          <p className="text-base text-white/70">
            URL ที่คุณเข้ามาอาจถูกย้าย เปลี่ยนชื่อ หรือยังไม่มีอยู่ในระบบ
          </p>
        </div>

        {/* Three quick destinations — covers the common reason a learner
          * ended up here (typo or stale bookmark). */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/"
            className="learn-card flex flex-col items-center gap-2 rounded-2xl p-4 text-white transition hover:border-pink-400/50"
          >
            <Home className="h-7 w-7 text-pink-300" />
            <span className="text-sm font-bold">หน้าแรก</span>
          </Link>
          <Link
            href="/learn"
            className="learn-card flex flex-col items-center gap-2 rounded-2xl p-4 text-white transition hover:border-pink-400/50"
          >
            <BookOpen className="h-7 w-7 text-pink-300" />
            <span className="text-sm font-bold">Learn</span>
          </Link>
          <Link
            href="/life-math"
            className="learn-card flex flex-col items-center gap-2 rounded-2xl p-4 text-white transition hover:border-amber-400/50"
          >
            <Lightbulb className="h-7 w-7 text-amber-300" />
            <span className="text-sm font-bold">Life Math</span>
          </Link>
        </div>

        <Link
          href="/play"
          className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
        >
          <Gamepad2 className="h-4 w-4" />
          หรือไปเล่นเกมเลย
          <ArrowLeft className="h-3 w-3 rotate-180" />
        </Link>
      </div>
    </div>
  );
}
