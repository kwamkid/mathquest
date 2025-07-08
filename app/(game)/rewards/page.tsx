// app/(game)/rewards/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/firebase/auth';
import { getActiveRewards, purchaseReward } from '@/lib/firebase/rewards';
import { User } from '@/types';
import { Reward, RewardType, ShippingAddress } from '@/types/avatar';
import { useDialog } from '@/components/ui/Dialog';
import ShippingAddressForm from '@/components/rewards/ShippingAddressForm';
import { 
  Gift, 
  Sparkles, 
  Package, 
  Zap, 
  Crown, 
  Search,
  Filter,
  ShoppingCart,
  ArrowLeft,
  Check,
  X,
  Lock,
  Clock,
  TrendingUp,
  Award,
  FileText,
  Loader2
} from 'lucide-react';

// Category filters
const categories = [
  { id: 'all', label: 'ทั้งหมด', icon: <Sparkles className="w-5 h-5" /> },
  { id: RewardType.AVATAR, label: 'Avatars', icon: '🦸' },
  { id: RewardType.ACCESSORY, label: 'Accessories', icon: '👑' },
  { id: RewardType.TITLE_BADGE, label: 'Title Badges', icon: '🏆' },
  { id: RewardType.BOOST, label: 'Boosts', icon: '⚡' },
  { id: RewardType.PHYSICAL, label: 'ของจริง', icon: '📦' },
];

