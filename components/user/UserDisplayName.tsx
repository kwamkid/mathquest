// components/user/UserDisplayName.tsx
'use client';

import { User } from '@/types';
import { TITLE_BADGES } from '@/lib/data/items';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

interface UserDisplayNameProps {
  user: User;
  className?: string;
  titleClassName?: string;
  showTitle?: boolean;
}

// Cache for title data to avoid repeated Firebase calls
const titleCache = new Map<string, { name: string; color: string }>();

export default function UserDisplayName({ 
  user, 
  className = '',
  titleClassName = '',
  showTitle = true 
}: UserDisplayNameProps) {
  const [titleData, setTitleData] = useState<{ name: string; color: string } | null>(null);
  
  useEffect(() => {
    const loadTitleData = async () => {
      if (!user.currentTitleBadge || !showTitle) {
        setTitleData(null);
        return;
      }
      
      // Check cache first
      if (titleCache.has(user.currentTitleBadge)) {
        setTitleData(titleCache.get(user.currentTitleBadge)!);
        return;
      }
      
      // ลองหาจาก local data ก่อน
      const localData = TITLE_BADGES[user.currentTitleBadge];
      if (localData) {
        const data = {
          name: localData.name,
          color: localData.color || '#FFD700'
        };
        titleCache.set(user.currentTitleBadge, data);
        setTitleData(data);
        return;
      }
      
      // ถ้าไม่มีใน local data ให้ลองดึงจาก Firebase
      try {
        console.log('Searching for title badge in Firebase:', user.currentTitleBadge);
        
        // Method 1: Query by itemId field
        const rewardsQuery = query(
          collection(db, 'rewards'),
          where('itemId', '==', user.currentTitleBadge),
          where('type', '==', 'titleBadge'),
          limit(1)
        );
        
        const snapshot = await getDocs(rewardsQuery);
        console.log('Query results:', snapshot.size, 'documents found');
        
        if (!snapshot.empty) {
          const rewardData = snapshot.docs[0].data();
          console.log('Found title badge data:', rewardData);
          
          const data = {
            name: rewardData.name || user.currentTitleBadge,
            color: rewardData.color || '#FFD700'
          };
          titleCache.set(user.currentTitleBadge, data);
          setTitleData(data);
          return;
        } else {
          console.log('No title badge found with itemId:', user.currentTitleBadge);
          
          // Method 2: Try to get by document ID as fallback
          const docRef = collection(db, 'rewards');
          const docQuery = query(
            docRef,
            where('type', '==', 'titleBadge'),
            limit(20) // Get more to check
          );
          
          const allTitleBadges = await getDocs(docQuery);
          console.log('All title badges in system:', allTitleBadges.size);
          
          allTitleBadges.forEach(doc => {
            const data = doc.data();
            console.log('Title badge:', doc.id, 'itemId:', data.itemId, 'name:', data.name);
          });
        }
      } catch (error) {
        console.error('Error loading title badge:', error);
      }
      
      // ถ้าไม่มีทั้ง local และ Firebase ให้ใช้ default
      const defaultData = {
        name: user.currentTitleBadge.replace(/title-/g, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        color: '#FFD700'
      };
      titleCache.set(user.currentTitleBadge, defaultData);
      setTitleData(defaultData);
    };
    
    loadTitleData();
  }, [user.currentTitleBadge, showTitle]);

  // Helper function to check if color is gradient
  const isGradient = (color: string) => {
    return color.includes('linear-gradient') || color.includes('radial-gradient');
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {titleData && (
        <span 
          className={`font-bold ${titleClassName}`}
          style={isGradient(titleData.color) ? {
            background: titleData.color,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent'
          } : {
            color: titleData.color
          }}
        >
          {titleData.name}
        </span>
      )}
      <span className={titleData ? '' : 'font-bold'}>
        {user.displayName || user.username}
      </span>
    </span>
  );
}