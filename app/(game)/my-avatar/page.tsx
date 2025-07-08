// app/(game)/my-avatar/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getUserInventory, getReward } from '@/lib/firebase/rewards';
import { updateDoc, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { 
  UserAvatarData, 
  PremiumAvatar, 
  AvatarAccessory,
  TitleBadge,
  Badge,
  AccessoryType
} from '@/types/avatar';

// Import tab components
import AvatarCustomizationTab from '@/components/avatar/tabs/AvatarCustomizationTab';
import TitleBadgesTab from '@/components/avatar/tabs/TitleBadgesTab';
import BadgesTab from '@/components/avatar/tabs/BadgesTab';

// Import item database
import { 
  getPremiumAvatarData, 
  getAccessoryData, 
  getTitleBadgeData 
} from '@/lib/data/items';

import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Crown,
  Award,
  Check,
  RefreshCw,
  Palette,
  X
} from 'lucide-react';

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
      
      let avatarIds: string[] = [];
      let accessoryIds: string[] = [];
      let titleBadgeIds: string[] = [];
      
      if (!inventory) {
        // Try to create inventory from user's redemptions
        console.log('No inventory found, checking redemptions...');
        
        // Get user's successful redemptions
        const redemptionsQuery = query(
          collection(db, 'redemptions'),
          where('userId', '==', user.id),
          where('status', 'in', ['approved', 'delivered', 'received'])
        );
        
        const redemptionsSnapshot = await getDocs(redemptionsQuery);
        const redemptions = redemptionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('Found redemptions:', redemptions);
        
        // Extract avatar and accessory IDs from redemptions
        redemptions.forEach((redemption: any) => {
          if (redemption.rewardType === 'avatar' && redemption.itemId) {
            avatarIds.push(redemption.itemId);
          } else if (redemption.rewardType === 'accessory' && redemption.itemId) {
            accessoryIds.push(redemption.itemId);
          } else if (redemption.rewardType === 'titleBadge' && redemption.itemId) {
            titleBadgeIds.push(redemption.itemId);
          }
        });
        
        // Update avatarData with found items
        if (avatarIds.length > 0) {
          avatarData.unlockedPremiumAvatars = [...new Set([...avatarData.unlockedPremiumAvatars, ...avatarIds])];
        }
        if (accessoryIds.length > 0) {
          avatarData.unlockedAccessories = [...new Set([...avatarData.unlockedAccessories, ...accessoryIds])];
        }
      } else {
        // Update avatarData with inventory data
        if (inventory.avatars.length > 0) {
          avatarData.unlockedPremiumAvatars = [...new Set([...avatarData.unlockedPremiumAvatars, ...inventory.avatars])];
        }
        if (inventory.accessories.length > 0) {
          avatarData.unlockedAccessories = [...new Set([...avatarData.unlockedAccessories, ...inventory.accessories])];
        }
        
        // Get IDs from inventory for later use
        avatarIds = inventory.avatars;
        accessoryIds = inventory.accessories;
        titleBadgeIds = inventory.titleBadges;
      }
      
      // Load premium avatars using local data first, then fallback to reward data
      const loadedPremiumAvatars: PremiumAvatar[] = [];
      
      console.log('Processing premium avatars:', avatarData.unlockedPremiumAvatars);
      
      for (const avatarId of avatarData.unlockedPremiumAvatars) {
        console.log('Getting data for avatar:', avatarId);
        
        // First try local database
        const localData = getPremiumAvatarData(avatarId);
        
        // Also try to get reward data for actual image URL
        const rewardData = await getReward(avatarId);
        console.log('Reward data for', avatarId, ':', rewardData);
        
        if (localData) {
          console.log('Found in local database:', localData);
          // Use reward imageUrl if available, otherwise use local svgUrl
          const avatarWithCorrectUrl = {
            ...localData,
            svgUrl: rewardData?.imageUrl || localData.svgUrl
          };
          loadedPremiumAvatars.push(avatarWithCorrectUrl);
        } else if (rewardData) {
          const avatarObj = {
            id: avatarId,
            name: rewardData.name,
            description: rewardData.description,
            svgUrl: rewardData.imageUrl || '',
            price: 0, // Already owned
            rarity: 'rare' as const,
            category: 'special' as const
          };
          loadedPremiumAvatars.push(avatarObj);
        } else {
          // Final fallback
          console.log('No data found for:', avatarId);
          loadedPremiumAvatars.push({
            id: avatarId,
            name: avatarId.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            svgUrl: '',
            price: 0,
            rarity: 'rare',
            category: 'special'
          });
        }
      }
      
      setPremiumAvatars(loadedPremiumAvatars);
      console.log('Final loaded premium avatars:', loadedPremiumAvatars);
      
      // Load accessories using local data first
      const loadedAccessories: AvatarAccessory[] = [];
      
      console.log('Processing accessories:', avatarData.unlockedAccessories);
      
      for (const accessoryId of avatarData.unlockedAccessories) {
        console.log('Loading accessory:', accessoryId);
        
        // First try local database
        const localData = getAccessoryData(accessoryId);
        if (localData) {
          console.log('Found in local database:', localData);
          loadedAccessories.push(localData);
        } else {
          // Fallback to reward data
          const rewardData = await getReward(accessoryId);
          console.log('Reward data for accessory', accessoryId, ':', rewardData);
          
          if (rewardData) {
            // Use accessoryType from reward data if available
            const type = rewardData.accessoryType || getAccessoryType(accessoryId);
            console.log('Accessory type determined:', type);
            
            loadedAccessories.push({
              id: accessoryId,
              name: rewardData.name,
              description: rewardData.description,
              type: type,
              svgUrl: rewardData.imageUrl || '',
              price: 0,
              rarity: 'common'
            });
          }
        }
      }
      
      setAccessories(loadedAccessories);
      console.log('Loaded accessories:', loadedAccessories);
      
      // Load title badges using local data first
      const loadedTitles: TitleBadge[] = [];
      const allTitleIds = [...new Set([...(inventory?.titleBadges || []), ...titleBadgeIds])];
      
      for (const titleId of allTitleIds) {
        // First try local database
        const localData = getTitleBadgeData(titleId);
        if (localData) {
          loadedTitles.push(localData);
        } else {
          // Fallback to reward data
          const rewardData = await getReward(titleId);
          
          if (rewardData) {
            loadedTitles.push({
              id: titleId,
              name: rewardData.name,
              description: rewardData.description || 'ได้รับจากการแลกรางวัล',
              rarity: 'rare',
              color: '#6B7280'
            });
          }
        }
      }
      
      setTitleBadges(loadedTitles);
      
      // Sync avatarData back to user if needed
      if (freshUserData?.avatarData?.unlockedPremiumAvatars?.length !== avatarData.unlockedPremiumAvatars.length ||
          freshUserData?.avatarData?.unlockedAccessories?.length !== avatarData.unlockedAccessories.length) {
        console.log('Syncing avatar data back to user...');
        await updateDoc(doc(db, 'users', user.id), {
          avatarData: avatarData
        });
      }
      
      setCurrentAvatarData(avatarData);
      setTempAvatarData(JSON.parse(JSON.stringify(avatarData)));
    } catch (error) {
      console.error('Error loading avatar data:', error);
    }
  };

  // Helper function to determine accessory type from ID
  const getAccessoryType = (id: string): AccessoryType => {
    // Check specific patterns in ID
    if (id.includes('hat') || id.includes('crown') || id.includes('cap')) return AccessoryType.HAT;
    if (id.includes('glass') || id.includes('sunglass')) return AccessoryType.GLASSES;
    if (id.includes('mask')) return AccessoryType.MASK;
    if (id.includes('earring')) return AccessoryType.EARRING;
    if (id.includes('necklace') || id.includes('chain')) return AccessoryType.NECKLACE;
    if (id.includes('background') || id.includes('bg')) return AccessoryType.BACKGROUND;
    
    // Check prefix pattern acc-{type}-{name}
    const prefixMatch = id.match(/^acc-(\w+)-/);
    if (prefixMatch) {
      const typeStr = prefixMatch[1];
      switch (typeStr) {
        case 'hat': return AccessoryType.HAT;
        case 'glasses': return AccessoryType.GLASSES;
        case 'mask': return AccessoryType.MASK;
        case 'earring': return AccessoryType.EARRING;
        case 'necklace': return AccessoryType.NECKLACE;
        case 'background': return AccessoryType.BACKGROUND;
      }
    }
    
    // Default to hat if can't determine
    console.warn(`Could not determine accessory type for ID: ${id}, defaulting to HAT`);
    return AccessoryType.HAT;
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

  // Handle title change
  const handleTitleChange = (titleId: string | null) => {
    setSelectedTitle(titleId);
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
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'avatar' && (
              <AvatarCustomizationTab
                avatarData={tempAvatarData}
                premiumAvatars={premiumAvatars}
                accessories={accessories}
                userExp={user?.experience || 0}
                onAvatarChange={handleAvatarChange}
                onAccessoryChange={handleAccessoryChange}
              />
            )}
            
            {activeTab === 'title' && (
              <TitleBadgesTab
                titleBadges={titleBadges}
                selectedTitle={selectedTitle}
                onTitleChange={handleTitleChange}
              />
            )}
            
            {activeTab === 'badges' && (
              <BadgesTab badges={badges} />
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