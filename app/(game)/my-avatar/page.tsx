// app/(game)/my-avatar/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getUserInventory } from '@/lib/firebase/rewards';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { 
  UserAvatarData, 
  PremiumAvatar, 
  AvatarAccessory,
  TitleBadge,
  Badge,
  AccessoryType
} from '@/types/avatar';
import AvatarPreview from '@/components/avatar/AvatarPreview';
import AvatarDisplay from '@/components/avatar/AvatarDisplay';
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Crown,
  Award,
  Shield,
  Star,
  Check,
  RefreshCw,
  Palette,
  X
} from 'lucide-react';
import { basicAvatars } from '@/lib/data/avatars';

export default function MyAvatarPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'avatar' | 'title' | 'badges'>('avatar');
  
  // Avatar data
  const [currentAvatarData, setCurrentAvatarData] = useState<UserAvatarData | null>(null);
  const [tempAvatarData, setTempAvatarData] = useState<UserAvatarData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Inventory
  const [premiumAvatars, setPremiumAvatars] = useState<PremiumAvatar[]>([]);
  const [accessories, setAccessories] = useState<AvatarAccessory[]>([]);
  const [titleBadges, setTitleBadges] = useState<TitleBadge[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  
  // Title selection
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  
  // Dialog states
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadUserAvatarData();
    }
  }, [user]);

  const loadUserAvatarData = async () => {
    if (!user) return;

    try {
      setSelectedTitle(user.currentTitleBadge || null);
      
      // Initialize avatar data if not exists
      if (!user.avatarData) {
        const defaultAvatarData: UserAvatarData = {
          currentAvatar: {
            type: 'basic',
            id: user.avatar || 'knight',
            accessories: {
              hat: undefined,
              glasses: undefined,
              mask: undefined,
              earring: undefined,
              necklace: undefined,
              background: undefined
            }
          },
          unlockedPremiumAvatars: [],
          unlockedAccessories: []
        };
        setCurrentAvatarData(defaultAvatarData);
        setTempAvatarData(defaultAvatarData);
      } else {
        setCurrentAvatarData(user.avatarData);
        setTempAvatarData(JSON.parse(JSON.stringify(user.avatarData)));
      }
      
      // Load inventory
      const inventory = await getUserInventory(user.id);
      if (inventory) {
        // In real app, load actual items from rewards collection
        // For now, mock data
        loadMockInventoryItems(inventory);
      }
    } catch (error) {
      console.error('Error loading avatar data:', error);
    }
  };

  // Mock function - in real app, load from Firestore
  const loadMockInventoryItems = (inventory: any) => {
    // Mock premium avatars
    const mockPremiumAvatars: PremiumAvatar[] = inventory.avatars.map((id: string) => ({
      id,
      name: `Premium ${id}`,
      svgUrl: `/avatars/premium/${id}.svg`,
      price: 500,
      rarity: 'rare' as const,
      category: 'special' as const
    }));
    setPremiumAvatars(mockPremiumAvatars);
    
    // Mock accessories
    const mockAccessories: AvatarAccessory[] = inventory.accessories.map((id: string) => ({
      id,
      name: `Accessory ${id}`,
      type: AccessoryType.HAT,
      svgUrl: `/accessories/hats/${id}.svg`,
      price: 300,
      rarity: 'common' as const
    }));
    setAccessories(mockAccessories);
    
    // Mock title badges
    const mockTitles: TitleBadge[] = inventory.titleBadges.map((id: string) => ({
      id,
      name: getTitleName(id),
      description: `ได้รับจากความสำเร็จ`,
      rarity: 'epic' as const,
      color: getTitleColor(id)
    }));
    setTitleBadges(mockTitles);
  };

  // Helper functions
  const getTitleName = (id: string): string => {
    const titles: Record<string, string> = {
      'math-master': 'เซียนเลข',
      'speed-demon': 'เร็วสายฟ้า',
      'perfect-scorer': 'นักแม่นยำ',
      'dedication-hero': 'ผู้มุ่งมั่น'
    };
    return titles[id] || id;
  };

  const getTitleColor = (rarity: string): string => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9333EA';
      case 'rare': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getRarityStars = (rarity: string): number => {
    switch (rarity) {
      case 'common': return 1;
      case 'rare': return 2;
      case 'epic': return 3;
      case 'legendary': return 4;
      default: return 1;
    }
  };

  // Handle avatar changes
  const handleAvatarChange = (avatarId: string, type: 'basic' | 'premium') => {
    if (!tempAvatarData) return;
    
    const newData = {
      ...tempAvatarData,
      currentAvatar: {
        ...tempAvatarData.currentAvatar,
        type,
        id: avatarId,
        // Reset accessories when changing avatar type
        accessories: type !== tempAvatarData.currentAvatar.type 
          ? {
              hat: undefined,
              glasses: undefined,
              mask: undefined,
              earring: undefined,
              necklace: undefined,
              background: undefined
            }
          : tempAvatarData.currentAvatar.accessories
      }
    };
    
    setTempAvatarData(newData);
    setHasChanges(true);
  };

  const handleAccessoryChange = (type: string, accessoryId: string | null) => {
    if (!tempAvatarData) return;
    
    const newData = {
      ...tempAvatarData,
      currentAvatar: {
        ...tempAvatarData.currentAvatar,
        accessories: {
          ...tempAvatarData.currentAvatar.accessories,
          [type]: accessoryId || undefined
        }
      }
    };
    
    setTempAvatarData(newData);
    setHasChanges(true);
  };

  // Save changes
  const handleSave = async () => {
    if (!user || !tempAvatarData) return;
    
    setSaving(true);
    try {
      // Clean up undefined values in accessories
      const cleanedAccessories: any = {};
      Object.entries(tempAvatarData.currentAvatar.accessories).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          cleanedAccessories[key] = value;
        }
      });
      
      // Create cleaned avatar data
      const cleanedAvatarData = {
        ...tempAvatarData,
        currentAvatar: {
          ...tempAvatarData.currentAvatar,
          accessories: cleanedAccessories
        }
      };
      
      // Update user document
      const updates: any = {
        avatarData: cleanedAvatarData,
        avatar: tempAvatarData.currentAvatar.id, // Keep backward compatibility
      };
      
      if (selectedTitle !== user.currentTitleBadge) {
        updates.currentTitleBadge = selectedTitle || null;
      }
      
      await updateDoc(doc(db, 'users', user.id), updates);
      
      // Refresh user data in context
      await refreshUser();
      
      setCurrentAvatarData(cleanedAvatarData);
      setHasChanges(false);
      
      // Show success dialog
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error saving:', error);
      setErrorMessage('เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง');
      setShowErrorDialog(true);
    } finally {
      setSaving(false);
    }
  };

  // Reset changes
  const handleReset = () => {
    if (!currentAvatarData) return;
    setTempAvatarData(JSON.parse(JSON.stringify(currentAvatarData)));
    setSelectedTitle(user?.currentTitleBadge || null);
    setHasChanges(false);
  };

  if (!user || !tempAvatarData) return null;

  return (
    <div className="min-h-screen max-h-screen bg-metaverse-black flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-4 max-w-6xl mx-auto w-full">
        {/* Header - Compact */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/play')}
                className="p-2 glass rounded-full hover:bg-white/10 transition"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-metaverse-purple" />
                  My Avatar
                </h1>
                <p className="text-white/60 text-xs md:text-sm">จัดการตัวละครและเครื่องประดับ</p>
              </div>
            </div>
            
            {/* Save/Reset Buttons - Compact */}
            <div className="h-10 flex items-center">
              <AnimatePresence>
                {hasChanges && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-2"
                  >
                    <motion.button
                      onClick={handleReset}
                      className="px-3 py-1.5 glass rounded-lg text-white font-medium hover:bg-white/10 transition flex items-center gap-1 text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span className="hidden sm:inline">ยกเลิก</span>
                    </motion.button>
                    <motion.button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-1.5 metaverse-button text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition disabled:opacity-50 flex items-center gap-1 text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {saving ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="text-base"
                          >
                            ⏳
                          </motion.span>
                          <span className="hidden sm:inline">กำลังบันทึก...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span className="hidden sm:inline">บันทึก</span>
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation - Compact */}
        <div className="glass-dark rounded-xl p-1 mb-3 border border-metaverse-purple/30">
          <div className="flex">
            <button
              onClick={() => setActiveTab('avatar')}
              className={`flex-1 px-3 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1 text-sm ${
                activeTab === 'avatar'
                  ? 'metaverse-button text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Avatar & Accessories</span>
              <span className="sm:hidden">Avatar</span>
            </button>
            <button
              onClick={() => setActiveTab('title')}
              className={`flex-1 px-3 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1 text-sm ${
                activeTab === 'title'
                  ? 'metaverse-button text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">Title Badges</span>
              <span className="sm:hidden">Title</span>
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`flex-1 px-3 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1 text-sm ${
                activeTab === 'badges'
                  ? 'metaverse-button text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              Badges
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'avatar' && (
              <motion.div
                key="avatar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <AvatarPreview
                  currentAvatarData={tempAvatarData}
                  onAvatarChange={handleAvatarChange}
                  onAccessoryChange={handleAccessoryChange}
                  availableAvatars={{
                    basic: basicAvatars,
                    premium: premiumAvatars
                  }}
                  availableAccessories={accessories}
                  userExp={user?.experience || 0}
                />
              </motion.div>
            )}
            
            {activeTab === 'title' && (
              <motion.div
                key="title"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full glass-dark rounded-2xl p-4 md:p-6 border border-metaverse-purple/30 overflow-y-auto"
              >
                <h3 className="text-lg md:text-xl font-bold text-white mb-4">Title Badges</h3>
                
                {/* Current Title */}
                <div className="mb-4">
                  <p className="text-white/60 mb-2 text-sm">ฉายาปัจจุบัน:</p>
                  <div className="glass rounded-lg p-3 border border-metaverse-purple/30">
                    {selectedTitle ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Crown className="w-5 h-5 text-yellow-400" />
                          <span 
                            className="text-base md:text-lg font-bold"
                            style={{ color: getTitleColor('epic') }}
                          >
                            {getTitleName(selectedTitle)}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedTitle(null);
                            setHasChanges(true);
                          }}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          ถอดฉายา
                        </button>
                      </div>
                    ) : (
                      <p className="text-white/40 text-center text-sm">ไม่ได้ใส่ฉายา</p>
                    )}
                  </div>
                </div>
                
                {/* Available Titles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {titleBadges.map(title => (
                    <motion.button
                      key={title.id}
                      onClick={() => {
                        setSelectedTitle(title.id);
                        setHasChanges(true);
                      }}
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
                    <p className="text-white/40">ยังไม่มี Title Badge</p>
                    <p className="text-xs text-white/30 mt-1">เล่นเกมเพื่อปลดล็อค Title Badge พิเศษ!</p>
                  </div>
                )}
              </motion.div>
            )}
            
            {activeTab === 'badges' && (
              <motion.div
                key="badges"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full glass-dark rounded-2xl p-4 md:p-6 border border-metaverse-purple/30 overflow-y-auto"
              >
                <h3 className="text-lg md:text-xl font-bold text-white mb-4">Achievement Badges</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {badges.map(badge => (
                    <motion.div
                      key={badge.id}
                      className="glass rounded-lg p-3 border border-metaverse-purple/30 text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="w-12 h-12 mx-auto mb-2 bg-metaverse-purple/20 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-metaverse-purple" />
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
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Success Dialog - Compact */}
      <AnimatePresence>
        {showSuccessDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowSuccessDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-dark rounded-2xl p-6 max-w-sm w-full border border-metaverse-purple/30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <Check className="w-8 h-8 text-green-400" />
              </motion.div>
              
              <h3 className="text-xl font-bold text-white text-center mb-1">
                บันทึกสำเร็จ!
              </h3>
              
              <p className="text-white/60 text-center mb-4 text-sm">
                การเปลี่ยนแปลงของคุณถูกบันทึกเรียบร้อยแล้ว
              </p>
              
              <motion.button
                onClick={() => setShowSuccessDialog(false)}
                className="w-full py-2.5 metaverse-button text-white font-bold rounded-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ตกลง
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Error Dialog - Compact */}
      <AnimatePresence>
        {showErrorDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowErrorDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-dark rounded-2xl p-6 max-w-sm w-full border border-metaverse-purple/30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Error Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <X className="w-8 h-8 text-red-400" />
              </motion.div>
              
              <h3 className="text-xl font-bold text-white text-center mb-1">
                เกิดข้อผิดพลาด
              </h3>
              
              <p className="text-white/60 text-center mb-4 text-sm">
                {errorMessage}
              </p>
              
              <motion.button
                onClick={() => setShowErrorDialog(false)}
                className="w-full py-2.5 glass border border-red-500/50 text-red-400 font-bold rounded-lg hover:bg-red-500/10 transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ปิด
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}