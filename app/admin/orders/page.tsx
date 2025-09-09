// app/admin/orders/page.tsx - Improved UI Version
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc,
  orderBy,
  where,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { updateRedemptionStatus, cancelRedemption, adminCancelRedemption } from '@/lib/firebase/rewards';
import { Redemption, RedemptionStatus, RewardType } from '@/types/avatar';
import { User } from '@/types';
import { useDialog } from '@/components/ui/Dialog';
import AdminAvatarDisplay from '@/components/admin/AdminAvatarDisplay';
import FixDigitalRewardsButton from '@/components/admin/FixDigitalRewardsButton';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  Truck,
  Gift,
  Zap,
  Crown,
  Search,
  Filter,
  Eye,
  Edit,
  Download,
  AlertCircle,
  Calendar,
  MapPin,
  Phone,
  Copy,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  Image
} from 'lucide-react';

interface RedemptionWithUser extends Redemption {
  user?: {
    id: string;
    username: string;
    displayName?: string;
    school: string;
    grade: string;
    avatar?: string;
    avatarData?: any;
  };
}

export default function AdminOrdersPage() {
  const [redemptions, setRedemptions] = useState<RedemptionWithUser[]>([]);
  const [filteredRedemptions, setFilteredRedemptions] = useState<RedemptionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRedemption, setSelectedRedemption] = useState<RedemptionWithUser | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  
  // Dialogs
  const successDialog = useDialog({ type: 'success' });
  const errorDialog = useDialog({ type: 'error' });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Update form
  const [updateStatus, setUpdateStatus] = useState<RedemptionStatus>(RedemptionStatus.PENDING);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadRedemptions();
  }, []);

  useEffect(() => {
    filterRedemptions();
  }, [redemptions, searchQuery, filterType, filterStatus]);

  const loadRedemptions = async () => {
    try {
      const q = query(collection(db, 'redemptions'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const redemptionsList: RedemptionWithUser[] = [];
      
      // Load user data for each redemption
      for (const docSnap of snapshot.docs) {
        const redemption = {
          id: docSnap.id,
          ...docSnap.data()
        } as Redemption;
        
        // Get user data
        const userDoc = await getDoc(doc(db, 'users', redemption.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          redemptionsList.push({
            ...redemption,
            user: {
              id: redemption.userId,
              username: userData.username,
              displayName: userData.displayName,
              school: userData.school,
              grade: userData.grade,
              avatar: userData.avatar,
              avatarData: userData.avatarData
            }
          });
        } else {
          redemptionsList.push(redemption);
        }
      }
      
      setRedemptions(redemptionsList);
    } catch (error) {
      console.error('Error loading redemptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRedemptions = () => {
    let filtered = redemptions;

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(r => r.rewardType === filterType);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.rewardName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.user?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.user?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRedemptions(filtered);
  };

  const handleViewDetail = (redemption: RedemptionWithUser) => {
    setSelectedRedemption(redemption);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = (redemption: RedemptionWithUser) => {
    setSelectedRedemption(redemption);
    setUpdateStatus(redemption.status);
    setTrackingNumber(redemption.trackingNumber || '');
    setAdminNotes(redemption.adminNotes || '');
    setShowUpdateModal(true);
  };

  const handleSubmitUpdate = async () => {
    if (!selectedRedemption) return;

    console.log('🔄 Starting update process:', {
      redemptionId: selectedRedemption.id,
      currentStatus: selectedRedemption.status,
      newStatus: updateStatus,
      rewardType: selectedRedemption.rewardType,
      userId: selectedRedemption.userId,
      expCost: selectedRedemption.expCost
    });

    setUpdating(true);
    try {
      // ตรวจสอบการยกเลิก digital reward
      const isDigitalCancellation = 
        updateStatus === RedemptionStatus.CANCELLED && 
        selectedRedemption.rewardType !== RewardType.PHYSICAL;

      if (isDigitalCancellation) {
        console.log('🚫 Digital reward cancellation detected, using adminCancelRedemption function');
        
        // ใช้ adminCancelRedemption function แทน (ไม่ต้องใส่ userId)
        const result = await adminCancelRedemption(
          selectedRedemption.id,
          adminNotes || 'ยกเลิกโดย Admin'
        );

        console.log('❌ adminCancelRedemption result:', result);

        if (result.success) {
          await loadRedemptions();
          setShowUpdateModal(false);
          successDialog.showDialog(
            result.message || `ยกเลิกและคืน ${selectedRedemption.expCost} EXP เรียบร้อยแล้ว`
          );
        } else {
          console.error('❌ Cancel failed:', result.message);
          errorDialog.showDialog(result.message);
        }
      } else {
        console.log('📝 Regular status update');
        
        // การอัพเดทสถานะปกติ
        const result = await updateRedemptionStatus(
          selectedRedemption.id,
          updateStatus,
          trackingNumber || undefined,
          adminNotes || undefined
        );

        console.log('✅ updateRedemptionStatus result:', result);

        if (result.success) {
          await loadRedemptions();
          setShowUpdateModal(false);
          successDialog.showDialog('อัพเดทสถานะเรียบร้อยแล้ว');
        } else {
          console.error('❌ Update failed:', result.message);
          errorDialog.showDialog(result.message);
        }
      }
    } catch (error) {
      console.error('💥 Unexpected error:', error);
      errorDialog.showDialog('เกิดข้อผิดพลาดที่ไม่คาดคิด');
    } finally {
      setUpdating(false);
    }
  };

  const handleExport = () => {
    // Filter only physical orders
    const physicalOrders = redemptions.filter(r => 
      r.rewardType === RewardType.PHYSICAL && 
      r.shippingAddress &&
      (r.status === RedemptionStatus.APPROVED || r.status === RedemptionStatus.PROCESSING)
    );

    // Create CSV
    const headers = ['Order ID', 'วันที่', 'ชื่อรางวัล', 'ผู้รับ', 'เบอร์โทร', 'ที่อยู่', 'ตำบล/แขวง', 'อำเภอ/เขต', 'จังหวัด', 'รหัสไปรษณีย์', 'สถานะ'];
    
    const rows = physicalOrders.map(order => [
      order.id,
      new Date(order.createdAt).toLocaleDateString('th-TH'),
      order.rewardName,
      order.shippingAddress?.fullName || '',
      order.shippingAddress?.phone || '',
      `${order.shippingAddress?.addressLine1} ${order.shippingAddress?.addressLine2 || ''}`.trim(),
      order.shippingAddress?.subDistrict || '',
      order.shippingAddress?.district || '',
      order.shippingAddress?.province || '',
      order.shippingAddress?.postalCode || '',
      getStatusDisplay(order.status).label
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    successDialog.showDialog(`ส่งออกรายการจัดส่ง ${physicalOrders.length} รายการเรียบร้อยแล้ว`);
  };

  const getStatusDisplay = (status: RedemptionStatus) => {
    const configs = {
      [RedemptionStatus.PENDING]: {
        label: 'รอดำเนินการ',
        icon: <Clock className="w-4 h-4" />,
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10'
      },
      [RedemptionStatus.APPROVED]: {
        label: 'อนุมัติแล้ว',
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'text-green-400',
        bg: 'bg-green-400/10'
      },
      [RedemptionStatus.PROCESSING]: {
        label: 'กำลังจัดเตรียม',
        icon: <Package className="w-4 h-4" />,
        color: 'text-blue-400',
        bg: 'bg-blue-400/10'
      },
      [RedemptionStatus.SHIPPED]: {
        label: 'จัดส่งแล้ว',
        icon: <Truck className="w-4 h-4" />,
        color: 'text-purple-400',
        bg: 'bg-purple-400/10'
      },
      [RedemptionStatus.DELIVERED]: {
        label: 'สำเร็จแล้ว',
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'text-green-400',
        bg: 'bg-green-400/10'
      },
      [RedemptionStatus.RECEIVED]: {
        label: 'รับของแล้ว',
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'text-green-400',
        bg: 'bg-green-400/10'
      },
      [RedemptionStatus.CANCELLED]: {
        label: 'ยกเลิกแล้ว',
        icon: <XCircle className="w-4 h-4" />,
        color: 'text-red-400',
        bg: 'bg-red-400/10'
      },
      [RedemptionStatus.REFUNDED]: {
        label: 'คืน EXP แล้ว',
        icon: <RefreshCw className="w-4 h-4" />,
        color: 'text-orange-400',
        bg: 'bg-orange-400/10'
      }
    };
    
    return configs[status] || configs[RedemptionStatus.PENDING];
  };

  const getRewardTypeIcon = (type: RewardType) => {
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

  const getStatusCount = (status: string) => {
    return redemptions.filter(r => r.status === status).length;
  };

  const getTypeCount = (type: string) => {
    return redemptions.filter(r => r.rewardType === type).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Package className="w-12 h-12 text-metaverse-purple" />
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* Dialogs */}
      <successDialog.Dialog />
      <errorDialog.Dialog />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-metaverse-purple" />
              จัดการคำสั่งซื้อ
            </h1>
            <p className="text-white/60 mt-2">จัดการการแลกรางวัลทั้ง Digital และของจริง</p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">

            <FixDigitalRewardsButton onFixCompleted={() => loadRedemptions()} />
            <motion.button
                onClick={() => loadRedemptions()}
                className="p-3 glass rounded-xl hover:bg-white/10 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <RefreshCw className="w-5 h-5 text-white" />
            </motion.button>
    

            <motion.button
              onClick={() => loadRedemptions()}
              className="p-3 glass rounded-xl hover:bg-white/10 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-5 h-5 text-white" />
            </motion.button>
            
            <motion.button
              onClick={handleExport}
              className="px-4 py-2 glass rounded-xl hover:bg-white/10 transition flex items-center gap-2 text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-5 h-5" />
              Export CSV
            </motion.button>
          </div>
        </div>
      </div>

      {/* Filter Tabs - Status & Type Combined */}
      <div className="glass-dark rounded-2xl border border-metaverse-purple/30 mb-6">
        {/* Status Filter Tabs */}
        <div className="p-4 border-b border-metaverse-purple/20">
          <h3 className="text-sm font-medium text-white/80 mb-3">กรองตามสถานะ:</h3>
          <div className="flex flex-wrap gap-2">
            <motion.button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm ${
                filterStatus === 'all'
                  ? 'metaverse-button text-white'
                  : 'glass text-white/60 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Package className="w-4 h-4" />
              ทั้งหมด ({redemptions.length})
            </motion.button>

            <motion.button
              onClick={() => setFilterStatus(RedemptionStatus.PENDING)}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm ${
                filterStatus === RedemptionStatus.PENDING
                  ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
                  : 'glass text-white/60 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Clock className="w-4 h-4" />
              รอดำเนินการ ({getStatusCount(RedemptionStatus.PENDING)})
            </motion.button>

            <motion.button
              onClick={() => setFilterStatus(RedemptionStatus.APPROVED)}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm ${
                filterStatus === RedemptionStatus.APPROVED
                  ? 'bg-blue-400/20 text-blue-400 border border-blue-400/30'
                  : 'glass text-white/60 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CheckCircle className="w-4 h-4" />
              อนุมัติแล้ว ({getStatusCount(RedemptionStatus.APPROVED)})
            </motion.button>

            <motion.button
              onClick={() => setFilterStatus(RedemptionStatus.PROCESSING)}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm ${
                filterStatus === RedemptionStatus.PROCESSING
                  ? 'bg-purple-400/20 text-purple-400 border border-purple-400/30'
                  : 'glass text-white/60 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Package className="w-4 h-4" />
              กำลังจัดเตรียม ({getStatusCount(RedemptionStatus.PROCESSING)})
            </motion.button>

            <motion.button
              onClick={() => setFilterStatus(RedemptionStatus.SHIPPED)}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm ${
                filterStatus === RedemptionStatus.SHIPPED
                  ? 'bg-indigo-400/20 text-indigo-400 border border-indigo-400/30'
                  : 'glass text-white/60 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Truck className="w-4 h-4" />
              จัดส่งแล้ว ({getStatusCount(RedemptionStatus.SHIPPED)})
            </motion.button>

            <motion.button
              onClick={() => setFilterStatus(RedemptionStatus.DELIVERED)}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm ${
                filterStatus === RedemptionStatus.DELIVERED
                  ? 'bg-green-400/20 text-green-400 border border-green-400/30'
                  : 'glass text-white/60 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CheckCircle className="w-4 h-4" />
              สำเร็จแล้ว ({getStatusCount(RedemptionStatus.DELIVERED) + getStatusCount(RedemptionStatus.RECEIVED)})
            </motion.button>

            <motion.button
              onClick={() => setFilterStatus(RedemptionStatus.CANCELLED)}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm ${
                filterStatus === RedemptionStatus.CANCELLED
                  ? 'bg-red-400/20 text-red-400 border border-red-400/30'
                  : 'glass text-white/60 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <XCircle className="w-4 h-4" />
              ยกเลิก ({getStatusCount(RedemptionStatus.CANCELLED) + getStatusCount(RedemptionStatus.REFUNDED)})
            </motion.button>
          </div>
        </div>

        {/* Type Filter & Search */}
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Type Filter */}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-white/80 mb-3">กรองตามประเภท:</h3>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg transition text-sm ${
                    filterType === 'all'
                      ? 'metaverse-button text-white'
                      : 'glass text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ทั้งหมด ({redemptions.length})
                </motion.button>

                <motion.button
                  onClick={() => setFilterType(RewardType.PHYSICAL)}
                  className={`px-3 py-1.5 rounded-lg transition text-sm flex items-center gap-1 ${
                    filterType === RewardType.PHYSICAL
                      ? 'bg-orange-400/20 text-orange-400 border border-orange-400/30'
                      : 'glass text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  📦 ของจริง ({getTypeCount(RewardType.PHYSICAL)})
                </motion.button>

                <motion.button
                  onClick={() => setFilterType(RewardType.AVATAR)}
                  className={`px-3 py-1.5 rounded-lg transition text-sm flex items-center gap-1 ${
                    filterType === RewardType.AVATAR
                      ? 'bg-purple-400/20 text-purple-400 border border-purple-400/30'
                      : 'glass text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🦸 Avatar ({getTypeCount(RewardType.AVATAR)})
                </motion.button>

                <motion.button
                  onClick={() => setFilterType(RewardType.ACCESSORY)}
                  className={`px-3 py-1.5 rounded-lg transition text-sm flex items-center gap-1 ${
                    filterType === RewardType.ACCESSORY
                      ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
                      : 'glass text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  👑 Accessories ({getTypeCount(RewardType.ACCESSORY)})
                </motion.button>

                <motion.button
                  onClick={() => setFilterType(RewardType.BOOST)}
                  className={`px-3 py-1.5 rounded-lg transition text-sm flex items-center gap-1 ${
                    filterType === RewardType.BOOST
                      ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30'
                      : 'glass text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ⚡ Boost ({getTypeCount(RewardType.BOOST)})
                </motion.button>
              </div>
            </div>

            {/* Search */}
            <div className="lg:w-80">
              <h3 className="text-sm font-medium text-white/80 mb-3">ค้นหา:</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Order ID, Username, ชื่อรางวัล..."
                  className="w-full pl-9 pr-4 py-2 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-lg focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List - Compact Design */}
      <div className="space-y-3">
        <AnimatePresence>
    {filteredRedemptions.map((redemption, index) => {
      const statusConfig = getStatusDisplay(redemption.status);
      const isPhysical = redemption.rewardType === RewardType.PHYSICAL;
      
      return (
        <motion.div
          key={redemption.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ delay: index * 0.02 }}
          className="glass-dark rounded-xl p-4 border border-metaverse-purple/30 hover:border-metaverse-purple/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            {/* Reward Image */}
            <div className="flex-shrink-0">
              {redemption.rewardImageUrl ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-metaverse-purple/20 border border-metaverse-purple/30">
                  <img 
                    src={redemption.rewardImageUrl}
                    alt={redemption.rewardName}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-lg">${getRewardTypeIcon(redemption.rewardType)}</div>`;
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-metaverse-purple/20 border border-metaverse-purple/30 flex items-center justify-center text-lg">
                  {getRewardTypeIcon(redemption.rewardType)}
                </div>
              )}
            </div>
            
            {/* Order Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white mb-1 truncate">
                {redemption.rewardName}
              </h3>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-white/60">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(redemption.createdAt).toLocaleDateString('th-TH')}
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-400">{redemption.expCost} EXP</span>
                </div>
                <div>
                  #{redemption.id.slice(-8)}
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-shrink-0">
              {redemption.user && (
                <div className="flex items-center gap-2">
                  <AdminAvatarDisplay
                    userId={redemption.user.id}
                    avatarData={redemption.user.avatarData}
                    basicAvatar={redemption.user.avatar}
                    size="tiny"
                    showAccessories={true}
                  />
                  <div className="hidden md:block">
                    <p className="text-xs text-white/80 font-medium">
                      @{redemption.user.username}
                    </p>
                    <p className="text-xs text-white/50">
                      {redemption.user.school}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Status - ย้ายมาไว้ตรงนี้ */}
            <div className="flex-shrink-0">
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <motion.button
                onClick={() => handleViewDetail(redemption)}
                className="px-3 py-1.5 glass rounded-lg text-white font-medium hover:bg-white/10 transition flex items-center gap-1 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="w-3 h-3" />
                <span className="hidden sm:inline">ดู</span>
              </motion.button>
              
              {/* Show update button for all except cancelled/refunded */}
              {redemption.status !== RedemptionStatus.CANCELLED && 
               redemption.status !== RedemptionStatus.REFUNDED && (
                <motion.button
                  onClick={() => handleUpdateStatus(redemption)}
                  className="px-3 py-1.5 metaverse-button text-white font-medium rounded-lg flex items-center gap-1 text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit className="w-3 h-3" />
                  <span className="hidden sm:inline">จัดการ</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Additional Info for Physical Orders */}
          {isPhysical && redemption.shippingAddress && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-white/60">
              <MapPin className="w-4 h-4" />
              <span>{redemption.shippingAddress.fullName} - {redemption.shippingAddress.district}, {redemption.shippingAddress.province}</span>
              {redemption.trackingNumber && (
                <span className="ml-auto font-mono text-white/40">
                  Tracking: {redemption.trackingNumber}
                </span>
              )}
            </div>
          )}
        </motion.div>
      );
    })}
  </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredRedemptions.length === 0 && (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-xl text-white/40">
            ไม่พบคำสั่งซื้อที่ตรงกับเงื่อนไข
          </p>
          <p className="text-sm text-white/30 mt-2">
            ลองปรับเปลี่ยน Filter หรือค้นหาด้วยคำอื่น
          </p>
        </div>
      )}

      {/* Detail Modal - Same as before */}
      <AnimatePresence>
        {showDetailModal && selectedRedemption && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-dark rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-metaverse-purple/30"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                รายละเอียดคำสั่งซื้อ
              </h3>
              
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-white/60 mb-1">Order ID</p>
                  <p className="font-mono text-white">{selectedRedemption.id}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60 mb-1">วันที่</p>
                  <p className="text-white">
                    {new Date(selectedRedemption.createdAt).toLocaleString('th-TH')}
                  </p>
                </div>
              </div>
              
              {/* Reward Info */}
              <div className="glass rounded-xl p-4 mb-6">
                <div className="flex items-start gap-4">
                  {selectedRedemption.rewardImageUrl ? (
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-metaverse-purple/20 border border-metaverse-purple/30">
                      <img 
                        src={selectedRedemption.rewardImageUrl}
                        alt={selectedRedemption.rewardName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-metaverse-purple/20 border border-metaverse-purple/30 flex items-center justify-center text-4xl">
                      {getRewardTypeIcon(selectedRedemption.rewardType)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-white mb-1">
                      {selectedRedemption.rewardName}
                    </h4>
                    <p className="text-white/60">
                      ประเภท: {selectedRedemption.rewardType}
                    </p>
                    <p className="text-yellow-400 font-medium mt-2">
                      {selectedRedemption.expCost} EXP
                    </p>
                  </div>
                </div>
              </div>
              
              {/* User Info */}
              <div className="glass rounded-xl p-4 mb-6">
                <h4 className="text-lg font-bold text-white mb-3">ข้อมูลผู้ใช้</h4>
                <div className="flex items-start gap-4">
                  {selectedRedemption.user && (
                    <AdminAvatarDisplay
                      userId={selectedRedemption.user.id}
                      avatarData={selectedRedemption.user.avatarData}
                      basicAvatar={selectedRedemption.user.avatar}
                      size="small"
                      showAccessories={true}
                    />
                  )}
                  <div className="space-y-2 text-white/80">
                    <p><strong>Username:</strong> @{selectedRedemption.user?.username}</p>
                    {selectedRedemption.user?.displayName && (
                      <p><strong>ชื่อที่แสดง:</strong> {selectedRedemption.user.displayName}</p>
                    )}
                    <p><strong>โรงเรียน:</strong> {selectedRedemption.user?.school}</p>
                    <p><strong>ระดับชั้น:</strong> {selectedRedemption.user?.grade}</p>
                  </div>
                </div>
              </div>
              
              {/* Shipping Address */}
              {selectedRedemption.shippingAddress && (
                <div className="glass rounded-xl p-4 mb-6">
                  <h4 className="text-lg font-bold text-white mb-3">ที่อยู่จัดส่ง</h4>
                  <div className="space-y-2 text-white/80">
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {selectedRedemption.shippingAddress.fullName} ({selectedRedemption.shippingAddress.phone})
                    </p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <div>
                        <p>{selectedRedemption.shippingAddress.addressLine1}</p>
                        {selectedRedemption.shippingAddress.addressLine2 && (
                          <p>{selectedRedemption.shippingAddress.addressLine2}</p>
                        )}
                        <p>
                          {selectedRedemption.shippingAddress.subDistrict} {selectedRedemption.shippingAddress.district}
                        </p>
                        <p>
                          {selectedRedemption.shippingAddress.province} {selectedRedemption.shippingAddress.postalCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Timeline */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-white mb-3">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-white">สร้างคำสั่งซื้อ</p>
                      <p className="text-sm text-white/60">
                        {new Date(selectedRedemption.createdAt).toLocaleString('th-TH')}
                      </p>
                    </div>
                  </div>
                  
                  {selectedRedemption.updatedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-white">อัพเดทล่าสุด</p>
                        <p className="text-sm text-white/60">
                          {new Date(selectedRedemption.updatedAt).toLocaleString('th-TH')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Admin Notes */}
              {selectedRedemption.adminNotes && (
                <div className="glass rounded-xl p-4 mb-6">
                  <h4 className="text-lg font-bold text-white mb-2">หมายเหตุจากแอดมิน</h4>
                  <p className="text-white/80">{selectedRedemption.adminNotes}</p>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex justify-end gap-4">
                <motion.button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-3 glass rounded-xl text-white font-bold hover:bg-white/10 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ปิด
                </motion.button>
                
                {selectedRedemption.trackingNumber && (
                  <motion.button
                    onClick={() => navigator.clipboard.writeText(selectedRedemption.trackingNumber!)}
                    className="px-6 py-3 glass rounded-xl text-white font-bold hover:bg-white/10 transition flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Copy className="w-4 h-4" />
                    คัดลอก Tracking
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Status Modal - Same as before */}
      <AnimatePresence>
        {showUpdateModal && selectedRedemption && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => !updating && setShowUpdateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-dark rounded-3xl p-8 max-w-md w-full border border-metaverse-purple/30 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                อัพเดทสถานะ
              </h3>
              
              {/* Order Info */}
              <div className="glass rounded-xl p-4 mb-6">
                <p className="text-sm text-white/60">Order #{selectedRedemption.id.slice(-8)}</p>
                <p className="font-medium text-white">{selectedRedemption.rewardName}</p>
                <p className="text-xs text-white/60 mt-1">
                  ประเภท: {selectedRedemption.rewardType} | 
                  ราคา: {selectedRedemption.expCost} EXP
                </p>
              </div>
              
              {/* Status Select */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  สถานะใหม่
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as RedemptionStatus)}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white"
                >
                  {selectedRedemption.rewardType === RewardType.PHYSICAL ? (
                    <>
                      <option value={RedemptionStatus.APPROVED}>✅ อนุมัติแล้ว</option>
                      <option value={RedemptionStatus.PROCESSING}>📦 กำลังจัดเตรียม</option>
                      <option value={RedemptionStatus.SHIPPED}>🚚 จัดส่งแล้ว</option>
                      <option value={RedemptionStatus.DELIVERED}>📍 ส่งถึงแล้ว</option>
                      <option value={RedemptionStatus.RECEIVED}>✅ รับของแล้ว</option>
                      <option value={RedemptionStatus.CANCELLED}>❌ ยกเลิก (ไม่คืน EXP)</option>
                    </>
                  ) : (
                    <>
                      <option value={RedemptionStatus.DELIVERED}>✅ สำเร็จแล้ว</option>
                      <option value={RedemptionStatus.CANCELLED}>❌ ยกเลิกและคืน EXP</option>
                    </>
                  )}
                </select>
              </div>

              {/* Warning Message */}
              {updateStatus === RedemptionStatus.CANCELLED && (
                <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                  <p className="text-yellow-400 text-sm flex items-center gap-2">
                    ⚠️ การยกเลิก:
                  </p>
                  <ul className="text-yellow-300 text-xs mt-1 ml-4">
                    {selectedRedemption.rewardType === RewardType.PHYSICAL ? (
                      <li>• ของจริง: จะไม่คืน EXP</li>
                    ) : (
                      <>
                        <li>• จะคืน {selectedRedemption.expCost} EXP ให้ผู้ใช้</li>
                        <li>• จะลบรางวัลออกจาก inventory</li>
                        <li>• ไม่สามารถย้อนกลับได้</li>
                      </>
                    )}
                  </ul>
                </div>
              )}
              
              {/* Tracking Number */}
              {selectedRedemption.rewardType === RewardType.PHYSICAL && 
               updateStatus === RedemptionStatus.SHIPPED && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="TH123456789"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40"
                  />
                </div>
              )}
              
              {/* Admin Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  หมายเหตุ (ไม่บังคับ)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="หมายเหตุสำหรับการอัพเดท..."
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 resize-none"
                />
              </div>
              
              {/* Actions */}
              <div className="flex gap-4">
                <motion.button
                  onClick={() => setShowUpdateModal(false)}
                  disabled={updating}
                  className="flex-1 py-3 glass border border-metaverse-purple/50 text-white font-bold rounded-xl hover:bg-white/10 transition disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ยกเลิก
                </motion.button>
                
                <motion.button
                  onClick={handleSubmitUpdate}
                  disabled={updating}
                  className="flex-1 py-3 metaverse-button text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {updating ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        ⏳
                      </motion.span>
                      กำลังอัพเดท...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      อัพเดทสถานะ
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