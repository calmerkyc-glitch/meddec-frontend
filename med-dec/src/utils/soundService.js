/**
 * Sound Service - Handles audio notifications and ringtones
 * Manages volume, muting, and different sound types
 */

class SoundService {
  constructor() {
    this.isMuted = localStorage.getItem('soundMuted') === 'true';
    this.volume = parseFloat(localStorage.getItem('soundVolume')) || 0.5;
    this.audioContext = null;
    this.sounds = {
      notification: null,
      incomingCall: null,
      orderUpdate: null,
    };
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (e) {
      console.warn('Web Audio API not supported, falling back to HTML5 Audio');
    }
  }

  /**
   * Play a notification sound
   * @param {string} soundType - 'notification' | 'incomingCall' | 'orderUpdate'
   */
  play(soundType = 'notification') {
    if (this.isMuted) return;

    if (soundType === 'incomingCall') {
      this.playRingtone();
    } else if (soundType === 'notification') {
      this.playNotificationTone();
    } else if (soundType === 'orderUpdate') {
      this.playOrderUpdateTone();
    }
  }

  /**
   * Generate and play a notification beep
   */
  playNotificationTone() {
    if (!this.audioContext) {
      this.playFallbackAudio('/assets/sounds/notification.mp3');
      return;
    }

    try {
      const now = this.audioContext.currentTime;
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(this.volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } catch (e) {
      console.warn('Error playing notification tone:', e);
    }
  }

  /**
   * Generate and play a ringtone for incoming calls
   */
  playRingtone() {
    if (!this.audioContext) {
      this.playFallbackAudio('/assets/sounds/incoming-call.mp3');
      return;
    }

    try {
      const now = this.audioContext.currentTime;
      this.playRingtonePattern(now);
    } catch (e) {
      console.warn('Error playing ringtone:', e);
    }
  }

  /**
   * Create a repeating ringtone pattern (two tones alternating)
   */
  playRingtonePattern(now) {
    const pattern = [
      { freq: 800, duration: 0.4, gap: 0.2 },
      { freq: 1000, duration: 0.4, gap: 0.2 },
    ];

    let currentTime = now;

    // Play pattern twice (about 1.6 seconds total)
    for (let repeat = 0; repeat < 2; repeat++) {
      pattern.forEach((note) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = note.freq;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(this.volume, currentTime);
        gainNode.gain.setValueAtTime(0, currentTime + note.duration);

        oscillator.start(currentTime);
        oscillator.stop(currentTime + note.duration);

        currentTime += note.duration + note.gap;
      });
    }
  }

  /**
   * Generate and play an order update tone
   */
  playOrderUpdateTone() {
    if (!this.audioContext) {
      this.playFallbackAudio('/assets/sounds/order-update.mp3');
      return;
    }

    try {
      const now = this.audioContext.currentTime;
      const frequencies = [600, 800, 1000]; // Ascending tones

      let currentTime = now;

      frequencies.forEach((freq) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = freq;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(this.volume, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);

        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.2);

        currentTime += 0.25;
      });
    } catch (e) {
      console.warn('Error playing order update tone:', e);
    }
  }

  /**
   * Fallback: Play audio from file path using HTML5 Audio
   */
  playFallbackAudio(path) {
    try {
      const audio = new Audio(path);
      audio.volume = this.volume;
      audio.play().catch((e) => {
        console.warn('Could not play audio:', e);
      });
    } catch (e) {
      console.warn('Audio fallback failed:', e);
    }
  }

  /**
   * Toggle mute state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('soundMuted', this.isMuted);
    return this.isMuted;
  }

  /**
   * Set volume (0 to 1)
   */
  setVolume(level) {
    this.volume = Math.max(0, Math.min(1, level));
    localStorage.setItem('soundVolume', this.volume);
  }

  /**
   * Get current mute state
   */
  getMuted() {
    return this.isMuted;
  }

  /**
   * Get current volume
   */
  getVolume() {
    return this.volume;
  }
}

// Create singleton instance
const soundService = new SoundService();

export default soundService;
