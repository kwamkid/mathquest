// components/timetable/TimetableRoundPlayer.tsx
//
// Plays one timetable round: generates 20 MCQ questions, walks through them
// with instant feedback (green/red on the picked choice — same as lessons),
// then shows a result + awards EXP on a pass. Self-contained drill UI, not the
// full LessonPlayer, since timetable has no concept/worked-example steps.

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, X } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import LessonHeader from '@/components/lesson/LessonHeader';
import MultipleChoiceTextQuestion from '@/components/question/MultipleChoiceTextQuestion';
import { useSound } from '@/lib/game/soundManager';
import { useAuth } from '@/lib/contexts/AuthContext';
import { generateRound } from '@/lib/timetable/generator';
import { saveTimetableRound } from '@/lib/timetable/progress';
import {
  PASSING_RATIO,
  QUESTIONS_PER_ROUND,
  ROUNDS,
} from '@/lib/timetable/config';

interface Props {
  table: number;
  round: number;
}

export default function TimetableRoundPlayer({ table, round }: Props) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { playSound } = useSound();

  // Generate once per (table, round) mount. New attempt = remount via key.
  const questions = useMemo(() => generateRound(table, round), [table, round]);
  const roundDef = ROUNDS.find((r) => r.round === round) ?? ROUNDS[0];

  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { correct: boolean }>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [finished, setFinished] = useState(false);
  const [reward, setReward] = useState<{ exp: number; firstClear: boolean } | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  const total = questions.length;
  const current = questions[index];
  const isLastQuestion = index === total - 1;

  const handleAnswered = (result: { correct: boolean; value: string }) => {
    if (feedback) return;
    playSound(result.correct ? 'correct' : 'incorrect');
    setFeedback({ correct: result.correct });
    if (result.correct) setCorrectCount((c) => c + 1);
  };

  const finishRound = async (finalCorrect: number) => {
    const passed = finalCorrect / total >= PASSING_RATIO;
    setFinished(true);
    if (passed && user) {
      setSaving(true);
      playSound('levelUp');
      try {
        const res = await saveTimetableRound({
          userId: user.id,
          table,
          round,
          perfect: finalCorrect === total,
        });
        setReward({ exp: res.expGained, firstClear: res.firstClear });
        await refreshUser();
      } finally {
        setSaving(false);
      }
    }
  };

  const handleAdvance = () => {
    const finalCorrect = correctCount;
    if (isLastQuestion) {
      void finishRound(finalCorrect);
      return;
    }
    setIndex((i) => i + 1);
    setFeedback(null);
    setResetSignal((s) => s + 1);
  };

  // ----- Result screen -----
  if (finished) {
    const pct = Math.round((correctCount / total) * 100);
    const passed = correctCount / total >= PASSING_RATIO;
    return (
      <div className="learn-bg min-h-screen">
        {user && <AppHeader user={user} />}
        <div className="mx-auto max-w-lg px-4 py-12 text-center">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
              passed
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/20 text-rose-300'
            }`}
          >
            {passed ? <Check className="h-10 w-10" strokeWidth={3} /> : <X className="h-10 w-10" strokeWidth={3} />}
          </div>
          <h1 className="mt-5 text-2xl font-bold text-white">
            {passed ? 'ผ่านแล้ว! 🎉' : 'ยังไม่ผ่าน ลองอีกครั้งนะ'}
          </h1>
          <p className="mt-2 text-lg text-white/80">
            ตอบถูก {correctCount}/{total} ข้อ ({pct}%)
          </p>
          {passed && reward && (
            <p className="mt-2 text-base font-semibold text-fuchsia-200">
              {reward.firstClear
                ? `⚡ ได้รับ +${reward.exp} EXP`
                : 'ฝึกซ้ำได้ EXP ครบแล้วรอบนี้ 👍'}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => router.push('/timetable')}
              className="learn-accent-pill flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-bold shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.99]"
            >
              เลือกรอบถัดไป
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => router.refresh()}
              disabled={saving}
              className="glass rounded-2xl px-6 py-3 font-semibold text-white/80 transition hover:bg-white/10 disabled:opacity-50"
            >
              ฝึกรอบนี้อีกครั้ง
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----- Question screen -----
  return (
    <div className="learn-bg flex min-h-screen flex-col">
      {/* Shared header — same X-to-exit + progress used by the lesson player. */}
      <LessonHeader
        lessonTitle={`แม่ ${table} · ${roundDef.thaiLabel}`}
        stepTitle={`ข้อ ${index + 1} จาก ${total}`}
        currentStep={index}
        totalSteps={total}
        onClose={() => router.push('/timetable')}
      />
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 pb-32 pt-6 sm:px-6">
        <MultipleChoiceTextQuestion
          key={current.id}
          question={current}
          onAnswered={handleAnswered}
          disabled={feedback !== null}
          resetSignal={resetSignal}
        />
      </div>

      {/* Bottom bar: feedback icon + next button. */}
      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0a0a0a]/85 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <span className="text-sm text-white/55">
            ถูก {correctCount}/{QUESTIONS_PER_ROUND}
          </span>
          {feedback && (
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                feedback.correct
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
              role="status"
              aria-label={feedback.correct ? 'ถูกต้อง' : 'ยังไม่ใช่'}
            >
              {feedback.correct ? (
                <Check className="h-6 w-6" strokeWidth={3} />
              ) : (
                <X className="h-6 w-6" strokeWidth={3} />
              )}
            </span>
          )}
          <button
            onClick={handleAdvance}
            disabled={!feedback}
            className="learn-accent-pill flex h-12 items-center gap-1 rounded-2xl px-6 text-base font-bold shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {isLastQuestion ? 'ดูผล' : 'ข้อถัดไป'}
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
