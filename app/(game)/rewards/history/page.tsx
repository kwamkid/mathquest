// app/(game)/rewards/history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/firebase/auth';
import { getUserRedemptions, cancelRedemption } from '@/lib/firebase/rewards';
import { User } from '@/types';
import { Redemption, RedemptionStatus, RewardType } from '@/types/avatar';
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
  ExternalLink,
  Calendar,
  Filter,
  Search
} from 'lucide-react';

export default function RedemptionHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRedemption, setSelectedRedemption] = useState<Redemption | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

      const redemptionsList = await getUserRedemptions(userData.id);
      setRedemptions(redemptionsList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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
        
        // Update user EXP
        setUser({
          ...user,
          experience: user.experience + selectedRedemption.expCost
        });
        
        alert('ยกเลิกและคืน EXP เรียบร้อยแล้ว');
        setShowCancelModal(false);
        setSelectedRedemption(null);
        setCancelReason('');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('เกิดข้อผิดพลาดในการยกเลิก');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-metaverse-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          📋
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metaverse-black py-8">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/rewards')}
                className="p-2 glass rounded-full hover:bg-white/10 transition"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-8 h-8 text-metaverse-purple" />
                  ประวัติการแลกรางวัล
                </h1>
                <p className="text-white/60">ติดตามสถานะรางวัลที่แลกไป</p>
              </div>
            </div>
            
            {/* Refresh Button */}
            <motion.button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 glass rounded-xl hover:bg-white/10 transition disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-dark rounded-2xl p-4 mb-6 border border-metaverse-purple/30"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="text-sm text-white/60 mb-2 block">สถานะ:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white"
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
              <label className="text-sm text-white/60 mb-2 block">ประเภท:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white"
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
              <label className="text-sm text-white/60 mb-2 block">ค้นหา:</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ชื่อรางวัล..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Redemptions List */}
        <div className="space-y-4">
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
                  className="glass-dark rounded-2xl p-6 border border-metaverse-purple/30"
                >
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Icon & Basic Info */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Reward Icon */}
                      <div className="text-4xl">
                        {getRewardTypeIcon(redemption.rewardType)}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {redemption.rewardName}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(redemption.createdAt)}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400 font-medium">
                              {redemption.expCost} EXP
                            </span>
                          </div>
                        </div>
                        
                        {/* Status */}
                        <div className="mt-3">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions & Details */}
                    <div className="flex flex-col gap-3 lg:items-end">
                      {/* Tracking Number */}
                      {redemption.trackingNumber && (
                        <div className="glass rounded-lg px-3 py-2">
                          <p className="text-xs text-white/60 mb-1">Tracking Number:</p>
                          <div className="flex items-center gap-2">
                            <code className="text-sm text-white font-mono">
                              {redemption.trackingNumber}
                            </code>
                            <button
                              onClick={() => navigator.clipboard.writeText(redemption.trackingNumber!)}
                              className="text-white/60 hover:text-white transition"
                              title="คัดลอก"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Boost Info */}
                      {redemption.rewardType === RewardType.BOOST && redemption.expiresAt && (
                        <div className="text-sm text-white/60">
                          {new Date(redemption.expiresAt) > new Date() ? (
                            <span className="text-green-400">
                              Active จนถึง {formatDate(redemption.expiresAt)}
                            </span>
                          ) : (
                            <span className="text-red-400">หมดอายุแล้ว</span>
                          )}
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        {/* View Details */}
                        <motion.button
                          onClick={() => setSelectedRedemption(redemption)}
                          className="px-4 py-2 glass rounded-xl text-white font-medium hover:bg-white/10 transition text-sm"
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
                            className="px-4 py-2 glass rounded-xl text-red-400 font-medium hover:bg-red-400/10 transition text-sm border border-red-400/30"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            ยกเลิก
                          </motion.button>
                        )}
                        
                        {/* Confirm Received */}
                        {redemption.status === RedemptionStatus.DELIVERED && isPhysical && (
                          <motion.button
                            className="px-4 py-2 metaverse-button text-white font-medium rounded-xl text-sm"
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
            className="text-center py-20"
          >
            <Gift className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-xl text-white/40">
              {redemptions.length === 0 
                ? 'ยังไม่มีประวัติการแลกรางวัล'
                : 'ไม่พบรางวัลที่ตรงกับการค้นหา'
              }
            </p>
            {redemptions.length === 0 && (
              <motion.button
                onClick={() => router.push('/rewards')}
                className="mt-4 px-6 py-3 metaverse-button text-white font-bold rounded-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ไปแลกรางวัล
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
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
              className="glass-dark rounded-3xl p-8 max-w-2xl w-full border border-metaverse-purple/30 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                รายละเอียดการแลกรางวัล
              </h3>
              
              {/* Order ID */}
              <div className="mb-6">
                <p className="text-sm text-white/60 mb-1">Order ID:</p>
                <code className="text-lg font-mono text-white">{selectedRedemption.id}</code>
              </div>
              
              {/* Reward Info */}
              <div className="glass rounded-xl p-4 mb-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">
                    {getRewardTypeIcon(selectedRedemption.rewardType)}
                  </div>
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
              
              {/* Timeline */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-white mb-4">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-white">สร้างคำสั่งซื้อ</p>
                      <p className="text-sm text-white/60">{formatDate(selectedRedemption.createdAt)}</p>
                    </div>
                  </div>
                  
                  {selectedRedemption.updatedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-white">อัพเดทล่าสุด</p>
                        <p className="text-sm text-white/60">{formatDate(selectedRedemption.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Shipping Address */}
              {selectedRedemption.shippingAddress && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-white mb-4">ที่อยู่จัดส่ง</h4>
                  <div className="glass rounded-xl p-4 text-white/80">
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
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-white mb-4">หมายเหตุจากแอดมิน</h4>
                  <div className="glass rounded-xl p-4 text-white/80">
                    {selectedRedemption.adminNotes}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex justify-end">
                <motion.button
                  onClick={() => setSelectedRedemption(null)}
                  className="px-6 py-3 glass rounded-xl text-white font-bold hover:bg-white/10 transition"
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

      {/* Cancel Modal */}
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
              className="glass-dark rounded-3xl p-8 max-w-md w-full border border-metaverse-purple/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  ยืนยันการยกเลิก
                </h3>
                <p className="text-white/60">
                  คุณต้องการยกเลิกการแลกรางวัลนี้ใช่หรือไม่?
                </p>
              </div>
              
              {/* Reward Info */}
              <div className="glass rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {getRewardTypeIcon(selectedRedemption.rewardType)}
                  </div>
                  <div>
                    <p className="font-bold text-white">{selectedRedemption.rewardName}</p>
                    <p className="text-sm text-yellow-400">{selectedRedemption.expCost} EXP</p>
                  </div>
                </div>
              </div>
              
              {/* Cancel Reason */}
              <div className="mb-6">
                <label className="text-sm text-white/60 mb-2 block">
                  เหตุผลในการยกเลิก (ไม่บังคับ):
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="บอกเราว่าทำไมคุณถึงต้องการยกเลิก..."
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 resize-none"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-4">
                <motion.button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="flex-1 py-3 glass border border-metaverse-purple/50 text-white font-bold rounded-xl hover:bg-white/10 transition disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ไม่ยกเลิก
                </motion.button>
                
                <motion.button
                  onClick={handleCancelRedemption}
                  disabled={cancelling}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {cancelling ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        ⏳
                      </motion.span>
                      กำลังยกเลิก...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      ยืนยันยกเลิก
                    </>
                  )}
                </motion.button>
              </div>
              
              <p className="text-xs text-white/40 text-center mt-4">
                * EXP จะถูกคืนให้ทันทีหลังยกเลิก
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}