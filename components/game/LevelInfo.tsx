// components/game/LevelInfo.tsx
'use client';

import { motion } from 'framer-motion';
import { getLevelConfig } from '@/lib/game/config';
import { Info, Target, BookOpen } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Lang } from '@/lib/i18n/strings';

interface LevelInfoProps {
  grade: string;
  level: number;
}

export default function LevelInfo({ grade, level }: LevelInfoProps) {
  const { lang } = useLanguage();
  const config = getLevelConfig(grade, level);

  if (!config) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-dark rounded-xl p-4 mb-4 border border-metaverse-purple/20"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-metaverse-purple/20 rounded-lg">
          <Info className="w-5 h-5 text-metaverse-purple" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Level {config.minLevel}-{config.maxLevel}
          </h4>
          <p className="text-white/70 text-sm">{config.description}</p>
          
          {config.features && config.features.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-metaverse-pink" />
              <div className="flex flex-wrap gap-1">
                {config.features.map((feature, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-metaverse-purple/10 text-metaverse-pink rounded-full"
                  >
                    {getFeatureLabel(feature, lang)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// แปลง feature เป็นภาษาไทย / English label
const FEATURE_LABELS: Record<Lang, Record<string, string>> = {
  th: {
    'countingObjects': 'นับจำนวน',
    'visualAids': 'รูปภาพประกอบ',
    'noCarrying': 'ไม่มีการทด',
    'carrying': 'มีการทด',
    'borrowing': 'มีการยืม',
    'multiplicationTables': 'สูตรคูณ',
    'tables_2_5_10': 'แม่ 2, 5, 10',
    'tables_3_4': 'แม่ 3, 4',
    'tables_2_to_5': 'แม่ 2-5',
    'tables_6_to_9': 'แม่ 6-9',
    'basicDivision': 'หารพื้นฐาน',
    'simpleWordProblems': 'โจทย์ปัญหาง่าย',
    'parentheses': 'มีวงเล็บ',
    'orderOfOperations': 'ลำดับการคำนวณ',
    'fractions': 'เศษส่วน',
    'simpleFractions': 'เศษส่วนง่าย',
    'decimals': 'ทศนิยม',
    'basicDecimals': 'ทศนิยมพื้นฐาน',
    'percentages': 'ร้อยละ',
    'basicPercentages': 'ร้อยละพื้นฐาน',
    'multiStepProblems': 'โจทย์หลายขั้นตอน',
    'realWorldProblems': 'โจทย์ในชีวิตจริง',
    'integers': 'จำนวนเต็ม',
    'negativeNumbers': 'จำนวนลบ',
    'exponents': 'เลขยกกำลัง',
    'algebra': 'พีชคณิต',
    'linearEquations': 'สมการเชิงเส้น',
    'ratios': 'อัตราส่วน',
    'proportions': 'สัดส่วน',
  },
  en: {
    'countingObjects': 'Counting',
    'visualAids': 'Picture aids',
    'noCarrying': 'No carrying',
    'carrying': 'Carrying',
    'borrowing': 'Borrowing',
    'multiplicationTables': 'Times tables',
    'tables_2_5_10': 'Tables 2, 5, 10',
    'tables_3_4': 'Tables 3, 4',
    'tables_2_to_5': 'Tables 2-5',
    'tables_6_to_9': 'Tables 6-9',
    'basicDivision': 'Basic division',
    'simpleWordProblems': 'Simple word problems',
    'parentheses': 'Parentheses',
    'orderOfOperations': 'Order of operations',
    'fractions': 'Fractions',
    'simpleFractions': 'Simple fractions',
    'decimals': 'Decimals',
    'basicDecimals': 'Basic decimals',
    'percentages': 'Percentages',
    'basicPercentages': 'Basic percentages',
    'multiStepProblems': 'Multi-step problems',
    'realWorldProblems': 'Real-world problems',
    'integers': 'Integers',
    'negativeNumbers': 'Negative numbers',
    'exponents': 'Exponents',
    'algebra': 'Algebra',
    'linearEquations': 'Linear equations',
    'ratios': 'Ratios',
    'proportions': 'Proportions',
  },
};

function getFeatureLabel(feature: string, lang: Lang): string {
  return FEATURE_LABELS[lang][feature] || feature;
}