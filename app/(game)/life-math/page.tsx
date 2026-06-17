// app/(game)/life-math/page.tsx
//
// Life Math landing — top-level route (not nested under /learn) so the
// home page can advertise it as its own product alongside Learn / Play.
// Shows the topic grid for the life-math-beginner curriculum.

'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import TopicListPage from '@/components/curriculum/TopicListPage';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getCurriculum } from '@/lib/curricula';

const CURRICULUM_ID = 'life-math-beginner';

export default function LifeMathHomePage() {
  const { user } = useAuth();
  const curriculum = getCurriculum(CURRICULUM_ID);

  if (!curriculum) {
    return (
      <AuthGuard>
        <div className="learn-bg flex min-h-screen items-center justify-center p-6">
          <p className="text-lg font-semibold text-white">ยังไม่พร้อมใช้งาน</p>
        </div>
      </AuthGuard>
    );
  }

  const progress = user?.curriculumProgress?.[curriculum.id];

  return (
    <AuthGuard>
      <TopicListPage
        user={user}
        curriculum={curriculum}
        progress={progress}
        title="Life Math · ทักษะคำนวณในชีวิตประจำวัน"
        description="คณิตศาสตร์ที่ใช้ในชีวิตจริง — เปอร์เซ็นต์ บัญญัติไตรยางศ์ ลดราคา ของคุ้มราคา"
        titleIcon="💡"
        buildTopicHref={(topic) => {
          // Skip the chapter picker when a topic has one chapter (the Life
          // Math case today) so users land on the lesson list directly.
          const onlyChapter =
            topic.subTopics.length === 1 ? topic.subTopics[0] : null;
          return onlyChapter
            ? `/life-math/${topic.slug}/${onlyChapter.slug}`
            : `/life-math/${topic.slug}`;
        }}
      />
    </AuthGuard>
  );
}
