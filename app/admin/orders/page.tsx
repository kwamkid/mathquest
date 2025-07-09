// app/admin/orders/page.tsx
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
import { updateRedemptionStatus } from '@/lib/firebase/rewards';
import { Redemption, RedemptionStatus, RewardType } from '@/types/avatar';
import { User } from '@/types';
import { useDialog } from '@/components/ui/Dialog';
import AdminAvatarDisplay from '@/components/admin/AdminAvatarDisplay';
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
  const [activeTab, setActiveTab] = useState<'pending' | 'processing' | 'completed' | 'cancelled'>('pending');
  
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
  }, [redemptions, searchQuery, filterType, activeTab]);

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

    // Tab filter
    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(r => 
          r.status === RedemptionStatus.PENDING || 
          r.status === RedemptionStatus.APPROVED
        );
        break;
      case 'processing':
        filtered = filtered.filter(r => 
          r.status === RedemptionStatus.PROCESSING || 
          r.status === RedemptionStatus.SHIPPED
        );
        break;
      case 'completed':
        filtered = filtered.filter(r => 
          r.status === RedemptionStatus.DELIVERED || 
          r.status === RedemptionStatus.RECEIVED
        );
        break;
      case 'cancelled':
        filtered = filtered.filter(r => 
          r.status === RedemptionStatus.CANCELLED || 
          r.status === RedemptionStatus.REFUNDED
        );
        break;
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

    console.log('Starting update:', {
      redemptionId: selectedRedemption.id,
      currentStatus: selectedRedemption.status,
      newStatus: updateStatus,
      rewardType: selectedRedemption.rewardType
    });

    setUpdating(true);
    try {
      // ถ้าเป็นการยกเลิก digital reward ให้ใช้ status REFUNDED แทน CANCELLED
      let finalStatus = updateStatus;
      if (updateStatus === RedemptionStatus.CANCELLED && 
          selectedRedemption.rewardType !== RewardType.PHYSICAL) {
        finalStatus = RedemptionStatus.REFUNDED;
        console.log('Changed status to REFUNDED for digital reward');
      }

      console.log('Calling updateRedemptionStatus with:', finalStatus);

      const result = await updateRedemptionStatus(
        selectedRedemption.id,
        finalStatus,
        trackingNumber || undefined,
        adminNotes || 'ยกเลิกและคืน EXP โดย Admin'
      );

      console.log('updateRedemptionStatus result:', result);

      if (result.success) {
        // ถ้าเป็นการ refund digital reward ต้องคืน EXP
        if (finalStatus === RedemptionStatus.REFUNDED) {
          console.log('Refunding EXP to user:', selectedRedemption.userId);
          
          // คืน EXP ให้ user
          const userRef = doc(db, 'users', selectedRedemption.userId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const currentExp = userDoc.data().experience || 0;
            const newExp = currentExp + selectedRedemption.expCost;
            
            console.log('Updating user EXP:', {
              currentExp,
              refundAmount: selectedRedemption.expCost,
              newExp
            });
            
            await updateDoc(userRef, {
              experience: newExp
            });
            
            console.log('EXP refunded successfully');
          } else {
            console.error('User document not found:', selectedRedemption.userId);
          }
        }

        await loadRedemptions();
        setShowUpdateModal(false);
        successDialog.showDialog(
          finalStatus === RedemptionStatus.REFUNDED 
            ? `ยกเลิกและคืน ${selectedRedemption.expCost} EXP เรียบร้อยแล้ว`
            : 'อัพเดทสถานะเรียบร้อยแล้ว'
        );
      } else {
        console.error('Update failed:', result.message);
        errorDialog.showDialog(result.message);
      }
    } catch (error) {
      console.error('Update error:', error);
      errorDialog.showDialog('เกิดข้อผิดพลาดในการอัพเดท');
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
        label: 'ส่งถึงแล้ว',
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

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'pending':
        return redemptions.filter(r => 
          r.status === RedemptionStatus.PENDING || 
          r.status === RedemptionStatus.APPROVED
        ).length;
      case 'processing':
        return redemptions.filter(r => 
          r.status === RedemptionStatus.PROCESSING || 
          r.status === RedemptionStatus.SHIPPED
        ).length;
      case 'completed':
        return redemptions.filter(r => 
          r.status === RedemptionStatus.DELIVERED || 
          r.status === RedemptionStatus.RECEIVED
        ).length;
      case 'cancelled':
        return redemptions.filter(r => 
          r.status === RedemptionStatus.CANCELLED || 
          r.status === RedemptionStatus.REFUNDED
        ).length;
      default:
        return 0;
    }
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
      {/* Header */}
      <div className="mb-8">
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div 
          className="glass-dark rounded-xl p-4 border border-yellow-400/30"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-yellow-400">{getTabCount('pending')}</p>
              <p className="text-sm text-white/60">รอดำเนินการ</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400/50" />
          </div>
        </motion.div>

        <motion.div 
          className="glass-dark rounded-xl p-4 border border-blue-400/30"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-blue-400">{getTabCount('processing')}</p>
              <p className="text-sm text-white/60">กำลังจัดส่ง</p>
            </div>
            <Truck className="w-8 h-8 text-blue-400/50" />
          </div>
        </motion.div>

        <motion.div 
          className="glass-dark rounded-xl p-4 border border-green-400/30"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-green-400">{getTabCount('completed')}</p>
              <p className="text-sm text-white/60">สำเร็จแล้ว</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400/50" />
          </div>
        </motion.div>

        <motion.div 
          className="glass-dark rounded-xl p-4 border border-red-400/30"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-red-400">{getTabCount('cancelled')}</p>
              <p className="text-sm text-white/60">ยกเลิก</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400/50" />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="glass-dark rounded-t-xl border border-metaverse-purple/30 border-b-0">
        <div className="flex">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 px-6 py-4 font-medium transition relative ${
              activeTab === 'pending'
                ? 'text-white'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              รอดำเนินการ
              {getTabCount('pending') > 0 && (
                <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-400 text-xs rounded-full">
                  {getTabCount('pending')}
                </span>
              )}
            </span>
            {activeTab === 'pending' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-metaverse-purple to-metaverse-pink"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('processing')}
            className={`flex-1 px-6 py-4 font-medium transition relative ${
              activeTab === 'processing'
                ? 'text-white'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              กำลังจัดส่ง
              {getTabCount('processing') > 0 && (
                <span className="px-2 py-0.5 bg-blue-400/20 text-blue-400 text-xs rounded-full">
                  {getTabCount('processing')}
                </span>
              )}
            </span>
            {activeTab === 'processing' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-metaverse-purple to-metaverse-pink"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 px-6 py-4 font-medium transition relative ${
              activeTab === 'completed'
                ? 'text-white'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            สำเร็จแล้ว
            {activeTab === 'completed' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-metaverse-purple to-metaverse-pink"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('cancelled')}
            className={`flex-1 px-6 py-4 font-medium transition relative ${
              activeTab === 'cancelled'
                ? 'text-white'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            ยกเลิก
            {activeTab === 'cancelled' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-metaverse-purple to-metaverse-pink"
              />
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-dark rounded-b-xl p-4 mb-6 border border-metaverse-purple/30 border-t-0">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหา Order ID, Username, ชื่อรางวัล..."
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
            <option value={RewardType.PHYSICAL}>📦 ของจริง</option>
            <option value={RewardType.AVATAR}>🦸 Avatar</option>
            <option value={RewardType.ACCESSORY}>👑 Accessories</option>
            <option value={RewardType.TITLE_BADGE}>🏆 Title Badge</option>
            <option value={RewardType.BOOST}>⚡ Boost</option>
            <option value={RewardType.BADGE}>🎖️ Badge</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
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
                transition={{ delay: index * 0.05 }}
                className="glass-dark rounded-xl p-4 border border-metaverse-purple/30"
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Reward Image */}
                      <div className="flex-shrink-0">
                        {redemption.rewardImageUrl ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-metaverse-purple/20 border border-metaverse-purple/30">
                            <img 
                              src={redemption.rewardImageUrl}
                              alt={redemption.rewardName}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-2xl">${getRewardTypeIcon(redemption.rewardType)}</div>`;
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-metaverse-purple/20 border border-metaverse-purple/30 flex items-center justify-center text-2xl">
                            {getRewardTypeIcon(redemption.rewardType)}
                          </div>
                        )}
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-white mb-0.5">
                              {redemption.rewardName}
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                              <div>
                                Order: <span className="font-mono text-white/80">#{redemption.id.slice(-8)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(redemption.createdAt).toLocaleDateString('th-TH')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Zap className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-400">{redemption.expCost} EXP</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Status */}
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </div>
                        
                        {/* User Info */}
                        <div className="mt-2 glass rounded-lg p-2 flex items-center gap-2">
                          {redemption.user && (
                            <AdminAvatarDisplay
                              userId={redemption.user.id}
                              avatarData={redemption.user.avatarData}
                              basicAvatar={redemption.user.avatar}
                              size="tiny"
                              showAccessories={true}
                            />
                          )}
                          <div>
                            <p className="text-xs text-white/80">
                              <strong>ผู้ใช้:</strong> @{redemption.user?.username}
                              {redemption.user?.displayName && ` (${redemption.user.displayName})`}
                            </p>
                            <p className="text-xs text-white/60">
                              {redemption.user?.school} - {redemption.user?.grade}
                            </p>
                          </div>
                        </div>
                        
                        {/* Shipping Preview (if physical) */}
                        {isPhysical && redemption.shippingAddress && (
                          <div className="mt-2 flex items-start gap-2 text-xs text-white/60">
                            <MapPin className="w-4 h-4 mt-0.5" />
                            <div>
                              <p>{redemption.shippingAddress.fullName}</p>
                              <p>{redemption.shippingAddress.district}, {redemption.shippingAddress.province}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Digital Reward Notice */}
                        {!isPhysical && redemption.status === RedemptionStatus.DELIVERED && (
                          <div className="mt-2 glass rounded-lg p-1.5 inline-block bg-green-400/10 border border-green-400/30">
                            <p className="text-xs text-green-400 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              ได้รับรางวัลแล้วทันที
                            </p>
                          </div>
                        )}
                        
                        {/* Tracking Number */}
                        {redemption.trackingNumber && (
                          <div className="mt-2 glass rounded-lg p-1.5 inline-block">
                            <p className="text-xs text-white/60">Tracking:</p>
                            <code className="text-xs text-white font-mono">
                              {redemption.trackingNumber}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 lg:justify-center">
                      <motion.button
                        onClick={() => handleViewDetail(redemption)}
                        className="px-3 py-1.5 glass rounded-lg text-white font-medium hover:bg-white/10 transition flex items-center gap-2 text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Eye className="w-3 h-3" />
                        <span className="hidden sm:inline">รายละเอียด</span>
                      </motion.button>
                    
                    {/* Show update button for all except cancelled/refunded */}
                    {redemption.status !== RedemptionStatus.CANCELLED && 
                     redemption.status !== RedemptionStatus.REFUNDED && (
                      <motion.button
                        onClick={() => handleUpdateStatus(redemption)}
                        className="px-3 py-1.5 metaverse-button text-white font-medium rounded-lg flex items-center gap-2 text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Edit className="w-3 h-3" />
                        <span className="hidden sm:inline">
                          {redemption.rewardType === RewardType.PHYSICAL ? 'อัพเดท' : 'จัดการ'}
                        </span>
                      </motion.button>
                    )}
                  </div>
                </div>
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
            ไม่พบคำสั่งซื้อ
          </p>
        </div>
      )}

      {/* Detail Modal */}
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

      {/* Update Status Modal */}
      <AnimatePresence>
        {showUpdateModal && selectedRedemption && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowUpdateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-dark rounded-3xl p-8 max-w-md w-full border border-metaverse-purple/30"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                อัพเดทสถานะ
              </h3>
              
              {/* Order Info */}
              <div className="glass rounded-xl p-4 mb-6">
                <p className="text-sm text-white/60">Order #{selectedRedemption.id.slice(-8)}</p>
                <p className="font-medium text-white">{selectedRedemption.rewardName}</p>
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
                      <option value={RedemptionStatus.APPROVED}>อนุมัติแล้ว</option>
                      <option value={RedemptionStatus.PROCESSING}>กำลังจัดเตรียม</option>
                      <option value={RedemptionStatus.SHIPPED}>จัดส่งแล้ว</option>
                      <option value={RedemptionStatus.DELIVERED}>ส่งถึงแล้ว</option>
                      <option value={RedemptionStatus.RECEIVED}>รับของแล้ว</option>
                      <option value={RedemptionStatus.CANCELLED}>ยกเลิก</option>
                    </>
                  ) : (
                    <>
                      <option value={RedemptionStatus.CANCELLED}>ยกเลิก (คืน EXP)</option>
                    </>
                  )}
                </select>
              </div>
              
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
                  onClick={() => {
                    console.log('Submit button clicked');
                    console.log('Current modal state:', {
                      showUpdateModal,
                      selectedRedemption: selectedRedemption?.id,
                      updateStatus,
                      updating
                    });
                    handleSubmitUpdate();
                  }}
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