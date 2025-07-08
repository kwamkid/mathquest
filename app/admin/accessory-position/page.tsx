// app/admin/hat-position/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, RotateCcw, Save, Wand2, User, Sparkles, CheckCircle, Star } from 'lucide-react';
import { basicAvatars } from '@/lib/data/avatars';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { RewardType, AccessoryType, PremiumAvatar } from '@/types/avatar';
import EnhancedAvatarDisplay from '@/components/avatar/EnhancedAvatarDisplay';

interface PositionData {
  x: number;
  y: number;
  scale: number;
  rotation?: number;
  anchorPoint?: string;
}

interface SavedPositions {
  [key: string]: PositionData;
}

interface RewardItem {
  id: string;
  name: string;
  type: RewardType;
  imageUrl?: string;
  accessoryType?: AccessoryType;
  rarity?: string;
}

export default function AccessoryPositionPage() {
  // Default positions for each accessory type
  const defaultPositions: Record<AccessoryType, PositionData> = {
    [AccessoryType.HAT]: { x: 0, y: -35, scale: 1.1, rotation: 0, anchorPoint: 'bottom-center' },
    [AccessoryType.GLASSES]: { x: 0, y: -5, scale: 1.0, rotation: 0, anchorPoint: 'center' },
    [AccessoryType.MASK]: { x: 0, y: 0, scale: 1.0, rotation: 0, anchorPoint: 'center' },
    [AccessoryType.EARRING]: { x: 25, y: 0, scale: 0.7, rotation: 0, anchorPoint: 'center' },
    [AccessoryType.NECKLACE]: { x: 0, y: 20, scale: 0.8, rotation: 0, anchorPoint: 'top-center' },
    [AccessoryType.BACKGROUND]: { x: 0, y: 0, scale: 1.5, rotation: 0, anchorPoint: 'center' },
  };

  const [selectedAvatar, setSelectedAvatar] = useState<{ id: string; type: 'basic' | 'premium' }>({ 
    id: basicAvatars[0].id, 
    type: 'basic' 
  });
  const [selectedAccessory, setSelectedAccessory] = useState<RewardItem | null>(null);
  const [position, setPosition] = useState<PositionData>(defaultPositions[AccessoryType.HAT]);
  const [savedPositions, setSavedPositions] = useState<SavedPositions>({});
  const [accessories, setAccessories] = useState<RewardItem[]>([]);
  const [premiumAvatars, setPremiumAvatars] = useState<PremiumAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAvatarTab, setActiveAvatarTab] = useState<'basic' | 'premium'>('basic');
  const [activeAccessoryType, setActiveAccessoryType] = useState<AccessoryType>(AccessoryType.HAT);

  // Test avatar data for preview
  const [testAvatarData, setTestAvatarData] = useState({
    currentAvatar: {
      type: selectedAvatar.type,
      id: selectedAvatar.id,
      accessories: {
        hat: undefined,
        glasses: undefined,
        mask: undefined,
        earring: undefined,
        necklace: undefined,
        background: undefined
      } as Record<AccessoryType, string | undefined>
    },
    unlockedPremiumAvatars: premiumAvatars.map(a => a.id),
    unlockedAccessories: []
  });

  // Load data
  useEffect(() => {
    loadAllData();
  }, []);

  // Update position when avatar or accessory changes
  useEffect(() => {
    if (selectedAccessory) {
      const key = `${selectedAvatar.type}_${selectedAvatar.id}_${selectedAccessory.id}`;
      const savedPos = savedPositions[key];
      if (savedPos) {
        setPosition(savedPos);
      } else {
        const accessoryType = selectedAccessory.accessoryType || AccessoryType.HAT;
        setPosition(defaultPositions[accessoryType]);
      }
    }
  }, [selectedAvatar, selectedAccessory, savedPositions]);

  // Update test avatar data
  useEffect(() => {
    setTestAvatarData({
      currentAvatar: {
        type: selectedAvatar.type,
        id: selectedAvatar.id,
        accessories: {
          hat: selectedAccessory?.accessoryType === AccessoryType.HAT ? selectedAccessory.id : undefined,
          glasses: selectedAccessory?.accessoryType === AccessoryType.GLASSES ? selectedAccessory.id : undefined,
          mask: selectedAccessory?.accessoryType === AccessoryType.MASK ? selectedAccessory.id : undefined,
          earring: selectedAccessory?.accessoryType === AccessoryType.EARRING ? selectedAccessory.id : undefined,
          necklace: selectedAccessory?.accessoryType === AccessoryType.NECKLACE ? selectedAccessory.id : undefined,
          background: selectedAccessory?.accessoryType === AccessoryType.BACKGROUND ? selectedAccessory.id : undefined
        }
      },
      unlockedPremiumAvatars: premiumAvatars.map(a => a.id),
      unlockedAccessories: selectedAccessory ? [selectedAccessory.id] : []
    });
  }, [selectedAvatar, selectedAccessory, premiumAvatars]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load accessories
      const rewardsRef = collection(db, 'rewards');
      const accessoryQuery = query(
        rewardsRef,
        where('type', '==', RewardType.ACCESSORY)
      );
      const accessorySnapshot = await getDocs(accessoryQuery);
      
      const accessoryItems: RewardItem[] = [];
      accessorySnapshot.forEach(doc => {
        const data = doc.data();
        accessoryItems.push({
          id: data.itemId || doc.id,
          name: data.name,
          type: data.type,
          imageUrl: data.imageUrl,
          accessoryType: data.accessoryType,
          rarity: data.rarity
        });
      });
      
      setAccessories(accessoryItems);
      if (accessoryItems.length > 0) {
        setSelectedAccessory(accessoryItems[0]);
        if (accessoryItems[0].accessoryType) {
          setActiveAccessoryType(accessoryItems[0].accessoryType);
        }
      }

      // Load premium avatars
      const avatarQuery = query(
        rewardsRef,
        where('type', '==', RewardType.AVATAR)
      );
      const avatarSnapshot = await getDocs(avatarQuery);
      
      const avatarItems: PremiumAvatar[] = [];
      avatarSnapshot.forEach(doc => {
        const data = doc.data();
        avatarItems.push({
          id: data.itemId || doc.id,
          name: data.name,
          description: data.description,
          svgUrl: data.imageUrl,
          price: data.price,
          rarity: data.rarity || 'rare',
          category: 'special'
        });
      });
      
      setPremiumAvatars(avatarItems);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentPosition = () => {
    if (!selectedAccessory) return;
    
    const key = `${selectedAvatar.type}_${selectedAvatar.id}_${selectedAccessory.id}`;
    setSavedPositions(prev => ({
      ...prev,
      [key]: position
    }));
  };

  const resetPosition = () => {
    if (selectedAccessory?.accessoryType) {
      setPosition(defaultPositions[selectedAccessory.accessoryType]);
    }
  };

  const resetAll = () => {
    if (confirm('ต้องการรีเซ็ตค่าทั้งหมดหรือไม่?')) {
      setSavedPositions({});
      if (selectedAccessory?.accessoryType) {
        setPosition(defaultPositions[selectedAccessory.accessoryType]);
      }
    }
  };

  const copyCode = () => {
    // Group by accessory ID
    const accessoryOverrides: Record<string, Record<string, PositionData>> = {};
    
    Object.entries(savedPositions).forEach(([key, pos]) => {
      const [avatarType, avatarId, accessoryId] = key.split('_');
      if (!accessoryOverrides[accessoryId]) {
        accessoryOverrides[accessoryId] = {};
      }
      // For positioning.ts, we only need avatar ID without type prefix
      accessoryOverrides[accessoryId][avatarId] = pos;
    });

    // Generate code
    let code = `// Accessory position overrides for positioning.ts\n\n`;
    
    // Group by accessory type
    Object.values(AccessoryType).forEach(type => {
      const typeAccessories = accessories.filter(acc => acc.accessoryType === type);
      if (typeAccessories.length === 0) return;
      
      code += `// ${type.toUpperCase()} positions\n`;
      code += `// Add these to ACCESSORY_POSITIONS[AccessoryType.${type.toUpperCase()}].positionOverrides:\n`;
      
      typeAccessories.forEach(accessory => {
        if (accessoryOverrides[accessory.id]) {
          code += `// ${accessory.name}\n`;
          Object.entries(accessoryOverrides[accessory.id]).forEach(([avatarId, pos]) => {
            code += `'${avatarId}': { x: ${pos.x}, y: ${pos.y}, scale: ${pos.scale}${pos.rotation ? `, rotation: ${pos.rotation}` : ''}${pos.anchorPoint && pos.anchorPoint !== 'center' ? `, anchorPoint: '${pos.anchorPoint}'` : ''} },\n`;
          });
        }
      });
      code += '\n';
    });
    
    navigator.clipboard.writeText(code);
    alert('คัดลอก code สำเร็จ!');
  };

  const getAccessoriesByType = (type: AccessoryType) => {
    return accessories.filter(acc => acc.accessoryType === type);
  };

  const getRarityStars = (rarity: string): number => {
    switch (rarity) {
      case 'common': return 1;
      case 'rare': return 2;
      case 'epic': return 3;
      case 'legendary': return 4;
      default: return 1;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-dark rounded-2xl p-6 border border-metaverse-purple/30">
        <h1 className="text-2xl font-bold text-white mb-2">Accessory Position Tester</h1>
        <p className="text-white/60">ปรับตำแหน่ง Accessories ให้เหมาะสมกับแต่ละ Avatar</p>
      </div>

      {/* Main Content */}
      <div className="glass-dark rounded-2xl p-6 border border-metaverse-purple/30">
        {/* Preview Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-4 text-center">Preview</h2>
          
          {/* Preview Area */}
          <div className="relative bg-black/30 rounded-xl p-8 mb-6">
            <div className="relative mx-auto" style={{ width: '300px', height: '300px' }}>
              {/* Center guides */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-red-500/20"></div>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-500/20"></div>
              </div>
              
              {/* Avatar with accessory - Custom Preview */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Avatar */}
                <div className="relative">
                  {selectedAvatar.type === 'basic' ? (
                    <div className="text-8xl select-none">
                      {basicAvatars.find(a => a.id === selectedAvatar.id)?.emoji || '👤'}
                    </div>
                  ) : (
                    <div className="w-48 h-48 relative overflow-hidden rounded-full">
                      {premiumAvatars.find(a => a.id === selectedAvatar.id)?.svgUrl ? (
                        <img 
                          src={premiumAvatars.find(a => a.id === selectedAvatar.id)?.svgUrl} 
                          alt="Avatar"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-8xl">🦸</div>
                      )}
                    </div>
                  )}
                  
                  {/* Accessory Overlay */}
                  {selectedAccessory && (
                    <div 
                      className="absolute pointer-events-none"
                      style={{
                        left: position.anchorPoint?.includes('left') ? '0%' : 
                              position.anchorPoint?.includes('right') ? '100%' : '50%',
                        top: position.anchorPoint?.includes('top') ? '0%' : 
                             position.anchorPoint?.includes('bottom') ? '100%' : '50%',
                        transform: `
                          translate(-50%, -50%)
                          translateX(${position.x}px)
                          translateY(${position.y}px)
                          scale(${position.scale})
                          rotate(${position.rotation || 0}deg)
                        `,
                        width: '150px',
                        height: '150px'
                      }}
                    >
                      {selectedAccessory.imageUrl ? (
                        <img 
                          src={selectedAccessory.imageUrl} 
                          alt={selectedAccessory.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          {selectedAccessory.accessoryType === AccessoryType.HAT ? '🎩' :
                           selectedAccessory.accessoryType === AccessoryType.GLASSES ? '🕶️' :
                           selectedAccessory.accessoryType === AccessoryType.MASK ? '🎭' :
                           selectedAccessory.accessoryType === AccessoryType.NECKLACE ? '📿' :
                           selectedAccessory.accessoryType === AccessoryType.EARRING ? '💎' : '✨'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Position info */}
              <div className="absolute bottom-0 left-0 text-xs text-white/40 font-mono">
                X: {position.x}, Y: {position.y}, Scale: {position.scale}
                {position.anchorPoint && <span className="block">Anchor: {position.anchorPoint}</span>}
              </div>
            </div>
          </div>

          {/* Position Controls */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* X Position */}
              <div>
                <label className="text-sm text-white/80 flex justify-between mb-2">
                  <span>X</span>
                  <span className="text-metaverse-purple font-mono">{position.x}px</span>
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={position.x}
                  onChange={(e) => setPosition({...position, x: Number(e.target.value)})}
                  className="w-full"
                />
              </div>
              
              {/* Y Position */}
              <div>
                <label className="text-sm text-white/80 flex justify-between mb-2">
                  <span>Y</span>
                  <span className="text-metaverse-purple font-mono">{position.y}px</span>
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={position.y}
                  onChange={(e) => setPosition({...position, y: Number(e.target.value)})}
                  className="w-full"
                />
              </div>
              
              {/* Scale */}
              <div>
                <label className="text-sm text-white/80 flex justify-between mb-2">
                  <span>Scale</span>
                  <span className="text-metaverse-purple font-mono">{position.scale.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.05"
                  value={position.scale}
                  onChange={(e) => setPosition({...position, scale: Number(e.target.value)})}
                  className="w-full"
                />
              </div>
              
              {/* Rotation */}
              <div>
                <label className="text-sm text-white/80 flex justify-between mb-2">
                  <span>Rotation</span>
                  <span className="text-metaverse-purple font-mono">{position.rotation || 0}°</span>
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={position.rotation || 0}
                  onChange={(e) => setPosition({...position, rotation: Number(e.target.value)})}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Anchor Point */}
            <div>
              <label className="text-sm text-white/80 mb-2 block">Anchor Point</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  'top-left', 'top-center', 'top-right',
                  'center-left', 'center', 'center-right',
                  'bottom-left', 'bottom-center', 'bottom-right'
                ].map(anchor => (
                  <button
                    key={anchor}
                    onClick={() => setPosition({...position, anchorPoint: anchor})}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition ${
                      position.anchorPoint === anchor
                        ? 'metaverse-button text-white'
                        : 'glass text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {anchor}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={resetPosition}
              className="flex-1 py-2 glass rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              รีเซ็ตตำแหน่ง
            </button>
            <button
              onClick={saveCurrentPosition}
              disabled={!selectedAccessory}
              className="flex-1 py-2 metaverse-button rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4" />
              บันทึกค่านี้
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Avatar Selection */}
          <div className="glass-dark rounded-2xl p-4 border border-metaverse-purple/30">
            <h3 className="text-lg font-bold text-white mb-3">เลือก Avatar</h3>
            
            {/* Avatar Type Tabs */}
            <div className="glass-dark rounded-xl p-1 mb-4 border border-metaverse-purple/30">
              <div className="flex">
                <button
                  onClick={() => setActiveAvatarTab('basic')}
                  className={`flex-1 px-3 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm ${
                    activeAvatarTab === 'basic'
                      ? 'metaverse-button text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Basic
                </button>
                <button
                  onClick={() => setActiveAvatarTab('premium')}
                  className={`flex-1 px-3 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm ${
                    activeAvatarTab === 'premium'
                      ? 'metaverse-button text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  Premium
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeAvatarTab === 'basic' ? (
                  <motion.div
                    key="basic"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-4 gap-2"
                  >
                    {basicAvatars.map(avatar => {
                      const hasSaved = selectedAccessory ? 
                        savedPositions[`basic_${avatar.id}_${selectedAccessory.id}`] : false;
                      return (
                        <button
                          key={avatar.id}
                          onClick={() => setSelectedAvatar({ id: avatar.id, type: 'basic' })}
                          className={`relative p-2 rounded-lg transition-all ${
                            selectedAvatar.type === 'basic' && selectedAvatar.id === avatar.id
                              ? 'bg-metaverse-purple text-white'
                              : 'glass hover:bg-white/10 text-white/60'
                          }`}
                        >
                          <div className="text-2xl">{avatar.emoji}</div>
                          <p className="text-[10px] truncate">{avatar.name}</p>
                          {hasSaved && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full"></div>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    key="premium"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-3 gap-2"
                  >
                    {premiumAvatars.map(avatar => {
                      const hasSaved = selectedAccessory ? 
                        savedPositions[`premium_${avatar.id}_${selectedAccessory.id}`] : false;
                      return (
                        <button
                          key={avatar.id}
                          onClick={() => setSelectedAvatar({ id: avatar.id, type: 'premium' })}
                          className={`relative p-3 rounded-lg transition-all ${
                            selectedAvatar.type === 'premium' && selectedAvatar.id === avatar.id
                              ? 'bg-metaverse-purple text-white'
                              : 'glass hover:bg-white/10 text-white/60'
                          }`}
                        >
                          <div className="w-12 h-12 mb-1 mx-auto relative overflow-hidden rounded-full bg-metaverse-purple/20">
                            {avatar.svgUrl ? (
                              <img 
                                src={avatar.svgUrl} 
                                alt={avatar.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">🦸</div>
                            )}
                          </div>
                          <p className="text-[10px] truncate">{avatar.name}</p>
                          {hasSaved && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full"></div>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Accessory Selection */}
          <div className="glass-dark rounded-2xl p-4 border border-metaverse-purple/30">
            <h3 className="text-lg font-bold text-white mb-3">เลือก Accessory</h3>
            
            {/* Accessory Type Tabs */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {Object.values(AccessoryType).map(type => {
                  const count = getAccessoriesByType(type).length;
                  if (count === 0) return null;
                  
                  return (
                    <button
                      key={type}
                      onClick={() => setActiveAccessoryType(type)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                        activeAccessoryType === type
                          ? 'metaverse-button text-white'
                          : 'glass text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {type} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin text-3xl">⏳</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {getAccessoriesByType(activeAccessoryType).map(accessory => (
                    <button
                      key={accessory.id}
                      onClick={() => setSelectedAccessory(accessory)}
                      className={`p-3 rounded-lg transition-all ${
                        selectedAccessory?.id === accessory.id
                          ? 'bg-metaverse-purple text-white'
                          : 'glass hover:bg-white/10 text-white/60'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">{accessory.name}</div>
                      <div className="flex justify-center gap-0.5">
                        {Array.from({ length: getRarityStars(accessory.rarity || 'common') }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats and Export */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 bg-black/30 rounded-lg">
            <h3 className="text-sm font-bold text-white mb-2">สถิติการปรับ:</h3>
            <p className="text-xs text-white/60">
              ปรับแล้ว {Object.keys(savedPositions).length} ตำแหน่ง 
              จาก {(basicAvatars.length + premiumAvatars.length) * accessories.length} ตำแหน่งทั้งหมด
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={copyCode}
              disabled={Object.keys(savedPositions).length === 0}
              className="flex-1 py-3 metaverse-button text-white font-bold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Copy className="w-4 h-4" />
              Copy Code
            </button>
            <button
              onClick={resetAll}
              className="py-3 px-4 text-red-400 hover:text-red-300 transition text-sm glass rounded-lg hover:bg-white/10"
            >
              รีเซ็ตทั้งหมด
            </button>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="glass-dark rounded-xl p-4 border border-metaverse-purple/20">
        <h3 className="text-sm font-bold text-white mb-2">วิธีใช้:</h3>
        <ol className="text-xs text-white/60 space-y-1 list-decimal list-inside">
          <li>เลือก Accessory ที่ต้องการปรับตำแหน่ง</li>
          <li>เลือก Avatar (Basic หรือ Premium) แล้วปรับตำแหน่งด้วย slider</li>
          <li>กด &quot;บันทึกค่านี้&quot; เมื่อปรับเสร็จแต่ละตัว (จะมีจุดสีเขียวแสดง)</li>
          <li>ทำซ้ำกับทุก Avatar ที่ต้องการปรับ</li>
          <li>เมื่อเสร็จแล้ว กด &quot;Copy Code&quot; แล้วนำไปแปะใน positioning.ts</li>
        </ol>
        
        <div className="mt-3 p-3 bg-yellow-500/10 rounded-lg">
          <p className="text-xs text-yellow-400">
            <strong>หมายเหตุ:</strong> ระบบจะดึง Avatars และ Accessories จาก Rewards Database
          </p>
        </div>
      </div>
    </div>
  );
}