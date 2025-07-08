// app/(game)/my-avatar/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getUserInventory } from '@/lib/firebase/rewards';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
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
      console.log('Loading user avatar data...');
      setSelectedTitle(user.currentTitleBadge || null);
      
      // Get fresh user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.id));
      const freshUserData = userDoc.data();
      console.log('Fresh user data:', freshUserData);
      
      // Initialize or use existing avatar data
      let avatarData: UserAvatarData;
      if (!freshUserData?.avatarData) {
        avatarData = {
          currentAvatar: {
            type: 'basic',
            id: freshUserData?.avatar || 'knight',
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
      } else {
        avatarData = freshUserData.avatarData;
      }
      
      console.log('Avatar data:', avatarData);
      
      // Load inventory from Firebase
      const inventory = await getUserInventory(user.id);
      console.log('User inventory:', inventory);
      
      if (inventory) {
        // Update avatarData with inventory data
        if (inventory.avatars.length > 0) {
          avatarData.unlockedPremiumAvatars = [...new Set([...avatarData.unlockedPremiumAvatars, ...inventory.avatars])];
        }
        if (inventory.accessories.length > 0) {
          avatarData.unlockedAccessories = [...new Set([...avatarData.unlockedAccessories, ...inventory.accessories])];
        }
        
        // Load premium avatars from inventory
        const loadedPremiumAvatars: PremiumAvatar[] = avatarData.unlockedPremiumAvatars.map(avatarId => ({
          id: avatarId,
          name: getPremiumAvatarName(avatarId),
          svgUrl: `/avatars/premium/${avatarId}.svg`,
          price: 0, // Already owned
          rarity: getPremiumAvatarRarity(avatarId),
          category: 'special' as const
        }));
        setPremiumAvatars(loadedPremiumAvatars);
        console.log('Loaded premium avatars:', loadedPremiumAvatars);
        
        // Load accessories from inventory
        const loadedAccessories: AvatarAccessory[] = avatarData.unlockedAccessories.map(accessoryId => {
          const type = getAccessoryType(accessoryId);
          return {
            id: accessoryId,
            name: getAccessoryName(accessoryId),
            type: type,
            svgUrl: `/accessories/${type}s/${accessoryId}.svg`,
            price: 0, // Already owned
            rarity: getAccessoryRarity(accessoryId)
          };
        });
        setAccessories(loadedAccessories);
        console.log('Loaded accessories:', loadedAccessories);
        
        // Load title badges from inventory
        const loadedTitles: TitleBadge[] = inventory.titleBadges.map(titleId => ({
          id: titleId,
          name: getTitleName(titleId),
          description: `ได้รับจากการแลกรางวัล`,
          rarity: getTitleRarity(titleId),
          color: getTitleColor(titleId)
        }));
        setTitleBadges(loadedTitles);
        
        // Sync avatarData back to user if needed
        if (freshUserData?.avatarData?.unlockedPremiumAvatars?.length !== avatarData.unlockedPremiumAvatars.length ||
            freshUserData?.avatarData?.unlockedAccessories?.length !== avatarData.unlockedAccessories.length) {
          console.log('Syncing avatar data back to user...');
          await updateDoc(doc(db, 'users', user.id), {
            avatarData: avatarData
          });
        }
      }
      
      setCurrentAvatarData(avatarData);
      setTempAvatarData(JSON.parse(JSON.stringify(avatarData)));
    } catch (error) {
      console.error('Error loading avatar data:', error);
    }
  };

  // Helper functions for names and properties
  const getPremiumAvatarName = (id: string): string => {
    const names: Record<string, string> = {
      'cyber_warrior': 'Cyber Warrior',
      'dragon_knight': 'Dragon Knight',
      'space_explorer': 'Space Explorer',
      'mystic_mage': 'Mystic Mage',
      'shadow_ninja': 'Shadow Ninja',
      'phoenix_guardian': 'Phoenix Guardian',
      'dragon_sodiac': 'Dragon Sodiac',
      'cute_dragon': 'Cute Dragon',
      // Map reward IDs to names
      'xUE45PptWWAN6JjQqfzp': 'หนังสือ เกมเศรษฐี', // This is physical, not avatar
    };
    // If it's a Firestore ID, try to extract name from ID or use as-is
    if (id.length > 20) { // Likely a Firestore auto-generated ID
      return 'Custom Avatar';
    }
    return names[id] || id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPremiumAvatarRarity = (id: string): 'common' | 'rare' | 'epic' | 'legendary' => {
    const rarities: Record<string, 'common' | 'rare' | 'epic' | 'legendary'> = {
      'cyber_warrior': 'rare',
      'dragon_knight': 'epic',
      'space_explorer': 'rare',
      'mystic_mage': 'epic',
      'shadow_ninja': 'legendary',
      'phoenix_guardian': 'legendary'
    };
    return rarities[id] || 'rare';
  };

  const getAccessoryType = (id: string): AccessoryType => {
    // Determine type from ID pattern
    if (id.includes('hat') || id.includes('crown') || id.includes('cap')) return AccessoryType.HAT;
    if (id.includes('glass') || id.includes('sunglass')) return AccessoryType.GLASSES;
    if (id.includes('mask')) return AccessoryType.MASK;
    if (id.includes('earring')) return AccessoryType.EARRING;
    if (id.includes('necklace') || id.includes('chain')) return AccessoryType.NECKLACE;
    if (id.includes('background') || id.includes('bg')) return AccessoryType.BACKGROUND;
    
    // Default to hat if can't determine
    return AccessoryType.HAT;
  };

  const getAccessoryName = (id: string): string => {
    const names: Record<string, string> = {
      'hat_crown': 'Golden Crown',
      'hat_wizard': 'Wizard Hat',
      'glasses_cool': 'Cool Sunglasses',
      'glasses_smart': 'Smart Glasses',
      'mask_hero': 'Hero Mask',
      'necklace_gold': 'Gold Chain'
    };
    return names[id] || id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getAccessoryRarity = (id: string): 'common' | 'rare' | 'epic' | 'legendary' => {
    if (id.includes('gold') || id.includes('crown')) return 'epic';
    if (id.includes('hero') || id.includes('wizard')) return 'rare';
    return 'common';
  };

  const getTitleName = (id: string): string => {
    const titles: Record<string, string> = {
      'math-master': 'เซียนเลข',
      'speed-demon': 'เร็วสายฟ้า',
      'perfect-scorer': 'นักแม่นยำ',
      'dedication-hero': 'ผู้มุ่งมั่น',
      'legend': 'ตำนาน',
      'champion': 'แชมป์'
    };
    return titles[id] || id;
  };

  const getTitleRarity = (id: string): 'common' | 'rare' | 'epic' | 'legendary' => {
    if (id === 'legend' || id === 'champion') return 'legendary';
    if (id === 'math-master' || id === 'perfect-scorer') return 'epic';
    return 'rare';
  };

  const getTitleColor = (id: string): string => {
    const colors: Record<string, string> = {
      'legend': '#FFD700',
      'champion': '#FF6B6B',
      'math-master': '#9333EA',
      'speed-demon': '#3B82F6',
      'perfect-scorer': '#10B981',
      'dedication-hero': '#F59E0B'
    };
    return colors[id] || '#6B7280';
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

  // Add refresh button handler
  const handleRefreshInventory = async () => {
    await loadUserAvatarData();
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
            <div className="h-10 flex items-center gap-2">
              {/* Refresh Button */}
              <motion.button
                onClick={handleRefreshInventory}
                className="p-2 glass rounded-lg hover:bg-white/10 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw className="w-4 h-4 text-white/70" />
              </motion.button>
              
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

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-white/50 mb-2">
            Premium Avatars: {premiumAvatars.length} | 
            Accessories: {accessories.length} | 
            Unlocked: {tempAvatarData.unlockedPremiumAvatars.length}
          </div>
        )}

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
                            style={{ color: getTitleColor(selectedTitle) }}
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