export default function RewardShopPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [filteredRewards, setFilteredRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  
  // Dialogs
  const successDialog = useDialog({ type: 'success' });
  const errorDialog = useDialog({ type: 'error' });

  // Load user and rewards
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await getCurrentUser();
      if (!userData) {
        router.push('/login');
        return;
      }
      setUser(userData);

      const rewardsList = await getActiveRewards(undefined, userData.level);
      setRewards(rewardsList);
      setFilteredRewards(rewardsList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter rewards
  useEffect(() => {
    let filtered = rewards;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.type === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRewards(filtered);
  }, [selectedCategory, searchQuery, rewards]);

  // Handle purchase
  const handlePurchase = async (reward: Reward) => {
    if (!user) return;
    
    // Check if can afford
    if (user.experience < reward.price) {
      errorDialog.showDialog(`EXP ไม่พอ! คุณมี ${user.experience} EXP แต่ต้องการ ${reward.price} EXP`);
      return;
    }

    setSelectedReward(reward);
    
    // Check if physical reward needs shipping address
    if (reward.type === RewardType.PHYSICAL) {
      setShowShippingModal(true);
    } else {
      setShowPurchaseModal(true);
    }
  };

  const handleShippingSubmit = (address: ShippingAddress) => {
    setShippingAddress(address);
    setShowShippingModal(false);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = async () => {
    if (!user || !selectedReward) return;

    setPurchasing(true);
    try {
      const result = await purchaseReward(
        user.id, 
        selectedReward.id,
        selectedReward.type === RewardType.PHYSICAL ? shippingAddress || undefined : undefined
      );
      
      if (result.success) {
        // Update user EXP
        setUser({
          ...user,
          experience: user.experience - selectedReward.price
        });
        
        // Show success message
        successDialog.showDialog(result.message);
        setShowPurchaseModal(false);
        setShippingAddress(null);
        
        // Reload rewards (in case stock changed)
        const updatedRewards = await getActiveRewards(undefined, user.level);
        setRewards(updatedRewards);
        
        // Navigate to history if physical reward
        if (selectedReward.type === RewardType.PHYSICAL) {
          setTimeout(() => {
            router.push('/rewards/history');
          }, 2000);
        }
      } else {
        errorDialog.showDialog(result.message);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      errorDialog.showDialog('เกิดข้อผิดพลาดในการแลกรางวัล');
    } finally {
      setPurchasing(false);
    }
  };

  // Get reward icon
  const getRewardIcon = (type: RewardType) => {
    switch (type) {
      case RewardType.AVATAR: return '🦸';
      case RewardType.ACCESSORY: return '👑';
      case RewardType.TITLE_BADGE: return '🏆';
      case RewardType.BOOST: return '⚡';
      case RewardType.PHYSICAL: return '📦';
      case RewardType.BADGE: return '🎖️';
      default: return '🎁';
    }
  };

  // Render reward image or icon
  const renderRewardImage = (reward: Reward) => {
    if (reward.imageUrl) {
      return (
        <div className="w-24 h-24 mx-auto mb-4 bg-black rounded-xl overflow-hidden">
          <img 
            src={reward.imageUrl} 
            alt={reward.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback to emoji if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-6xl">${getRewardIcon(reward.type)}</div>`;
              }
            }}
          />
        </div>
      );
    }
    return (
      <div className="text-6xl text-center mb-4">
        {getRewardIcon(reward.type)}
      </div>
    );
  };

  // Get rarity color
  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-metaverse-purple to-metaverse-pink';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-metaverse-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🎁
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metaverse-black py-8">
      {/* Dialogs */}
      <successDialog.Dialog />
      <errorDialog.Dialog />
      
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/play')}
                className="p-2 glass rounded-full hover:bg-white/10 transition"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  <Gift className="w-8 h-8 text-metaverse-purple" />
                  Reward Shop
                </h1>
                <p className="text-white/60">แลกรางวัลด้วย EXP ที่สะสม</p>
              </div>
            </div>
            
            {/* User EXP & History Button */}
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => router.push('/rewards/history')}
                className="px-4 py-2 glass rounded-xl text-white font-medium hover:bg-white/10 transition flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FileText className="w-5 h-5" />
                <span className="hidden sm:inline">ประวัติการแลก</span>
              </motion.button>
              
              <motion.div
                className="glass-dark rounded-2xl px-6 py-3 border border-yellow-400/30"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-sm text-white/60">EXP ของคุณ</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {user?.experience.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="glass-dark rounded-2xl p-4 mb-6 border border-metaverse-purple/30">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Categories */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <motion.button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${
                      selectedCategory === category.id
                        ? 'metaverse-button text-white'
                        : 'glass text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {typeof category.icon === 'string' ? (
                      <span className="text-lg">{category.icon}</span>
                    ) : (
                      category.icon
                    )}
                    <span>{category.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหารางวัล..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40"
              />
            </div>
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredRewards.map((reward, index) => {
              const canAfford = user && user.experience >= reward.price;
              const isLocked = reward.requiredLevel && user && user.level < reward.requiredLevel;
              const outOfStock = reward.stock !== undefined && reward.stock <= 0;
              
              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <div className={`glass-dark rounded-2xl p-6 border border-metaverse-purple/30 h-full flex flex-col ${
                    !canAfford || isLocked || outOfStock ? 'opacity-60' : ''
                  }`}>
                    {/* Stock Badge */}
                    {reward.stock !== undefined && (
                      <div className="absolute top-3 right-3 glass rounded-full px-3 py-1 text-xs font-medium">
                        {outOfStock ? (
                          <span className="text-red-400">หมด</span>
                        ) : (
                          <span className="text-white/80">เหลือ {reward.stock}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Icon */}
                    {renderRewardImage(reward)}
                    
                    {/* Name */}
                    <h3 className="text-xl font-bold text-white mb-2">{reward.name}</h3>
                    
                    {/* Description */}
                    <p className="text-sm text-white/60 mb-4 flex-1">
                      {reward.description}
                    </p>
                    
                    {/* Boost Info */}
                    {reward.type === RewardType.BOOST && (
                      <div className="glass rounded-lg p-2 mb-4">
                        <div className="flex items-center justify-center gap-2 text-yellow-400">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-bold">{reward.boostMultiplier}x EXP</span>
                          <Clock className="w-4 h-4" />
                          <span>{reward.boostDuration} นาที</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Level Requirement */}
                    {reward.requiredLevel && (
                      <div className="text-sm text-white/60 mb-2">
                        ต้องการ Level {reward.requiredLevel}+
                      </div>
                    )}
                    
                    {/* Price & Button */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <Zap className={`w-5 h-5 ${canAfford ? 'text-yellow-400' : 'text-red-400'}`} />
                        <span className={`text-xl font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                          {reward.price}
                        </span>
                      </div>
                      
                      <motion.button
                        onClick={() => handlePurchase(reward)}
                        disabled={!canAfford || isLocked || outOfStock}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${
                          canAfford && !isLocked && !outOfStock
                            ? 'metaverse-button text-white'
                            : 'glass opacity-50 cursor-not-allowed text-white/50'
                        }`}
                        whileHover={canAfford && !isLocked && !outOfStock ? { scale: 1.05 } : {}}
                        whileTap={canAfford && !isLocked && !outOfStock ? { scale: 0.95 } : {}}
                      >
                        {isLocked ? (
                          <Lock className="w-5 h-5" />
                        ) : outOfStock ? (
                          'หมด'
                        ) : (
                          'แลก'
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredRewards.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-white/60">ไม่พบรางวัลที่ค้นหา</p>
          </div>
        )}
      </div>

      {/* Shipping Address Modal */}
      <AnimatePresence>
        {showShippingModal && selectedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowShippingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-dark rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-metaverse-purple/30"
              onClick={(e) => e.stopPropagation()}
            >
              <ShippingAddressForm
                onSubmit={handleShippingSubmit}
                onCancel={() => setShowShippingModal(false)}
                loading={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Purchase Confirmation Modal */}
      <AnimatePresence>
        {showPurchaseModal && selectedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => !purchasing && setShowPurchaseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-dark rounded-3xl p-8 max-w-md w-full border border-metaverse-purple/30"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                ยืนยันการแลกรางวัล
              </h3>
              
              {/* Reward Preview */}
              <div className="text-center mb-6">
                {selectedReward.imageUrl ? (
                  <div className="w-32 h-32 mx-auto mb-4 bg-black rounded-xl overflow-hidden">
                    <img 
                      src={selectedReward.imageUrl} 
                      alt={selectedReward.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="text-6xl mb-4">{getRewardIcon(selectedReward.type)}</div>
                )}
                <h4 className="text-xl font-bold text-white mb-2">{selectedReward.name}</h4>
                <p className="text-white/60">{selectedReward.description}</p>
              </div>
              
              {/* Cost */}
              <div className="glass rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">ราคา:</span>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-xl font-bold text-yellow-400">
                      {selectedReward.price} EXP
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-white/60">EXP คงเหลือ:</span>
                  <span className="text-lg text-white">
                    {user ? (user.experience - selectedReward.price).toLocaleString() : 0}
                  </span>
                </div>
              </div>
              
              {/* Shipping Address Preview */}
              {selectedReward.type === RewardType.PHYSICAL && shippingAddress && (
                <div className="glass rounded-xl p-4 mb-6">
                  <h5 className="text-sm font-medium text-white/60 mb-2">จัดส่งไปที่:</h5>
                  <p className="text-white">{shippingAddress.fullName}</p>
                  <p className="text-white/80 text-sm">
                    {shippingAddress.addressLine1}
                    {shippingAddress.addressLine2 && ` ${shippingAddress.addressLine2}`}
                  </p>
                  <p className="text-white/80 text-sm">
                    {shippingAddress.subDistrict} {shippingAddress.district} {shippingAddress.province} {shippingAddress.postalCode}
                  </p>
                  <p className="text-white/80 text-sm">โทร: {shippingAddress.phone}</p>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-4">
                <motion.button
                  onClick={() => setShowPurchaseModal(false)}
                  disabled={purchasing}
                  className="flex-1 py-3 glass border border-metaverse-purple/50 text-white font-bold rounded-xl hover:bg-white/10 transition disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ยกเลิก
                </motion.button>
                
                <motion.button
                  onClick={confirmPurchase}
                  disabled={purchasing}
                  className="flex-1 py-3 metaverse-button text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      กำลังดำเนินการ...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      ยืนยันการแลก
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}