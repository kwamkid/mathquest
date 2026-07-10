// components/avatar/tabs/TitleBadgesTab.tsx
'use client';

import { motion } from 'framer-motion';
import { Crown, Star, Check } from 'lucide-react';
import { TitleBadge } from '@/types/avatar';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const STR = {
  th: {
    currentTitle: 'ฉายาปัจจุบัน:',
    removeTitle: 'ถอดฉายา',
    noTitle: 'ไม่ได้ใส่ฉายา',
    ownedTitles: 'Title Badges ที่มี',
    empty: 'ยังไม่มี Title Badge',
    emptyHint: 'แลกรางวัลเพื่อปลดล็อค Title Badge พิเศษ!',
  },
  en: {
    currentTitle: 'Current title:',
    removeTitle: 'Remove title',
    noTitle: 'No title equipped',
    ownedTitles: 'Your Title Badges',
    empty: 'No Title Badges yet',
    emptyHint: 'Redeem rewards to unlock special Title Badges!',
  },
} as const;

interface TitleBadgesTabProps {
  titleBadges: TitleBadge[];
  selectedTitle: string | null;
  onTitleChange: (titleId: string | null) => void;
}

export default function TitleBadgesTab({
  titleBadges,
  selectedTitle,
  onTitleChange
}: TitleBadgesTabProps) {
  const { lang } = useLanguage();
  const L = STR[lang];
  const getRarityStars = (rarity: string): number => {
    switch (rarity) {
      case 'common': return 1;
      case 'rare': return 2;
      case 'epic': return 3;
      case 'legendary': return 4;
      default: return 1;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Current Title */}
      <div className="glass-dark rounded-xl p-4 border border-metaverse-purple/30">
        <p className="text-white/60 mb-2 text-sm">{L.currentTitle}</p>
        <div className="glass rounded-lg p-3 border border-metaverse-purple/30">
          {selectedTitle ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span 
                  className="text-base md:text-lg font-bold"
                  style={{ color: titleBadges.find(t => t.id === selectedTitle)?.color || '#FFD700' }}
                >
                  {titleBadges.find(t => t.id === selectedTitle)?.name}
                </span>
              </div>
              <button
                onClick={() => onTitleChange(null)}
                className="text-red-400 hover:text-red-300 text-xs"
              >
                {L.removeTitle}
              </button>
            </div>
          ) : (
            <p className="text-white/40 text-center text-sm">{L.noTitle}</p>
          )}
        </div>
      </div>
      
      {/* Available Titles */}
      <div className="glass-dark rounded-xl p-4 border border-metaverse-purple/30">
        <h3 className="text-lg font-bold text-white mb-4">{L.ownedTitles}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {titleBadges.map(title => (
            <motion.button
              key={title.id}
              onClick={() => onTitleChange(title.id)}
              className={`glass rounded-lg p-3 border transition-all text-left ${
                selectedTitle === title.id
                  ? 'border-yellow-400/50 bg-yellow-400/10'
                  : 'border-metaverse-purple/30 hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 
                    className="text-base font-bold mb-0.5"
                    style={{ color: title.color || '#FFD700' }}
                  >
                    {title.name}
                  </h4>
                  <p className="text-xs text-white/60">{title.description}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: getRarityStars(title.rarity) }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
                {selectedTitle === title.id && (
                  <Check className="w-4 h-4 text-green-400" />
                )}
              </div>
            </motion.button>
          ))}
        </div>
        
        {titleBadges.length === 0 && (
          <div className="text-center py-8">
            <Crown className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">{L.empty}</p>
            <p className="text-xs text-white/30 mt-1">{L.emptyHint}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}