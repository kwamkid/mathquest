// components/avatar/tabs/AvatarCustomizationTab.tsx
'use client';

import { motion } from 'framer-motion';
import { UserAvatarData } from '@/types/avatar';
import AvatarPreview from '../AvatarPreview';
import { basicAvatars } from '@/lib/data/avatars';

interface AvatarCustomizationTabProps {
  avatarData: UserAvatarData;
  premiumAvatars: any[];
  accessories: any[];
  userExp: number;
  onAvatarChange: (avatarId: string, type: 'basic' | 'premium') => void;
  onAccessoryChange: (type: string, accessoryId: string | null) => void;
}

export default function AvatarCustomizationTab({
  avatarData,
  premiumAvatars,
  accessories,
  userExp,
  onAvatarChange,
  onAccessoryChange
}: AvatarCustomizationTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <AvatarPreview
        currentAvatarData={avatarData}
        onAvatarChange={onAvatarChange}
        onAccessoryChange={onAccessoryChange}
        availableAvatars={{
          basic: basicAvatars,
          premium: premiumAvatars
        }}
        availableAccessories={accessories}
        userExp={userExp}
      />
    </motion.div>
  );
}