// hooks/useAvatarData.ts

import { useState, useEffect } from 'react';
import { UserAvatarData, AccessoryType } from '@/types/avatar';
import { getPremiumAvatarData, getAccessoryData } from '@/lib/data/items';
import { getReward } from '@/lib/firebase/rewards';

interface UseAvatarDataReturn {
  avatarUrl?: string;
  accessoryUrls: Partial<Record<AccessoryType, string>>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Cache for loaded URLs to avoid repeated Firebase calls
const urlCache = new Map<string, string>();

// Cache timeout (5 minutes)
const CACHE_TIMEOUT = 5 * 60 * 1000;
const cacheTimestamps = new Map<string, number>();

// Check if cache is still valid
const isCacheValid = (key: string): boolean => {
  const timestamp = cacheTimestamps.get(key);
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_TIMEOUT;
};

// Get URL from cache or load it
const getUrlWithCache = async (itemId: string, itemType: 'avatar' | 'accessory'): Promise<string | null> => {
  // Check cache first
  if (urlCache.has(itemId) && isCacheValid(itemId)) {
    return urlCache.get(itemId) || null;
  }

  try {
    let url: string | null = null;

    // Try local database first
    if (itemType === 'avatar') {
      const localData = getPremiumAvatarData(itemId);
      if (localData?.svgUrl) {
        url = localData.svgUrl;
      }
    } else {
      const localData = getAccessoryData(itemId);
      if (localData?.svgUrl) {
        url = localData.svgUrl;
      }
    }

    // If not found locally, try Firebase
    if (!url) {
      const rewardData = await getReward(itemId);
      if (rewardData?.imageUrl) {
        url = rewardData.imageUrl;
      }
    }

    // Cache the result
    if (url) {
      urlCache.set(itemId, url);
      cacheTimestamps.set(itemId, Date.now());
    }

    return url;
  } catch (error) {
    console.error(`Error loading ${itemType} URL:`, error);
    return null;
  }
};

export function useAvatarData(
  userId: string,
  avatarData?: UserAvatarData,
  basicAvatar?: string
): UseAvatarDataReturn {
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [accessoryUrls, setAccessoryUrls] = useState<Partial<Record<AccessoryType, string>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load avatar URL
  const loadAvatarUrl = async () => {
    // ✅ เช็คให้แน่ใจว่า avatarData มีอยู่และมี currentAvatar
    if (!avatarData?.currentAvatar) {
      console.log('No avatarData or currentAvatar found for user:', userId);
      return;
    }

    const { currentAvatar } = avatarData;
    
    // ✅ เช็คว่ามี id ก่อนใช้
    if (currentAvatar.type === 'premium' && currentAvatar.id) {
      const url = await getUrlWithCache(currentAvatar.id, 'avatar');
      if (url) {
        setAvatarUrl(url);
      }
    }
  };

  // Load accessory URLs
  const loadAccessoryUrls = async () => {
    // ✅ เช็คให้แน่ใจว่า avatarData มีอยู่และมี currentAvatar
    if (!avatarData?.currentAvatar) {
      console.log('No avatarData or currentAvatar found for accessories:', userId);
      return;
    }

    const { currentAvatar } = avatarData;
    
    // ✅ เช็คว่ามี accessories object ก่อนใช้
    if (!currentAvatar.accessories) {
      console.log('No accessories found for user:', userId);
      return;
    }

    const urls: Partial<Record<AccessoryType, string>> = {};

    // Load all accessories in parallel
    const loadPromises = Object.entries(currentAvatar.accessories)
      .filter(([_, id]) => id) // Only load if accessory is equipped
      .map(async ([type, id]) => {
        if (id) {
          const url = await getUrlWithCache(id, 'accessory');
          if (url) {
            urls[type as AccessoryType] = url;
          }
        }
      });

    await Promise.all(loadPromises);
    setAccessoryUrls(urls);
  };

  // Main loading function
  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ เพิ่มการตรวจสอบก่อนโหลดข้อมูล
      if (!userId) {
        console.log('No userId provided');
        setLoading(false);
        return;
      }

      // Load both avatar and accessories in parallel
      await Promise.all([
        loadAvatarUrl(),
        loadAccessoryUrls()
      ]);
    } catch (err) {
      console.error('Error loading avatar data:', err);
      setError('Failed to load avatar data');
    } finally {
      setLoading(false);
    }
  };

  // Refresh function to force reload
  const refresh = async () => {
    // ✅ เช็คก่อนลบ cache
    if (avatarData?.currentAvatar?.id) {
      urlCache.delete(avatarData.currentAvatar.id);
      cacheTimestamps.delete(avatarData.currentAvatar.id);
    }
    
    // ✅ เช็คก่อนลบ accessories cache
    if (avatarData?.currentAvatar?.accessories) {
      Object.values(avatarData.currentAvatar.accessories).forEach(id => {
        if (id) {
          urlCache.delete(id);
          cacheTimestamps.delete(id);
        }
      });
    }

    // Reload
    await loadAllData();
  };

  // Load data when avatarData changes
  useEffect(() => {
    if (userId) {
      // ✅ โหลดแม้ว่า avatarData จะไม่มี (สำหรับ basic avatar)
      loadAllData();
    } else {
      setLoading(false);
    }
  }, [
    userId, 
    avatarData?.currentAvatar?.id, 
    avatarData?.currentAvatar?.type
  ]);

  // Also reload when accessories change
  useEffect(() => {
    if (avatarData?.currentAvatar?.accessories && userId) {
      const accessoryIds = Object.values(avatarData.currentAvatar.accessories)
        .filter(id => id)
        .join(',');
      
      if (accessoryIds) {
        loadAccessoryUrls();
      }
    }
  }, [
    userId,
    avatarData?.currentAvatar?.accessories?.hat,
    avatarData?.currentAvatar?.accessories?.glasses,
    avatarData?.currentAvatar?.accessories?.mask,
    avatarData?.currentAvatar?.accessories?.earring,
    avatarData?.currentAvatar?.accessories?.necklace,
    avatarData?.currentAvatar?.accessories?.background
  ]);

  return {
    avatarUrl,
    accessoryUrls,
    loading,
    error,
    refresh
  };
}

