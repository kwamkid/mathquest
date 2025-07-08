// components/admin/RewardForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Reward, RewardType } from '@/types/avatar';
import ImageUpload from '@/components/ui/ImageUpload';
import { uploadImage, deleteImage } from '@/lib/firebase/storage';
import { saveReward } from '@/lib/firebase/rewards';
import { 
  Save,
  Info,
  Zap,
  X
} from 'lucide-react';

interface RewardFormProps {
  reward?: Reward | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RewardForm({ reward, onSuccess, onCancel }: RewardFormProps) {
  // Form state
  const [formData, setFormData] = useState<Partial<Reward>>({
    type: RewardType.AVATAR,
    name: '',
    description: '',
    price: 100,
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

  // Initialize form with reward data if editing
  useEffect(() => {
    if (reward) {
      setFormData(reward);
    }
  }, [reward]);

  // Generate Item ID from name
  const generateItemId = (name: string, type: RewardType): string => {
    // Convert to lowercase and replace spaces with dashes
    let itemId = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters except - and spaces
      .replace(/\s+/g, '-')      // Replace spaces with -
      .replace(/-+/g, '-')       // Replace multiple - with single -
      .trim();
    
    // Add prefix based on type if needed
    if (type === RewardType.AVATAR && !itemId.includes('avatar')) {
      itemId = `avatar-${itemId}`;
    } else if (type === RewardType.ACCESSORY && !itemId.includes('acc')) {
      itemId = `acc-${itemId}`;
    } else if (type === RewardType.TITLE_BADGE && !itemId.includes('title')) {
      itemId = `title-${itemId}`;
    }
    
    return itemId;
  };

  // Auto-generate Item ID when name changes
  const handleNameChange = (name: string) => {
    setFormData(prev => {
      const newData = { ...prev, name };
      
      // Auto-generate itemId for digital rewards
      const needsItemId = [RewardType.AVATAR, RewardType.ACCESSORY, RewardType.TITLE_BADGE].includes(prev.type as RewardType);
      if (needsItemId) {
        newData.itemId = generateItemId(name, prev.type as RewardType);
      }
      
      return newData;
    });
  };

  // Handle type change
  const handleTypeChange = (type: RewardType) => {
    setFormData(prev => {
      const newData = { ...prev, type };
      
      // Re-generate itemId when type changes
      const needsItemId = [RewardType.AVATAR, RewardType.ACCESSORY, RewardType.TITLE_BADGE].includes(type);
      if (needsItemId && prev.name) {
        newData.itemId = generateItemId(prev.name, type);
      } else if (!needsItemId) {
        newData.itemId = undefined;
      }
      
      // Reset type-specific fields
      if (type !== RewardType.PHYSICAL) {
        newData.stock = undefined;
      }
      if (type !== RewardType.BOOST) {
        newData.boostDuration = 60;
        newData.boostMultiplier = 2;
      }
      
      return newData;
    });
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

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'กรุณากรอกชื่อรางวัล';
    }

    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'กรุณากรอกรายละเอียด';
    }

    if (formData.price === undefined || formData.price === null || formData.price < 0) {
      newErrors.price = 'กรุณากรอกราคา EXP ที่ถูกต้อง';
    }

    // Validate itemId for digital reward types
    const needsItemId = [RewardType.AVATAR, RewardType.ACCESSORY, RewardType.TITLE_BADGE].includes(formData.type as RewardType);
    if (needsItemId && (!formData.itemId || formData.itemId.trim() === '')) {
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
      // Clean up undefined values and ensure proper data types
      const cleanedData: any = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          // Convert string numbers to numbers
          if (key === 'price' || key === 'stock' || key === 'requiredLevel' || 
              key === 'limitPerUser' || key === 'boostDuration') {
            cleanedData[key] = typeof value === 'string' ? parseInt(value) : value;
          } else if (key === 'boostMultiplier') {
            cleanedData[key] = typeof value === 'string' ? parseFloat(value) : value;
          } else {
            cleanedData[key] = value;
          }
        }
      });

      // Set requiresShipping based on type
      cleanedData.requiresShipping = cleanedData.type === RewardType.PHYSICAL;

      // If editing and image changed, delete old image
      if (reward && reward.imagePath && reward.imagePath !== formData.imagePath) {
        await deleteImage(reward.imagePath);
      }

      const result = await saveReward(cleanedData, reward?.id);
      
      if (result.success) {
        onSuccess();
      } else {
        setErrors({ submit: result.message });
      }
    } catch (error) {
      console.error('Error saving reward:', error);
      setErrors({ submit: 'เกิดข้อผิดพลาดในการบันทึก' });
    } finally {
      setSaving(false);
    }
  };

  const rewardTypes = [
    { value: RewardType.AVATAR, label: 'Avatar', icon: '🦸' },
    { value: RewardType.ACCESSORY, label: 'Accessories', icon: '👑' },
    { value: RewardType.TITLE_BADGE, label: 'Title Badge', icon: '🏆' },
    { value: RewardType.BOOST, label: 'EXP Boost', icon: '⚡' },
    { value: RewardType.PHYSICAL, label: 'ของจริง', icon: '📦' },
    { value: RewardType.BADGE, label: 'Badge', icon: '🎖️' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error message */}
      {errors.submit && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-red-400 text-sm">{errors.submit}</p>
        </div>
      )}

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
          onChange={(e) => handleTypeChange(e.target.value as RewardType)}
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
          onChange={(e) => handleNameChange(e.target.value)}
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
      {(formData.type === RewardType.AVATAR || 
        formData.type === RewardType.ACCESSORY || 
        formData.type === RewardType.TITLE_BADGE) && (
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Item ID <span className="text-red-400">*</span>
            <span className="text-xs text-yellow-400 ml-2">(Auto-generated)</span>
          </label>
          <input
            type="text"
            value={formData.itemId || ''}
            onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
            className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 font-mono ${
              errors.itemId ? 'border-red-400' : 'border-metaverse-purple/30'
            }`}
            placeholder="จะถูกสร้างอัตโนมัติจากชื่อ"
          />
          {errors.itemId && (
            <p className="mt-1 text-sm text-red-400">{errors.itemId}</p>
          )}
          <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-400">
                <p className="font-medium mb-1">Item ID จะถูกสร้างอัตโนมัติจากชื่อ:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>ช่องว่างจะถูกแทนด้วย - (dash)</li>
                  <li>ตัวอักษรจะเป็นตัวพิมพ์เล็กทั้งหมด</li>
                  <li>ตัวอักษรพิเศษจะถูกลบออก</li>
                  <li>สามารถแก้ไขได้หากต้องการ</li>
                </ul>
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
          onClick={onCancel}
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
              {reward ? 'บันทึกการแก้ไข' : 'เพิ่มรางวัล'}
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}