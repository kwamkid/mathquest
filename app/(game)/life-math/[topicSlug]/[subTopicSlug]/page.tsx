// app/(game)/life-math/[topicSlug]/[subTopicSlug]/page.tsx
//
// Life Math chapter detail. Resolves topic + sub-topic from URL params and
// hands them to the shared <ChapterPage> template; layout / progress logic
// lives there.

'use client';

import { useParams } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import ChapterPage from '@/components/curriculum/ChapterPage';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getCurriculum } from '@/lib/curricula';

const CURRICULUM_ID = 'life-math-beginner';

export default function LifeMathChapterPage() {
  const params = useParams();
  const { user } = useAuth();
  const topicSlug = String(params.topicSlug);
  const subTopicSlug = String(params.subTopicSlug);

  const curriculum = getCurriculum(CURRICULUM_ID);
  const topic = curriculum?.topics.find((t) => t.slug === topicSlug);
  const subTopic = topic?.subTopics.find((s) => s.slug === subTopicSlug);

  if (!curriculum || !topic || !subTopic) {
    return (
      <AuthGuard>
        <div className="learn-bg flex min-h-screen items-center justify-center p-6">
          <p className="text-lg font-semibold text-white">ไม่พบบทเรียนนี้</p>
        </div>
      </AuthGuard>
    );
  }

  const progress = user?.curriculumProgress?.[curriculum.id];
  const collapseTopic = topic.subTopics.length === 1;

  return (
    <AuthGuard>
      <ChapterPage
        user={user}
        topic={topic}
        subTopic={subTopic}
        progress={progress}
        chapterUrl={`/life-math/${topic.slug}/${subTopic.slug}`}
        breadcrumb={[
          { label: 'Life Math', href: '/life-math' },
          // When the topic has just one chapter, the topic name and chapter
          // name read as the same thing — collapse to one breadcrumb entry.
          ...(collapseTopic
            ? []
            : [
                {
                  label: topic.thaiTitle ?? topic.title,
                  href: `/life-math/${topic.slug}`,
                },
              ]),
          {
            label: collapseTopic
              ? topic.thaiTitle ?? topic.title
              : subTopic.thaiTitle ?? subTopic.title,
          },
        ]}
        collapseTopicTitle={collapseTopic}
      />
    </AuthGuard>
  );
}
