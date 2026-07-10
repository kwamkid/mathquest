// app/(game)/learn/[familyKey]/[gradeKey]/topic/[topicSlug]/chapter/[subTopicSlug]/page.tsx
//
// Chapter detail for /learn (school curricula like BNC). Resolves the
// family/grade/topic/sub-topic from URL params and hands them to the
// shared <ChapterPage> template. Layout + progress logic lives there so
// /learn and /life-math chapters render identically.

'use client';

import { useParams } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import ChapterPage from '@/components/curriculum/ChapterPage';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getFamilyGrade } from '@/lib/curricula/families';
import { getCurriculum } from '@/lib/curricula';
import { localizeTitle, useLanguage } from '@/lib/i18n/LanguageContext';

const STR = {
  th: { lessonNotFound: 'ไม่พบบทเรียนนี้' },
  en: { lessonNotFound: 'Lesson not found' },
} as const;

export default function SubTopicPage() {
  const params = useParams();
  const { user } = useAuth();
  const { lang } = useLanguage();
  const L = STR[lang];
  const familyKey = String(params.familyKey);
  const gradeKey = String(params.gradeKey);
  const topicSlug = String(params.topicSlug);
  const subTopicSlug = String(params.subTopicSlug);

  const resolved = getFamilyGrade(familyKey, gradeKey);
  const curriculum = resolved?.grade.curriculumId
    ? getCurriculum(resolved.grade.curriculumId)
    : null;
  const topic = curriculum?.topics.find((t) => t.slug === topicSlug);
  const subTopic = topic?.subTopics.find((s) => s.slug === subTopicSlug);

  if (!resolved || !curriculum || !topic || !subTopic) {
    return (
      <AuthGuard>
        <div className="learn-bg flex min-h-screen items-center justify-center p-6">
          <p className="text-lg font-semibold text-white">{L.lessonNotFound}</p>
        </div>
      </AuthGuard>
    );
  }

  const { family, grade } = resolved;
  const famName = lang === 'en' ? family.name : family.thaiName ?? family.name;
  const progress = user?.curriculumProgress?.[curriculum.id];
  const hideGrade = !!family.skipGradePicker;
  const collapseTopic = topic.subTopics.length === 1;
  const chapterUrl = `/learn/${family.key}/${grade.key}/topic/${topic.slug}/chapter/${subTopic.slug}`;

  // Eyebrow stays for school curricula where the grade is meaningful
  // (e.g. "Year 3 · เศษส่วน"). For collapsed-topic or skip-grade cases the
  // breadcrumb above already conveys the same info.
  const eyebrow =
    collapseTopic || hideGrade
      ? undefined
      : `${grade.label} · ${localizeTitle(lang, topic)}`;

  return (
    <AuthGuard>
      <ChapterPage
        user={user}
        topic={topic}
        subTopic={subTopic}
        progress={progress}
        chapterUrl={chapterUrl}
        breadcrumb={[
          {
            label: famName,
            href: `/learn/${family.key}/${grade.key}`,
          },
          ...(hideGrade
            ? []
            : [
                {
                  label: grade.label,
                  href: `/learn/${family.key}/${grade.key}`,
                },
              ]),
          ...(collapseTopic
            ? []
            : [
                {
                  label: localizeTitle(lang, topic),
                  href: `/learn/${family.key}/${grade.key}/topic/${topic.slug}`,
                },
              ]),
          {
            label: collapseTopic
              ? localizeTitle(lang, topic)
              : localizeTitle(lang, subTopic),
          },
        ]}
        eyebrow={eyebrow}
        collapseTopicTitle={collapseTopic}
      />
    </AuthGuard>
  );
}