// Hook for preloading multiple avatar data (useful for lists)
export function useMultipleAvatarData(
  users: Array<{
    userId: string;
    avatarData?: UserAvatarData;
    basicAvatar?: string;
  }>
) {
  const [dataMap, setDataMap] = useState<Map<string, UseAvatarDataReturn>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      const newMap = new Map<string, UseAvatarDataReturn>();

      // Load all users' avatar data in parallel
      await Promise.all(
        users.map(async (user) => {
          // For each user, we need to load their data
          // This is a simplified version - in real app might need more complex logic
          const result: UseAvatarDataReturn = {
            avatarUrl: undefined,
            accessoryUrls: {},
            loading: false,
            error: null,
            refresh: async () => {}
          };

          // ✅ เช็คว่ามี avatarData และ currentAvatar ก่อน
          if (user.avatarData?.currentAvatar?.type === 'premium' && user.avatarData.currentAvatar.id) {
            const url = await getUrlWithCache(user.avatarData.currentAvatar.id, 'avatar');
            if (url) result.avatarUrl = url;
          }

          // Load accessories
          if (user.avatarData?.currentAvatar?.accessories) {
            const accessoryUrls: Partial<Record<AccessoryType, string>> = {};
            
            await Promise.all(
              Object.entries(user.avatarData.currentAvatar.accessories)
                .filter(([_, id]) => id)
                .map(async ([type, id]) => {
                  if (id) {
                    const url = await getUrlWithCache(id, 'accessory');
                    if (url) {
                      accessoryUrls[type as AccessoryType] = url;
                    }
                  }
                })
            );
            
            result.accessoryUrls = accessoryUrls;
          }

          newMap.set(user.userId, result);
        })
      );

      setDataMap(newMap);
      setLoading(false);
    };

    if (users.length > 0) {
      loadAll();
    } else {
      setLoading(false);
    }
  }, [users]);

  return { dataMap, loading };
}

// Utility function to get URL from cache without hooks (for non-component use)
export async function getAvatarUrl(itemId: string, itemType: 'avatar' | 'accessory'): Promise<string | null> {
  return getUrlWithCache(itemId, itemType);
}