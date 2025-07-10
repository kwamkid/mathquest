// components/admin/FixDigitalRewardsButton.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, AlertCircle, CheckCircle, X } from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  runTransaction, 
  doc,
  updateDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

interface FixDigitalRewardsButtonProps {
  onFixCompleted?: () => void;
}

export default function FixDigitalRewardsButton({ onFixCompleted }: FixDigitalRewardsButtonProps) {
  const [checking, setChecking] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultType, setResultType] = useState<'success' | 'error'>('success');

  // ฟังก์ชันตรวจสอบปัญหา
  const checkDigitalRewards = async () => {
    const digitalTypes = ['avatar', 'accessory', 'titleBadge', 'badge', 'boost'];
    const report: Record<string, number> = {};
    
    for (const rewardType of digitalTypes) {
      const q = query(
        collection(db, 'redemptions'),
        where('rewardType', '==', rewardType),
        where('status', '==', 'approved')
      );
      
      const snapshot = await getDocs(q);
      report[rewardType] = snapshot.size;
    }
    
    return report;
  };

  // ฟังก์ชันแก้ไข
  const fixDigitalRewards = async () => {
    const digitalTypes = ['avatar', 'accessory', 'titleBadge', 'badge', 'boost'];
    let totalFixed = 0;
    
    for (const rewardType of digitalTypes) {
      const q = query(
        collection(db, 'redemptions'),
        where('rewardType', '==', rewardType),
        where('status', '==', 'approved')
      );
      
      const snapshot = await getDocs(q);
      
      for (const redemptionDoc of snapshot.docs) {
        try {
          const updateData: any = {
            status: 'delivered',
            updatedAt: new Date().toISOString(),
            adminNotes: 'Fixed by script: Digital reward auto-delivered'
          };
          
          // ถ้าเป็น boost ให้เพิ่ม timestamp
          if (rewardType === 'boost') {
            const now = new Date();
            const expiresAt = new Date(now.getTime() + 60 * 60000); // 1 ชม.
            updateData.activatedAt = now.toISOString();
            updateData.expiresAt = expiresAt.toISOString();
          }
          
          await updateDoc(doc(db, 'redemptions', redemptionDoc.id), updateData);
          totalFixed++;
        } catch (error) {
          console.error(`Failed to fix ${redemptionDoc.id}:`, error);
        }
      }
    }
    
    return totalFixed;
  };

  // Handler หลัก
  const handleFix = async () => {
    setChecking(true);
    
    try {
      // ตรวจสอบก่อน
      const report = await checkDigitalRewards();
      const total = Object.values(report).reduce((sum, count) => sum + count, 0);
      
      if (total === 0) {
        setResultType('success');
        setResultMessage('ไม่พบ Digital Rewards ที่ต้องแก้ไข ✨');
        setShowResult(true);
        setChecking(false);
        return;
      }
      
      // ถามยืนยัน
      const confirmed = window.confirm(
        `พบ Digital Rewards ที่ต้องแก้ไข ${total} รายการ\n\nต้องการแก้ไขหรือไม่?`
      );
      
      if (!confirmed) {
        setChecking(false);
        return;
      }
      
      // แก้ไข
      setFixing(true);
      const fixed = await fixDigitalRewards();
      
      setResultType('success');
      setResultMessage(`แก้ไขสำเร็จ ${fixed} รายการ! 🎉`);
      setShowResult(true);
      
      // เรียก callback
      onFixCompleted?.();
      
    } catch (error) {
      console.error('Fix error:', error);
      setResultType('error');
      setResultMessage('เกิดข้อผิดพลาดในการแก้ไข');
      setShowResult(true);
    } finally {
      setChecking(false);
      setFixing(false);
    }
  };

  return (
    <>
      {/* Result Dialog */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowResult(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-dark rounded-3xl p-8 max-w-md w-full border border-metaverse-purple/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                {/* Icon */}
                <div className="mb-4">
                  {resultType === 'success' ? (
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                  )}
                </div>

                {/* Message */}
                <h3 className="text-xl font-bold text-white mb-4">
                  {resultType === 'success' ? 'สำเร็จ!' : 'เกิดข้อผิดพลาด'}
                </h3>
                
                <p className="text-white/80 mb-6">
                  {resultMessage}
                </p>

                {/* Button */}
                <motion.button
                  onClick={() => setShowResult(false)}
                  className="px-6 py-3 metaverse-button text-white font-bold rounded-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ตกลง
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Fix Button */}
      <motion.button
        onClick={handleFix}
        disabled={checking || fixing}
        className="px-4 py-2 glass rounded-xl hover:bg-white/10 transition flex items-center gap-2 text-white disabled:opacity-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {checking || fixing ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Wrench className="w-5 h-5" />
            </motion.div>
            {checking ? 'ตรวจสอบ...' : 'แก้ไข...'}
          </>
        ) : (
          <>
            <Wrench className="w-5 h-5 text-yellow-400" />
            Fix Digital Rewards
          </>
        )}
      </motion.button>
    </>
  );
}