// lib/game/backgroundMusicManager.ts

class BackgroundMusicManager {
  private audio: HTMLAudioElement | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3; // ลดเสียงลงหน่อยเพื่อไม่ให้รบกวน
  private isPlaying: boolean = false;
  private fadeInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Load settings from localStorage
      const savedEnabled = localStorage.getItem('backgroundMusicEnabled');
      const savedVolume = localStorage.getItem('backgroundMusicVolume');
      
      if (savedEnabled !== null) {
        this.enabled = savedEnabled === 'true';
      }
      
      if (savedVolume !== null) {
        this.volume = parseFloat(savedVolume);
      }

      // Initialize audio
      this.initializeAudio();
    }
  }

  private initializeAudio() {
    if (typeof window === 'undefined') return;

    this.audio = new Audio('/sounds/play-music.mp3');
    this.audio.loop = true;
    this.audio.volume = this.volume;
    this.audio.preload = 'auto';

    // Handle audio events
    this.audio.addEventListener('canplaythrough', () => {
      console.log('Background music loaded');
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Background music error:', e);
    });

    this.audio.addEventListener('ended', () => {
      // Just in case loop fails
      if (this.enabled && this.isPlaying) {
        this.audio?.play().catch(console.error);
      }
    });
  }

  // Start playing music
  async play() {
    if (!this.enabled || !this.audio || this.isPlaying) return;

    try {
      this.audio.currentTime = 0;
      await this.audio.play();
      this.isPlaying = true;
      console.log('Background music started');
    } catch (error) {
      console.log('Background music play failed (user interaction required):', error);
    }
  }

  // Stop playing music
  stop() {
    if (!this.audio || !this.isPlaying) return;

    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying = false;
    console.log('Background music stopped');
  }

  // Pause music
  pause() {
    if (!this.audio || !this.isPlaying) return;

    this.audio.pause();
    this.isPlaying = false;
    console.log('Background music paused');
  }

  // Resume music
  async resume() {
    if (!this.enabled || !this.audio || this.isPlaying) return;

    try {
      await this.audio.play();
      this.isPlaying = true;
      console.log('Background music resumed');
    } catch (error) {
      console.log('Background music resume failed:', error);
    }
  }

  // Fade in music
  fadeIn(duration: number = 2000) {
    if (!this.audio || !this.enabled) return;

    this.audio.volume = 0;
    this.play();

    const targetVolume = this.volume;
    const steps = 50;
    const stepTime = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;

    this.fadeInterval = setInterval(() => {
      if (currentStep >= steps || !this.audio) {
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
        if (this.audio) {
          this.audio.volume = targetVolume;
        }
        return;
      }

      currentStep++;
      this.audio.volume = Math.min(volumeStep * currentStep, targetVolume);
    }, stepTime);
  }

  // Fade out music
  fadeOut(duration: number = 2000, stopAfter: boolean = true) {
    if (!this.audio || !this.isPlaying) return;

    const startVolume = this.audio.volume;
    const steps = 50;
    const stepTime = duration / steps;
    const volumeStep = startVolume / steps;
    let currentStep = 0;

    this.fadeInterval = setInterval(() => {
      if (!this.audio) return;

      if (currentStep >= steps) {
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
        this.audio.volume = 0;
        if (stopAfter) {
          this.stop();
        } else {
          this.pause();
        }
        return;
      }

      currentStep++;
      this.audio.volume = Math.max(startVolume - (volumeStep * currentStep), 0);
    }, stepTime);
  }

  // Toggle music on/off
  toggleMusic(): boolean {
    this.enabled = !this.enabled;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('backgroundMusicEnabled', String(this.enabled));
    }

    if (this.enabled) {
      this.fadeIn();
    } else {
      this.stop(); // ปิดทันทีแทน fadeOut
    }

    return this.enabled;
  }

  // Set volume (0-1)
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('backgroundMusicVolume', String(this.volume));
    }
  }

  // Set volume during gameplay (lower volume)
  setGameplayVolume() {
    if (this.audio && this.isPlaying) {
      this.audio.volume = this.volume * 0.4; // ลดเสียงเหลือ 40% ตอนเล่นเกม
    }
  }

  // Restore normal volume
  restoreNormalVolume() {
    if (this.audio && this.isPlaying) {
      this.audio.volume = this.volume;
    }
  }

  // Get current settings
  isEnabled(): boolean {
    return this.enabled;
  }

  getVolume(): number {
    return this.volume;
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  // Get current time for sync purposes
  getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  // Set current time for sync purposes
  setCurrentTime(time: number) {
    if (this.audio) {
      this.audio.currentTime = time;
    }
  }
}

// Singleton instance
const backgroundMusicManager = new BackgroundMusicManager();

export default backgroundMusicManager;

// Hook สำหรับใช้ใน React components
import { useCallback, useEffect, useState } from 'react';

export function useBackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(backgroundMusicManager.isCurrentlyPlaying());
  const [isEnabled, setIsEnabled] = useState(backgroundMusicManager.isEnabled());

  // Update state when music changes
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPlaying(backgroundMusicManager.isCurrentlyPlaying());
      setIsEnabled(backgroundMusicManager.isEnabled());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const playMusic = useCallback(() => {
    backgroundMusicManager.play();
  }, []);

  const stopMusic = useCallback(() => {
    backgroundMusicManager.stop();
  }, []);

  const pauseMusic = useCallback(() => {
    backgroundMusicManager.pause();
  }, []);

  const resumeMusic = useCallback(() => {
    backgroundMusicManager.resume();
  }, []);

  const fadeIn = useCallback((duration?: number) => {
    backgroundMusicManager.fadeIn(duration);
  }, []);

  const fadeOut = useCallback((duration?: number, stopAfter?: boolean) => {
    backgroundMusicManager.fadeOut(duration, stopAfter);
  }, []);

  const toggleMusic = useCallback(() => {
    const newState = backgroundMusicManager.toggleMusic();
    setIsEnabled(newState);
    return newState;
  }, []);

  const setVolume = useCallback((volume: number) => {
    backgroundMusicManager.setVolume(volume);
  }, []);

  const setGameplayVolume = useCallback(() => {
    backgroundMusicManager.setGameplayVolume();
  }, []);

  const restoreNormalVolume = useCallback(() => {
    backgroundMusicManager.restoreNormalVolume();
  }, []);

  return {
    playMusic,
    stopMusic,
    pauseMusic,
    resumeMusic,
    fadeIn,
    fadeOut,
    toggleMusic,
    setVolume,
    setGameplayVolume,
    restoreNormalVolume,
    isPlaying,
    isEnabled,
    volume: backgroundMusicManager.getVolume(),
  };
}