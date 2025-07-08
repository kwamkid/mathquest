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
import ImageUpload from '@/components/ui/ImageUpload';
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
  
  // Form state
  const [formData, setFormData] = useState<Partial<Reward>>({
    type: RewardType.AVATAR,
    name: '',
    description: '',
    price: 0,
    stock: undefined,
    requiredLevel: undefined,
    limitPerUser: undefined,
    isActive: true,
    requiresShipping: false,
    boostDuration: 60,
    boostMultiplier: 2,
    imageUrl: undefined,
    imagePath: undefined,
    itemId: undefined
  });
  
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setFormData({
      type: RewardType.AVATAR,
      name: '',
      description: '',
      price: 0,
      stock: undefined,
      requiredLevel: undefined,
      limitPerUser: undefined,
      isActive: true,
      requiresShipping: false,
      boostDuration: 60,
      boostMultiplier: 2,
      imageUrl: undefined,
      imagePath: undefined,
      itemId: undefined
    });
    setErrors({});
    setShowCreateModal(true);
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setFormData(reward);
    setErrors({});
    setShowCreateModal(true);
  };

  const handleDelete = async (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    
    deleteDialog.showDialog('คุณต้องการลบรางวัลนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้', {
      onConfirm: async () => {
        try {
          // Delete image from storage if exists
          if (reward?.imagePath) {
            await deleteImage(reward.imagePath);
          }
          
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

  const handleImageUpload = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const path = `rewards/${fileName}`;
    
    // Upload with resize options
    const { url } = await uploadImage(file, path, {
      resize: true,
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.85
    });
    
    // Update form data with both URL and path
    setFormData(prev => ({
      ...prev,
      imageUrl: url,
      imagePath: path
    }));
    
    return url;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'กรุณากรอกชื่อรางวัล';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'กรุณากรอกรายละเอียด';
    }

    if (!formData.price || formData.price < 0) {
      newErrors.price = 'กรุณากรอกราคา EXP ที่ถูกต้อง';
    }

    // Validate itemId for avatar and accessory types
    if ((formData.type === RewardType.AVATAR || formData.type === RewardType.ACCESSORY || formData.type === RewardType.TITLE_BADGE) && !formData.itemId?.trim()) {
      newErrors.itemId = 'กรุณากรอก Item ID';
    }

    if (formData.type === RewardType.BOOST) {
      if (!formData.boostDuration || formData.boostDuration < 1) {
        newErrors.boostDuration = 'กรุณากรอกระยะเวลา';
      }
      if (!formData.boostMultiplier || formData.boostMultiplier < 1) {
        newErrors.boostMultiplier = 'กรุณากรอกตัวคูณ';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    try {
      // Clean up undefined values
      const cleanedData: any = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          cleanedData[key] = value;
        }
      });

      // Set requiresShipping based on type
      cleanedData.requiresShipping = cleanedData.type === RewardType.PHYSICAL;

      // If editing and image changed, delete old image
      if (editingReward && editingReward.imagePath && editingReward.imagePath !== formData.imagePath) {
        await deleteImage(editingReward.imagePath);
      }

      const result = await saveReward(cleanedData, editingReward?.id);
      
      if (result.success) {
        setShowCreateModal(false);
        await loadRewards();
        successDialog.showDialog(result.message);
      } else {
        errorDialog.showDialog(result.message);
      }
    } catch (error) {
      console.error('Error saving reward:', error);
      errorDialog.showDialog('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
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

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    รูปภาพรางวัล
                  </label>
                  <ImageUpload
                    value={formData.imageUrl}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url, imagePath: url })}
                    onUpload={handleImageUpload}
                    maxSize={2}
                    placeholder="คลิกเพื่ออัพโหลดรูปรางวัล"
                    allowUrl={true}
                  />
                  <p className="mt-2 text-xs text-white/40">
                    * สามารถอัพโหลดรูปหรือใส่ URL รูปภาพก็ได้
                  </p>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    ประเภทรางวัล
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as RewardType })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white"
                  >
                    {rewardTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    ชื่อรางวัล <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 ${
                      errors.name ? 'border-red-400' : 'border-metaverse-purple/30'
                    }`}
                    placeholder="เช่น Ninja Avatar, EXP Boost 2x"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    รายละเอียด <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 resize-none ${
                      errors.description ? 'border-red-400' : 'border-metaverse-purple/30'
                    }`}
                    placeholder="อธิบายรายละเอียดของรางวัล"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-400">{errors.description}</p>
                  )}
                </div>

                {/* Item ID - For Avatar, Accessory, Title Badge */}
                {(formData.type === 'avatar' || 
                  formData.type === 'accessory' || 
                  formData.type === 'titleBadge') && (
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Item ID <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.itemId || ''}
                      onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                      className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 font-mono ${
                        errors.itemId ? 'border-red-400' : 'border-metaverse-purple/30'
                      }`}
                      placeholder={
                        formData.type === RewardType.AVATAR ? 'เช่น dragon_warrior, cyber_ninja' :
                        formData.type === RewardType.ACCESSORY ? 'เช่น hat_crown, glasses_cool' :
                        'เช่น speed_demon, math_master'
                      }
                    />
                    {errors.itemId && (
                      <p className="mt-1 text-sm text-red-400">{errors.itemId}</p>
                    )}
                    <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-400">
                          <p className="font-medium mb-1">คำแนะนำ Item ID:</p>
                          {formData.type === RewardType.AVATAR && (
                            <ul className="list-disc list-inside space-y-1">
                              <li>ใช้ตัวอักษรเล็ก และ underscore</li>
                              <li>ตัวอย่าง: dragon_warrior, space_hero, cyber_ninja</li>
                              <li>ID นี้จะใช้ในการแสดง avatar ในเกม</li>
                            </ul>
                          )}
                          {formData.type === RewardType.ACCESSORY && (
                            <ul className="list-disc list-inside space-y-1">
                              <li>รูปแบบ: ประเภท_ชื่อ</li>
                              <li>ประเภท: hat, glasses, mask, earring, necklace, background</li>
                              <li>ตัวอย่าง: hat_crown, glasses_cool, mask_hero</li>
                            </ul>
                          )}
                          {formData.type === RewardType.TITLE_BADGE && (
                            <ul className="list-disc list-inside space-y-1">
                              <li>ใช้คำที่สื่อความหมาย</li>
                              <li>ตัวอย่าง: speed_demon, math_master, legend</li>
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    ราคา (EXP) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    min="0"
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 ${
                      errors.price ? 'border-red-400' : 'border-metaverse-purple/30'
                    }`}
                    placeholder="100"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-400">{errors.price}</p>
                  )}
                </div>

                {/* Conditional Fields */}
                {formData.type === RewardType.PHYSICAL && (
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      จำนวน Stock
                    </label>
                    <input
                      type="number"
                      value={formData.stock || ''}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value ? parseInt(e.target.value) : undefined })}
                      min="0"
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40"
                      placeholder="ไม่จำกัด"
                    />
                  </div>
                )}

                {formData.type === RewardType.BOOST && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        ระยะเวลา (นาที) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.boostDuration}
                        onChange={(e) => setFormData({ ...formData, boostDuration: parseInt(e.target.value) || 60 })}
                        min="1"
                        className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 ${
                          errors.boostDuration ? 'border-red-400' : 'border-metaverse-purple/30'
                        }`}
                        placeholder="60"
                      />
                      {errors.boostDuration && (
                        <p className="mt-1 text-sm text-red-400">{errors.boostDuration}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        ตัวคูณ EXP <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.boostMultiplier}
                        onChange={(e) => setFormData({ ...formData, boostMultiplier: parseFloat(e.target.value) || 2 })}
                        min="1"
                        step="0.5"
                        className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 ${
                          errors.boostMultiplier ? 'border-red-400' : 'border-metaverse-purple/30'
                        }`}
                        placeholder="2"
                      />
                      {errors.boostMultiplier && (
                        <p className="mt-1 text-sm text-red-400">{errors.boostMultiplier}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Optional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Level ขั้นต่ำ
                    </label>
                    <input
                      type="number"
                      value={formData.requiredLevel || ''}
                      onChange={(e) => setFormData({ ...formData, requiredLevel: e.target.value ? parseInt(e.target.value) : undefined })}
                      min="1"
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40"
                      placeholder="ไม่จำกัด"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      จำกัด/คน
                    </label>
                    <input
                      type="number"
                      value={formData.limitPerUser || ''}
                      onChange={(e) => setFormData({ ...formData, limitPerUser: e.target.value ? parseInt(e.target.value) : undefined })}
                      min="1"
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40"
                      placeholder="ไม่จำกัด"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 glass border border-metaverse-purple/50 text-white font-bold rounded-xl hover:bg-white/10 transition"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ยกเลิก
                  </motion.button>
                  
                  <motion.button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 metaverse-button text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {saving ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          ⏳
                        </motion.span>
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editingReward ? 'บันทึกการแก้ไข' : 'เพิ่มรางวัล'}
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}