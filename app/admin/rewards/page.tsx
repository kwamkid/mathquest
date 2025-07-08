// app/admin/rewards/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { saveReward } from '@/lib/firebase/rewards';
import { uploadImage, deleteImage } from '@/lib/firebase/storage';
import { Reward, RewardType } from '@/types/avatar';
import { useDialog } from '@/components/ui/Dialog';
import RewardForm from '@/components/admin/RewardForm';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Gift, 
  Package,
  Zap,
  Crown,
  Award,
  Shield,
  Search,
  Filter,
  Save,
  X,
  Upload,
  AlertCircle,
  Check,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Info
} from 'lucide-react';

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [filteredRewards, setFilteredRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  
  // Dialogs
  const successDialog = useDialog({ type: 'success' });
  const errorDialog = useDialog({ type: 'error' });
  const deleteDialog = useDialog({ 
    type: 'confirm',
    title: 'ยืนยันการลบ',
    confirmLabel: 'ลบ',
    cancelLabel: 'ยกเลิก'
  });


  useEffect(() => {
    loadRewards();
  }, []);

  useEffect(() => {
    filterRewards();
  }, [rewards, searchQuery, filterType, filterActive]);

  const loadRewards = async () => {
    try {
      const q = query(collection(db, 'rewards'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const rewardsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Reward));
      setRewards(rewardsList);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRewards = () => {
    let filtered = rewards;

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(r => r.type === filterType);
    }

    // Active filter
    if (filterActive === 'active') {
      filtered = filtered.filter(r => r.isActive);
    } else if (filterActive === 'inactive') {
      filtered = filtered.filter(r => !r.isActive);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRewards(filtered);
  };

  const handleCreateNew = () => {
    setEditingReward(null);
    setShowCreateModal(true);
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setShowCreateModal(true);
  };

  const handleFormSuccess = () => {
    setShowCreateModal(false);
    loadRewards();
    successDialog.showDialog(editingReward ? 'แก้ไขรางวัลเรียบร้อยแล้ว' : 'เพิ่มรางวัลเรียบร้อยแล้ว');
  };

  const handleDelete = async (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    
    deleteDialog.showDialog('คุณต้องการลบรางวัลนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้', {
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'rewards', rewardId));
          await loadRewards();
          successDialog.showDialog('ลบรางวัลเรียบร้อยแล้ว');
        } catch (error) {
          console.error('Error deleting reward:', error);
          errorDialog.showDialog('เกิดข้อผิดพลาดในการลบรางวัล');
        }
      }
    });
  };

  const handleToggleActive = async (reward: Reward) => {
    try {
      await updateDoc(doc(db, 'rewards', reward.id), {
        isActive: !reward.isActive,
        updatedAt: new Date().toISOString()
      });
      await loadRewards();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };



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

  const getRewardImage = (reward: Reward) => {
    if (reward.imageUrl) {
      return (
        <img 
          src={reward.imageUrl} 
          alt={reward.name}
          className="w-full h-full object-contain"
        />
      );
    }
    return <div className="text-3xl">{getRewardIcon(reward.type)}</div>;
  };

  const rewardTypes = [
    { value: RewardType.AVATAR, label: 'Avatar', icon: '🦸' },
    { value: RewardType.ACCESSORY, label: 'Accessories', icon: '👑' },
    { value: RewardType.TITLE_BADGE, label: 'Title Badge', icon: '🏆' },
    { value: RewardType.BOOST, label: 'EXP Boost', icon: '⚡' },
    { value: RewardType.PHYSICAL, label: 'ของจริง', icon: '📦' },
    { value: RewardType.BADGE, label: 'Badge', icon: '🎖️' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Gift className="w-12 h-12 text-metaverse-purple" />
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* Dialogs */}
      <successDialog.Dialog />
      <errorDialog.Dialog />
      <deleteDialog.Dialog />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Gift className="w-8 h-8 text-metaverse-purple" />
          จัดการรางวัล
        </h1>
        <p className="text-white/60 mt-2">จัดการรางวัลสำหรับระบบ Reward Shop</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div 
          className="glass-dark rounded-xl p-4 border border-metaverse-purple/30"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-white">{rewards.length}</p>
              <p className="text-sm text-white/60">รางวัลทั้งหมด</p>
            </div>
            <Gift className="w-8 h-8 text-metaverse-purple/50" />
          </div>
        </motion.div>

        <motion.div 
          className="glass-dark rounded-xl p-4 border border-metaverse-purple/30"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-green-400">
                {rewards.filter(r => r.isActive).length}
              </p>
              <p className="text-sm text-white/60">เปิดใช้งาน</p>
            </div>
            <Check className="w-8 h-8 text-green-400/50" />
          </div>
        </motion.div>

        <motion.div 
          className="glass-dark rounded-xl p-4 border border-metaverse-purple/30"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-orange-400">
                {rewards.filter(r => r.type === RewardType.PHYSICAL).length}
              </p>
              <p className="text-sm text-white/60">ของจริง</p>
            </div>
            <Package className="w-8 h-8 text-orange-400/50" />
          </div>
        </motion.div>

        <motion.div 
          className="glass-dark rounded-xl p-4 border border-metaverse-purple/30"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-yellow-400">
                {rewards.filter(r => r.stock !== undefined && r.stock <= 5).length}
              </p>
              <p className="text-sm text-white/60">ใกล้หมด</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-400/50" />
          </div>
        </motion.div>
      </div>

      {/* Filters & Actions */}
      <div className="glass-dark rounded-xl p-4 mb-6 border border-metaverse-purple/30">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
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

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white"
          >
            <option value="all">ทุกประเภท</option>
            {rewardTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>

          {/* Active Filter */}
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white"
          >
            <option value="all">ทั้งหมด</option>
            <option value="active">เปิดใช้งาน</option>
            <option value="inactive">ปิดใช้งาน</option>
          </select>

          {/* Add Button */}
          <motion.button
            onClick={handleCreateNew}
            className="px-6 py-2 metaverse-button text-white font-bold rounded-xl flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            เพิ่มรางวัล
          </motion.button>
        </div>
      </div>

      {/* Rewards Table */}
      <div className="glass-dark rounded-xl border border-metaverse-purple/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-metaverse-purple/30">
                <th className="px-6 py-4 text-left text-sm font-medium text-white/60">รางวัล</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/60">ประเภท</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/60">Item ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/60">ราคา (EXP)</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/60">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/60">เงื่อนไข</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/60">สถานะ</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/60">การกระทำ</th>
              </tr>
            </thead>
            <tbody>
              {filteredRewards.map((reward, index) => (
                <motion.tr
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-metaverse-purple/10 hover:bg-white/5 transition"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center overflow-hidden">
                        {getRewardImage(reward)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{reward.name}</p>
                        <p className="text-sm text-white/60 line-clamp-1">{reward.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-metaverse-purple/20 text-metaverse-purple">
                      {reward.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {reward.itemId ? (
                      <code className="text-xs font-mono text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                        {reward.itemId}
                      </code>
                    ) : (
                      <span className="text-white/40">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-medium">{reward.price.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {reward.stock !== undefined ? (
                      <span className={`font-medium ${
                        reward.stock === 0 ? 'text-red-400' : 
                        reward.stock <= 5 ? 'text-orange-400' : 
                        'text-white'
                      }`}>
                        {reward.stock}
                      </span>
                    ) : (
                      <span className="text-white/40">∞</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {reward.requiredLevel && (
                        <p className="text-xs text-white/60">Level {reward.requiredLevel}+</p>
                      )}
                      {reward.limitPerUser && (
                        <p className="text-xs text-white/60">Max {reward.limitPerUser}/user</p>
                      )}
                      {!reward.requiredLevel && !reward.limitPerUser && (
                        <span className="text-white/40">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(reward)}
                      className="flex items-center gap-2 text-sm"
                    >
                      {reward.isActive ? (
                        <>
                          <ToggleRight className="w-8 h-5 text-green-400" />
                          <span className="text-green-400">เปิด</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-8 h-5 text-white/40" />
                          <span className="text-white/40">ปิด</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => handleEdit(reward)}
                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(reward.id)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredRewards.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">ไม่พบรางวัล</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-dark rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-metaverse-purple/30"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                {editingReward ? 'แก้ไขรางวัล' : 'เพิ่มรางวัลใหม่'}
              </h3>

              <RewardForm
                reward={editingReward}
                onSuccess={handleFormSuccess}
                onCancel={() => setShowCreateModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}