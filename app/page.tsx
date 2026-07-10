'use client';

// Home page. Logged-in users get a compact "mission control": avatar + two
// labeled mode groups — เรียน (School Learn / Life Math) and ฝึก (Play Quiz /
// Timetable / Typing-soon) — so the growing list of modes stays organised by
// intent instead of one flat grid. Visitors get the marketing hero.

import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Swords,
  Target,
  Trophy,
  Gift,
  Pi,
  UserPlus,
  BookOpen,
  Gamepad2,
  Lightbulb,
  LogOut,
  Grid3x3,
  Keyboard,
} from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { signOut } from '@/lib/firebase/auth';
import EnhancedAvatarDisplay from '@/components/avatar/EnhancedAvatarDisplay';
import LanguageToggle from '@/components/layout/LanguageToggle';

// Math symbols for floating animation
const mathSymbols = ['+', '-', '×', '÷', '=', '>', '<', '√', 'π', '∞', '∑', '∫'];

// Random things the avatar "says" in its speech bubble — rotates on a timer
// and on tap. Thai lines sprinkle English on purpose (vocab exposure); some
// lines greet by name.
const BUBBLE_LINES = {
  th: [
    (n: string) => `สวัสดี ${n}! วันนี้พร้อมลุยมั้ย? 🔥`,
    () => 'ไปเก็บดาวสูตรคูณกันเถอะ ⭐',
    () => 'วันนี้เล่น Mix Challenge หรือยัง?',
    () => 'อีกนิดเดียวก็ Level up แล้วนะ!',
    (n: string) => `${n} เก่งขึ้นทุกวันเลย 💪`,
    () => 'Math is fun! ลองบทเรียนใหม่มั้ย?',
    () => 'ทายซิ… 7 × 8 ได้เท่าไร? 😜',
    () => 'เรียนวันละนิด ฉลาดขึ้นทุกวัน ✨',
    () => 'Let’s go! เลือกโหมดข้างล่างเลย 👇',
    () => 'คิดถึงจัง มาเล่นด้วยกันนะ 🥰',
  ],
  en: [
    (n: string) => `Hi ${n}! Ready to play? 🔥`,
    () => 'Let’s go collect some stars! ⭐',
    () => 'Tried today’s Mix Challenge yet?',
    () => 'You’re so close to a level up!',
    (n: string) => `${n}, you get smarter every day 💪`,
    () => 'Math is fun! Try a new lesson?',
    () => 'Quick — what’s 7 × 8? 😜',
    () => 'A little every day goes a long way ✨',
    () => 'Pick a mode below and let’s go 👇',
    () => 'I missed you! Let’s play 🥰',
  ],
} as const;

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate floating symbols with fixed positions
  const floatingSymbols = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    symbol: mathSymbols[i % mathSymbols.length],
    left: `${(i * 5) % 100}%`,
    delay: i * 0.3,
    duration: 15 + (i % 3) * 5,
  }));

  return (
    <div className="min-h-screen bg-metaverse-black overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-50"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(220, 38, 38, 0.3) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Floating Math Symbols */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingSymbols.map((item) => (
            <motion.div
              key={item.id}
              className="absolute text-metaverse-purple/30 text-4xl md:text-6xl font-bold"
              style={{ left: item.left, textShadow: '0 0 20px rgba(147, 51, 234, 0.5)' }}
              initial={{ y: '120vh' }}
              animate={{ y: '-20vh' }}
              transition={{
                duration: item.duration,
                repeat: Infinity,
                delay: item.delay,
                ease: 'linear',
              }}
            >
              {item.symbol}
            </motion.div>
          ))}
        </div>
      )}

      {/* Language switch — top right, works for visitors too. */}
      <div className="absolute right-4 top-4 z-20">
        <LanguageToggle />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="text-center mb-10"
        >
          {/* Animated Game Icon */}
          <motion.div
            className="inline-block mb-6 text-white"
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.05, 0.95, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Pi className="w-20 h-20 filter drop-shadow-[0_0_30px_rgba(147,51,234,0.5)]" />
          </motion.div>

          {/* Title */}
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 drop-shadow-lg">
            Math
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-red">
              Quest
            </span>
          </h1>
          <p className="text-xl md:text-3xl text-white/80 font-medium">
            {t.home.tagline}
          </p>
        </motion.div>

        {/* Character Preview — the user's own avatar when logged in (big, like
          * the Play page); the emoji line-up stays as marketing for visitors. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-10"
        >
          {user ? (
            <AvatarBuddy
              user={user}
              hello={t.home.hello}
              whatToday={t.home.whatToday}
            />
          ) : (
            <div className="glass-dark rounded-full px-8 py-4 flex items-center gap-4 shadow-xl border border-metaverse-purple/30">
              {['🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', '🦹‍♂️', '🦹‍♀️', '🐉', '🦊'].map((emoji, index) => (
                <motion.span
                  key={index}
                  className="text-4xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Action area */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="space-y-6 mb-16 w-full max-w-2xl"
        >
          {user ? (
            <>
              {/* Group 1 — structured learning. */}
              <section>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/50">
                  {t.home.groupLearn}
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:gap-5">
                  <ModeCard
                    href="/learn"
                    title="School Learn"
                    description={t.home.learnDesc}
                    icon={<BookOpen className="w-8 h-8 sm:w-9 sm:h-9 text-white" />}
                    borderClass="border-metaverse-purple/30"
                    hoverBgClass="from-metaverse-purple/30 to-metaverse-pink/10"
                    iconBgClass="from-metaverse-purple to-metaverse-pink shadow-metaverse-purple/40"
                  />
                  <ModeCard
                    href="/life-math"
                    title="Life Math"
                    description={t.home.lifeMathDesc}
                    icon={<Lightbulb className="w-8 h-8 sm:w-9 sm:h-9 text-white" />}
                    borderClass="border-amber-400/40"
                    hoverBgClass="from-amber-400/30 to-orange-500/10"
                    iconBgClass="from-amber-400 to-orange-500 shadow-amber-500/40"
                  />
                </div>
              </section>

              {/* Group 2 — fast repeatable games. */}
              <section>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/50">
                  {t.home.groupPractice}
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
                  <ModeCard
                    href="/play"
                    title="Play Quiz"
                    description={t.home.playDesc}
                    icon={<Gamepad2 className="w-8 h-8 sm:w-9 sm:h-9 text-white" />}
                    borderClass="border-metaverse-red/30"
                    hoverBgClass="from-metaverse-red/30 to-metaverse-darkRed/10"
                    iconBgClass="from-metaverse-red to-metaverse-darkRed shadow-metaverse-red/40"
                  />
                  <ModeCard
                    href="/timetable"
                    title="Timetable"
                    description={t.home.timetableDesc}
                    icon={<Grid3x3 className="w-8 h-8 sm:w-9 sm:h-9 text-white" />}
                    borderClass="border-emerald-400/40"
                    hoverBgClass="from-emerald-400/30 to-teal-500/10"
                    iconBgClass="from-emerald-400 to-teal-500 shadow-emerald-500/40"
                  />
                  <ModeCard
                    href="/typing"
                    title="Typing"
                    description={t.home.typingDesc}
                    icon={<Keyboard className="w-8 h-8 sm:w-9 sm:h-9 text-white" />}
                    borderClass="border-cyan-400/40"
                    hoverBgClass="from-cyan-400/30 to-sky-500/10"
                    iconBgClass="from-cyan-500 to-sky-600 shadow-cyan-500/40"
                  />
                </div>
              </section>

              {/* Logout sits below the cards. */}
              <div className="mt-2 flex justify-center">
                <button
                  onClick={handleSignOut}
                  className="glass inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white/70 transition hover:bg-rose-500/20 hover:text-rose-200"
                >
                  <LogOut className="h-4 w-4" />
                  {t.common.logout}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Main Login Button */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="group relative px-12 py-5 metaverse-button text-white font-bold text-xl rounded-full shadow-2xl overflow-hidden transition-all hover:shadow-metaverse-purple/50 inline-block"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Swords className="w-6 h-6" />
                    {t.home.startAdventure}
                  </span>
                </Link>
              </div>

              {/* Register Section */}
              <div className="text-center">
                <p className="text-white/60 mb-2">{t.home.noAccount}</p>
                <Link
                  href="/register"
                  className="px-8 py-3 glass text-white font-medium text-lg rounded-full shadow-xl border border-metaverse-purple/50 hover:bg-white/10 transition-all inline-block"
                >
                  <motion.span
                    className="flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <UserPlus className="w-5 h-5" />
                    {t.home.register}
                  </motion.span>
                </Link>
              </div>
            </>
          )}
        </motion.div>

        {/* Marketing sections — visitors only. A logged-in kid already knows
          * the app; the mode cards above are the whole home page. */}
        {!user && (
        <>
        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-12"
        >
          {[
            {
              icon: <Target className="w-12 h-12" />,
              title: t.home.feat100Title,
              description: t.home.feat100Desc,
              color: 'from-metaverse-purple to-metaverse-pink'
            },
            {
              icon: <Trophy className="w-12 h-12" />,
              title: t.home.featRankTitle,
              description: t.home.featRankDesc,
              color: 'from-metaverse-pink to-metaverse-red'
            },
            {
              icon: <Gift className="w-12 h-12" />,
              title: t.home.featRewardTitle,
              description: t.home.featRewardDesc,
              color: 'from-metaverse-red to-metaverse-darkRed'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity`} />
              <div className="relative glass-dark rounded-3xl p-8 shadow-xl h-full border border-metaverse-purple/20">
                <motion.div
                  className="text-white mb-4"
                  animate={{
                    rotate: mounted ? [0, -5, 5, 0] : 0,
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="glass-dark rounded-full px-6 py-4 sm:px-8 sm:py-6 shadow-xl border border-metaverse-purple/30 w-full max-w-sm sm:max-w-none"
        >
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-white">
            <motion.div
              className="text-center"
              animate={{ scale: mounted ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="text-xl sm:text-3xl font-bold">1,000+</p>
              <p className="text-xs sm:text-sm opacity-70">{t.home.statStudents}</p>
            </motion.div>
            <motion.div
              className="text-center"
              animate={{ scale: mounted ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <p className="text-xl sm:text-3xl font-bold">50K+</p>
              <p className="text-xs sm:text-sm opacity-70">{t.home.statQuestions}</p>
            </motion.div>
            <motion.div
              className="text-center"
              animate={{ scale: mounted ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              <p className="text-xl sm:text-3xl font-bold">4.9⭐</p>
              <p className="text-xs sm:text-sm opacity-70">{t.home.statReviews}</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12 text-white/60 text-center text-lg"
        >
          {t.home.footerNote}
        </motion.p>
        </>
        )}
      </div>
    </div>
  );
}

// The kid's avatar as a living "buddy": gentle idle bob + a speech bubble
// that rotates through random lines (tap the avatar for a new one). Lines are
// bilingual via BUBBLE_LINES; name lines use displayName.
function AvatarBuddy({
  user,
  hello,
  whatToday,
}: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>;
  hello: string;
  whatToday: string;
}) {
  const { lang } = useLanguage();
  const name = user.displayName || user.username;
  const lines = BUBBLE_LINES[lang];

  // Pick lines client-side only (Math.random during SSR would mismatch).
  // `bubbleKey` re-triggers the pop animation even if the same index rolls.
  const [lineIdx, setLineIdx] = useState<number | null>(null);
  const [bubbleKey, setBubbleKey] = useState(0);

  const nextLine = useCallback(() => {
    setLineIdx((cur) => {
      let next = Math.floor(Math.random() * lines.length);
      if (next === cur) next = (next + 1) % lines.length;
      return next;
    });
    setBubbleKey((k) => k + 1);
  }, [lines.length]);

  useEffect(() => {
    nextLine();
    const id = setInterval(nextLine, 7000);
    return () => clearInterval(id);
  }, [nextLine]);

  return (
    <div className="flex flex-col items-center">
      {/* Speech bubble — reserved height so the page doesn't jump. */}
      <div className="mb-3 flex min-h-[3.5rem] items-end justify-center">
        <AnimatePresence mode="wait">
          {lineIdx !== null && (
            <motion.div
              key={bubbleKey}
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="relative max-w-xs rounded-2xl bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-800 shadow-xl shadow-black/30 sm:max-w-sm sm:text-base"
              aria-live="polite"
            >
              {lines[lineIdx](name)}
              {/* Bubble tail */}
              <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Idle bob + tiny sway; tap = squash bounce + new line. */}
      <motion.button
        type="button"
        onClick={nextLine}
        aria-label={whatToday}
        animate={{ y: [0, -7, 0], rotate: [0, 1.6, 0, -1.6, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        whileTap={{ scale: 0.92 }}
        className="group relative cursor-pointer"
      >
        <div className="absolute inset-0 scale-110 rounded-full bg-gradient-to-r from-metaverse-purple/20 to-metaverse-pink/20 blur-xl opacity-0 transition-opacity group-hover:opacity-100" />
        <EnhancedAvatarDisplay
          userId={user.id}
          avatarData={user.avatarData}
          basicAvatar={user.avatar}
          size="xlarge"
          showEffects={true}
          showTitle={true}
          titleBadge={user.currentTitleBadge}
        />
      </motion.button>

      <p className="mt-4 text-lg text-white/80 md:text-xl">
        {hello}{' '}
        <span className="font-bold text-white">{name}</span> 👋
      </p>
      <p className="mt-1 text-base text-white/60 md:text-lg">{whatToday}</p>
    </div>
  );
}

// One mode card. `href` omitted = coming-soon (non-clickable, badged).
function ModeCard({
  href,
  title,
  description,
  icon,
  borderClass,
  hoverBgClass,
  iconBgClass,
  badge,
}: {
  href?: string;
  title: string;
  description: string;
  icon: ReactNode;
  borderClass: string;
  hoverBgClass: string;
  iconBgClass: string;
  badge?: string;
}) {
  const card = (
    <motion.div
      whileHover={href ? { y: -6, scale: 1.02 } : undefined}
      whileTap={href ? { scale: 0.98 } : undefined}
      className={`relative glass-dark rounded-3xl p-5 sm:p-6 shadow-xl border h-full overflow-hidden ${borderClass} ${
        href ? '' : 'opacity-70'
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity ${hoverBgClass}`}
      />
      <div className="relative z-10 flex flex-col items-center text-center">
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br flex items-center justify-center mb-3 shadow-lg ${iconBgClass}`}
        >
          {icon}
        </div>
        <h3 className="text-lg md:text-xl font-bold text-white mb-1.5">{title}</h3>
        <p className="text-white/70 text-xs sm:text-sm">{description}</p>
        {badge && (
          <span className="mt-2 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-white/60">
            {badge}
          </span>
        )}
      </div>
    </motion.div>
  );

  if (!href) return card;
  return (
    <Link href={href} className="group block">
      {card}
    </Link>
  );
}
