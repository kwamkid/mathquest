// components/avatar/tabs/BadgesTab.tsx
'use client';

import { motion } from 'framer-motion';
import { Award, Shield } from 'lucide-react';
import { Badge } from '@/types/avatar';

interface BadgesTabProps {
  badges: Badge[];
}

export default function BadgesTab({ badges }: BadgesTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="glass-dark rounded-xl p-4 border border-metaverse-purple/30"
    >
      <h3 className="text-lg font-bold text-white mb-4">Achievement Badges</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {badges.map(badge => (
          <motion.div
            key={badge.id}
            className="glass rounded-lg p-3 border border-metaverse-purple/30 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-12 h-12 mx-auto mb-2 bg-metaverse-purple/20 rounded-full flex items-center justify-center">
              {badge.imageUrl ? (
                <img 
                  src={badge.imageUrl} 
                  alt={badge.name}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <Shield className="w-6 h-6 text-metaverse-purple" />
              )}
            </div>
            <h4 className="font-bold text-white mb-0.5 text-sm">{badge.name}</h4>
            <p className="text-xs text-white/60">{badge.description}</p>
          </motion.div>
        ))}
      </div>
      
      {badges.length === 0 && (
        <div className="text-center py-8">
          <Award className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40">ยังไม่มี Badge</p>
          <p className="text-xs text-white/30 mt-1">ทำภารกิจต่างๆ เพื่อรับ Badge!</p>
        </div>
      )}
    </motion.div>
  );
}