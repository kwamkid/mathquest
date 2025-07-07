// lib/data/avatars.ts
import { BasicAvatar } from '@/types/avatar';

// Basic avatars (free) - same as in AvatarSelection component
export const basicAvatars: BasicAvatar[] = [
  // Warriors
  { id: 'knight', emoji: '🤴', name: 'อัศวิน', category: 'warriors' },
  { id: 'warrior', emoji: '🦸‍♂️', name: 'นักรบ', category: 'warriors' },
  { id: 'warrioress', emoji: '🦸‍♀️', name: 'นักรบหญิง', category: 'warriors' },
  { id: 'ninja', emoji: '🥷', name: 'นินจา', category: 'warriors' },
  { id: 'wizard', emoji: '🧙‍♂️', name: 'พ่อมด', category: 'warriors' },
  { id: 'witch', emoji: '🧙‍♀️', name: 'แม่มด', category: 'warriors' },
  { id: 'superhero', emoji: '🦹‍♂️', name: 'ซูเปอร์ฮีโร่', category: 'warriors' },
  { id: 'superheroine', emoji: '🦹‍♀️', name: 'ซูเปอร์ฮีโร่หญิง', category: 'warriors' },
  { id: 'vampire', emoji: '🧛‍♂️', name: 'แวมไพร์', category: 'warriors' },
  { id: 'vampiress', emoji: '🧛‍♀️', name: 'แวมไพร์หญิง', category: 'warriors' },
  
  // Creatures
  { id: 'dragon', emoji: '🐉', name: 'มังกร', category: 'creatures' },
  { id: 'unicorn', emoji: '🦄', name: 'ยูนิคอร์น', category: 'creatures' },
  { id: 'fox', emoji: '🦊', name: 'สุนัขจิ้งจอก', category: 'creatures' },
  { id: 'lion', emoji: '🦁', name: 'สิงโต', category: 'creatures' },
  { id: 'tiger', emoji: '🐯', name: 'เสือ', category: 'creatures' },
  { id: 'wolf', emoji: '🐺', name: 'หมาป่า', category: 'creatures' },
  { id: 'bear', emoji: '🐻', name: 'หมี', category: 'creatures' },
  { id: 'panda', emoji: '🐼', name: 'แพนด้า', category: 'creatures' },
  { id: 'monkey', emoji: '🐵', name: 'ลิง', category: 'creatures' },
  { id: 'owl', emoji: '🦉', name: 'นกฮูก', category: 'creatures' },
  
  // Mystical
  { id: 'fairy', emoji: '🧚‍♀️', name: 'นางฟ้า', category: 'mystical' },
  { id: 'fairy-man', emoji: '🧚‍♂️', name: 'นางฟ้าชาย', category: 'mystical' },
  { id: 'mage', emoji: '🧙', name: 'จอมเวทย์', category: 'mystical' },
  { id: 'genie', emoji: '🧞', name: 'ยักษ์จินนี่', category: 'mystical' },
  { id: 'mermaid', emoji: '🧜‍♀️', name: 'นางเงือก', category: 'mystical' },
  { id: 'merman', emoji: '🧜‍♂️', name: 'เงือกชาย', category: 'mystical' },
  { id: 'robot', emoji: '🤖', name: 'หุ่นยนต์', category: 'mystical' },
  { id: 'alien', emoji: '👽', name: 'เอเลี่ยน', category: 'mystical' },
  { id: 'ghost', emoji: '👻', name: 'ผี', category: 'mystical' },
  { id: 'zombie', emoji: '🧟', name: 'ซอมบี้', category: 'mystical' }
];

// Avatar categories for grouping
export const avatarCategories = {
  warriors: {
    title: 'นักรบ',
    avatars: basicAvatars.filter(a => a.category === 'warriors')
  },
  creatures: {
    title: 'สัตว์มหัศจรรย์',
    avatars: basicAvatars.filter(a => a.category === 'creatures')
  },
  mystical: {
    title: 'ผู้วิเศษ',
    avatars: basicAvatars.filter(a => a.category === 'mystical')
  }
};

// Get avatar emoji from ID
export const getAvatarEmoji = (avatarId: string): string => {
  const avatar = basicAvatars.find(a => a.id === avatarId);
  return avatar?.emoji || '👤';
};

// Get avatar name from ID
export const getAvatarName = (avatarId: string): string => {
  const avatar = basicAvatars.find(a => a.id === avatarId);
  return avatar?.name || 'Unknown';
};

// Get avatar by ID
export const getAvatarById = (avatarId: string): BasicAvatar | undefined => {
  return basicAvatars.find(a => a.id === avatarId);
};