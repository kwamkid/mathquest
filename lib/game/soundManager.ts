// lib/game/soundManager.ts

export type SoundType = 'click' | 'correct' | 'incorrect' | 'levelUp' | 'levelDown' | 'gameStart' | 'gameEnd';

class SoundManager {
  private sounds: Map<SoundType, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    // Initialize sounds - คุณจะต้องเพิ่มไฟล์เสียงใน public/sounds/
    this.initializeSounds();
    
    // Load settings from localStorage
    if (typeof window !== 'undefined') {
      const savedEnabled = localStorage.getItem('soundEnabled');
      const savedVolume = localStorage.getItem('soundVolume');
      
      if (savedEnabled !== null) {
        this.enabled = savedEnabled === 'true';
      }
      
      if (savedVolume !== null) {
        this.volume = parseFloat(savedVolume);
      }
    }
  }

  private initializeSounds() {
    // Map ของเสียงและ path (ต้องเพิ่มไฟล์เสียงใน public/sounds/)
    const soundPaths: Record<SoundType, string> = {
      click: '/sounds/click.mp3',
      correct: '/sounds/correct.mp3',
      incorrect: '/sounds/incorrect.mp3',
      levelUp: '/sounds/levelup.mp3',
      levelDown: '/sounds/leveldown.mp3',
      gameStart: '/sounds/gamestart.mp3',
      gameEnd: '/sounds/gameend.mp3',
    };

    // Create audio elements
    Object.entries(soundPaths).forEach(([type, path]) => {
      if (typeof window !== 'undefined') {
        const audio = new Audio(path);
        audio.volume = this.volume;
        audio.preload = 'auto';
        this.sounds.set(type as SoundType, audio);
      }
    });
  }

  // Play sound
  play(type: SoundType) {
    if (!this.enabled) return;
    
    const sound = this.sounds.get(type);
    if (sound) {
      // Clone และเล่นเพื่อให้เล่นซ้อนกันได้
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = this.volume;
      clone.play().catch(error => {
        console.log('Sound play failed:', error);
      });
    }
  }

  // Toggle sound on/off
  toggleSound(): boolean {
    this.enabled = !this.enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEnabled', String(this.enabled));
    }
    return this.enabled;
  }

  // Set volume (0-1)
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach(sound => {
      sound.volume = this.volume;
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundVolume', String(this.volume));
    }
  }

  // Get current settings
  isEnabled(): boolean {
    return this.enabled;
  }

  getVolume(): number {
    return this.volume;
  }
}

// Singleton instance
const soundManager = new SoundManager();

export default soundManager;

// Hook สำหรับใช้ใน React components
import { useCallback } from 'react';

export function useSound() {
  const playSound = useCallback((type: SoundType) => {
    soundManager.play(type);
  }, []);

  const toggleSound = useCallback(() => {
    return soundManager.toggleSound();
  }, []);

  const setVolume = useCallback((volume: number) => {
    soundManager.setVolume(volume);
  }, []);

  return {
    playSound,
    toggleSound,
    setVolume,
    isEnabled: soundManager.isEnabled(),
    volume: soundManager.getVolume(),
  };
}