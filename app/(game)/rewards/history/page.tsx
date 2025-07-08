// app/(game)/rewards/history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getUserRedemptions, cancelRedemption } from '@/lib/firebase/rewards';
import { Redemption, RedemptionStatus, RewardType } from '@/types/avatar';
import { useDialog } from '@/components/ui/Dialog';
import { 
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Gift,
  Zap,
  Crown,
  AlertCircle,
  RefreshCw,
  FileText,
  Copy,
  Calendar,
  Filter,
  Search
} from 'lucide-react';

export default function RedemptionHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRedemption, setSelectedRedemption] = useState<Redemption | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  // Dialogs
  const successDialog = useDialog({ type: 'success' });
  const errorDialog = useDialog({ type: 'error' });
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadRedemptions();
    }
  }, [user]);

  const loadRedemptions = async () => {
    if (!user) return;
    
    try {
      const redemptionsList = await getUserRedemptions(user.id);
      setRedemptions(redemptionsList);
    } catch (error) {
      console.error('Error loading redemptions:', error);
    }
  };

  const handleRefresh = async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      const redemptionsList = await getUserRedemptions(user.id);
      setRedemptions(redemptionsList);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelRedemption = async () => {
    if (!selectedRedemption || !user) return;
    
    setCancelling(true);
    try {
      const result = await cancelRedemption(
        selectedRedemption.id,
        user.id,
        cancelReason
      );
      
      if (result.success) {
        // Update local state
        setRedemptions(redemptions.map(r => 
          r.id === selectedRedemption.id 
            ? { ...r, status: RedemptionStatus.CANCELLED }
            : r
        ));
        
        successDialog.showDialog('ยกเลิกและคืน EXP เรียบร้อยแล้ว');
        setShowCancelModal(false);
        setSelectedRedemption(null);
        setCancelReason('');
      } else {
        errorDialog.showDialog(result.message);
      }
    } catch (error) {
      console.error('Cancel error:', error);
      errorDialog.showDialog('เกิดข้อผิดพลาดในการยกเลิก');
    } finally {
      setCancelling(false);
    }
  };

  // Filter redemptions
  const filteredRedemptions = redemptions.filter(redemption => {
    // Status filter
    if (filterStatus !== 'all' && redemption.status !== filterStatus) return false;
    
    // Type filter
    if (filterType !== 'all' && redemption.rewardType !== filterType) return false;
    
    // Search filter
    if (searchQuery && !redemption.rewardName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Get status display
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

  // Get reward type icon
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

  // Render reward icon or image
  const renderRewardIcon = (redemption: Redemption) => {
    if (redemption.rewardImageUrl) {
      return (
        <div className="w-10 h-10 bg-black rounded-lg overflow-hidden">
          <img 
            src={redemption.rewardImageUrl} 
            alt={redemption.rewardName}
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback to emoji if image fails
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-2xl">${getRewardTypeIcon(redemption.rewardType)}</div>`;
              }
            }}
          />
        </div>
      );
    }
    return (
      <div className="text-3xl">
        {getRewardTypeIcon(redemption.rewardType)}
      </div>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen max-h-screen bg-metaverse-black flex flex-col overflow-hidden">
      {/* Dialogs */}
      <successDialog.Dialog />
      <errorDialog.Dialog />
      
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
                onClick={() => router.push('/rewards')}
                className="p-2 glass rounded-full hover:bg-white/10 transition"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 md:w-8 md:h-8 text-metaverse-purple" />
                  ประวัติการแลกรางวัล
                </h1>
                <p className="text-white/60 text-xs md:text-sm">ติดตามสถานะรางวัลที่แลกไป</p>
              </div>
            </div>
            
            {/* Refresh Button */}
            <motion.button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 glass rounded-lg hover:bg-white/10 transition disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </motion.div>

        {/* Filters - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-dark rounded-xl p-3 mb-3 border border-metaverse-purple/30"
        >
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="text-xs text-white/60 mb-1 block">สถานะ:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-1.5 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-lg focus:outline-none focus:border-metaverse-pink text-white text-sm"
              >
                <option value="all">ทั้งหมด</option>
                <option value={RedemptionStatus.PENDING}>รอดำเนินการ</option>
                <option value={RedemptionStatus.APPROVED}>อนุมัติแล้ว</option>
                <option value={RedemptionStatus.PROCESSING}>กำลังจัดเตรียม</option>
                <option value={RedemptionStatus.SHIPPED}>จัดส่งแล้ว</option>
                <option value={RedemptionStatus.DELIVERED}>ส่งถึงแล้ว</option>
                <option value={RedemptionStatus.RECEIVED}>รับของแล้ว</option>
                <option value={RedemptionStatus.CANCELLED}>ยกเลิกแล้ว</option>
              </select>
            </div>
            
            {/* Type Filter */}
            <div className="flex-1">
              <label className="text-xs text-white/60 mb-1 block">ประเภท:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-1.5 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-lg focus:outline-none focus:border-metaverse-pink text-white text-sm"
              >
                <option value="all">ทั้งหมด</option>
                <option value={RewardType.AVATAR}>Avatar</option>
                <option value={RewardType.ACCESSORY}>Accessories</option>
                <option value={RewardType.TITLE_BADGE}>Title Badge</option>
                <option value={RewardType.BOOST}>Boost</option>
                <option value={RewardType.PHYSICAL}>ของจริง</option>
              </select>
            </div>
            
            {/* Search */}
            <div className="flex-1">
              <label className="text-xs text-white/60 mb-1 block">ค้นหา:</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ชื่อรางวัล..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-lg focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 text-sm"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Redemptions List - Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-3">
          <AnimatePresence>
            {filteredRedemptions.map((redemption, index) => {
              const statusConfig = getStatusDisplay(redemption.status);
              const isPhysical = redemption.rewardType === RewardType.PHYSICAL;
              const canCancel = redemption.status === RedemptionStatus.PENDING && isPhysical;
              
              return (
                <motion.div
                  key={redemption.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-dark rounded-xl p-4 border border-metaverse-purple/30"
                >
                  <div className="flex flex-col lg:flex-row gap-3">
                    {/* Icon & Basic Info */}
                    <div className="flex items-start gap-3 flex-1">
                      {/* Reward Icon */}
                      {renderRewardIcon(redemption)}
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-lg font-bold text-white mb-1 truncate">
                          {redemption.rewardName}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span className="hidden sm:inline">{formatDate(redemption.createdAt)}</span>
                            <span className="sm:hidden">
                              {new Date(redemption.createdAt).toLocaleDateString('th-TH', { 
                                day: 'numeric', 
                                month: 'short' 
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-yellow-400" />
                            <span className="text-yellow-400 font-medium">
                              {redemption.expCost} EXP
                            </span>
                          </div>
                        </div>
                        
                        {/* Status */}
                        <div className="mt-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions & Details */}
                    <div className="flex flex-row lg:flex-col gap-2 lg:items-end">
                      {/* Tracking Number - Desktop Only */}
                      {redemption.trackingNumber && (
                        <div className="hidden lg:block glass rounded-lg px-3 py-2">
                          <p className="text-xs text-white/60 mb-1">Tracking:</p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-white font-mono">
                              {redemption.trackingNumber}
                            </code>
                            <button
                              onClick={() => navigator.clipboard.writeText(redemption.trackingNumber!)}
                              className="text-white/60 hover:text-white transition"
                              title="คัดลอก"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Boost Info */}
                      {redemption.rewardType === RewardType.BOOST && redemption.expiresAt && (
                        <div className="text-xs text-white/60">
                          {new Date(redemption.expiresAt) > new Date() ? (
                            <span className="text-green-400">
                              Active จนถึง {new Date(redemption.expiresAt).toLocaleDateString('th-TH')}
                            </span>
                          ) : (
                            <span className="text-red-400">หมดอายุแล้ว</span>
                          )}
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex gap-2 ml-auto lg:ml-0">
                        {/* View Details */}
                        <motion.button
                          onClick={() => setSelectedRedemption(redemption)}
                          className="px-3 py-1.5 glass rounded-lg text-white font-medium hover:bg-white/10 transition text-xs"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          รายละเอียด
                        </motion.button>
                        
                        {/* Cancel Button */}
                        {canCancel && (
                          <motion.button
                            onClick={() => {
                              setSelectedRedemption(redemption);
                              setShowCancelModal(true);
                            }}
                            className="px-3 py-1.5 glass rounded-lg text-red-400 font-medium hover:bg-red-400/10 transition text-xs border border-red-400/30"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            ยกเลิก
                          </motion.button>
                        )}
                        
                        {/* Confirm Received */}
                        {redemption.status === RedemptionStatus.DELIVERED && isPhysical && (
                          <motion.button
                            className="px-3 py-1.5 metaverse-button text-white font-medium rounded-lg text-xs"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            ยืนยันรับของ
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredRedemptions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center py-8">
              <Gift className="w-12 h-12 md:w-16 md:h-16 text-white/20 mx-auto mb-3" />
              <p className="text-lg md:text-xl text-white/40">
                {redemptions.length === 0 
                  ? 'ยังไม่มีประวัติการแลกรางวัล'
                  : 'ไม่พบรางวัลที่ตรงกับการค้นหา'
                }
              </p>
              {redemptions.length === 0 && (
                <motion.button
                  onClick={() => router.push('/rewards')}
                  className="mt-3 px-5 py-2 metaverse-button text-white font-bold rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ไปแลกรางวัล
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Detail Modal - Compact */}
      <AnimatePresence>
        {selectedRedemption && !showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedRedemption(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-dark rounded-2xl p-6 max-w-2xl w-full border border-metaverse-purple/30 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">
                รายละเอียดการแลกรางวัล
              </h3>
              
              {/* Order ID */}
              <div className="mb-4">
                <p className="text-xs text-white/60 mb-1">Order ID:</p>
                <code className="text-sm font-mono text-white">{selectedRedemption.id}</code>
              </div>
              
              {/* Reward Info */}
              <div className="glass rounded-lg p-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-black rounded-lg overflow-hidden flex-shrink-0">
                    {selectedRedemption.rewardImageUrl ? (
                      <img 
                        src={selectedRedemption.rewardImageUrl} 
                        alt={selectedRedemption.rewardName}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        {getRewardTypeIcon(selectedRedemption.rewardType)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-0.5">
                      {selectedRedemption.rewardName}
                    </h4>
                    <p className="text-white/60 text-sm">
                      ประเภท: {selectedRedemption.rewardType}
                    </p>
                    <p className="text-yellow-400 font-medium text-sm mt-1">
                      {selectedRedemption.expCost} EXP
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Timeline */}
              <div className="mb-4">
                <h4 className="text-base font-bold text-white mb-3">Timeline</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5"></div>
                    <div>
                      <p className="text-white text-sm">สร้างคำสั่งซื้อ</p>
                      <p className="text-xs text-white/60">{formatDate(selectedRedemption.createdAt)}</p>
                    </div>
                  </div>
                  
                  {selectedRedemption.updatedAt && (
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5"></div>
                      <div>
                        <p className="text-white text-sm">อัพเดทล่าสุด</p>
                        <p className="text-xs text-white/60">{formatDate(selectedRedemption.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Shipping Address */}
              {selectedRedemption.shippingAddress && (
                <div className="mb-4">
                  <h4 className="text-base font-bold text-white mb-3">ที่อยู่จัดส่ง</h4>
                  <div className="glass rounded-lg p-3 text-white/80 text-sm">
                    <p>{selectedRedemption.shippingAddress.fullName}</p>
                    <p>{selectedRedemption.shippingAddress.phone}</p>
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
              )}
              
              {/* Admin Notes */}
              {selectedRedemption.adminNotes && (
                <div className="mb-4">
                  <h4 className="text-base font-bold text-white mb-3">หมายเหตุจากแอดมิน</h4>
                  <div className="glass rounded-lg p-3 text-white/80 text-sm">
                    {selectedRedemption.adminNotes}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex justify-end">
                <motion.button
                  onClick={() => setSelectedRedemption(null)}
                  className="px-5 py-2 glass rounded-lg text-white font-bold hover:bg-white/10 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ปิด
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Modal - Compact */}
      <AnimatePresence>
        {showCancelModal && selectedRedemption && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => !cancelling && setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-dark rounded-2xl p-6 max-w-md w-full border border-metaverse-purple/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  ยืนยันการยกเลิก
                </h3>
                <p className="text-white/60 text-sm">
                  คุณต้องการยกเลิกการแลกรางวัลนี้ใช่หรือไม่?
                </p>
              </div>
              
              {/* Reward Info */}
              <div className="glass rounded-lg p-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-lg overflow-hidden flex-shrink-0">
                    {selectedRedemption.rewardImageUrl ? (
                      <img 
                        src={selectedRedemption.rewardImageUrl} 
                        alt={selectedRedemption.rewardName}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {getRewardTypeIcon(selectedRedemption.rewardType)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{selectedRedemption.rewardName}</p>
                    <p className="text-xs text-yellow-400">{selectedRedemption.expCost} EXP</p>
                  </div>
                </div>
              </div>
              
              {/* Cancel Reason */}
              <div className="mb-4">
                <label className="text-xs text-white/60 mb-1 block">
                  เหตุผลในการยกเลิก (ไม่บังคับ):
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="บอกเราว่าทำไมคุณถึงต้องการยกเลิก..."
                  className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-lg focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 resize-none text-sm"
                  rows={2}
                />
              </div>
              
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="flex-1 py-2 glass border border-metaverse-purple/50 text-white font-bold rounded-lg hover:bg-white/10 transition disabled:opacity-50 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ไม่ยกเลิก
                </motion.button>
                
                <motion.button
                  onClick={handleCancelRedemption}
                  disabled={cancelling}
                  className="flex-1 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-1 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {cancelling ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="text-base"
                      >
                        ⏳
                      </motion.span>
                      กำลังยกเลิก...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      ยืนยันยกเลิก
                    </>
                  )}
                </motion.button>
              </div>
              
              <p className="text-xs text-white/40 text-center mt-3">
                * EXP จะถูกคืนให้ทันทีหลังยกเลิก
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}