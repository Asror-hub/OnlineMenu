// Sound notification utility for new orders
class NotificationService {
  constructor() {
    this.audio = null;
    this.isEnabled = true;
    this.audioContext = null;
    this.preloadedAudio = null;
    this.continuousSoundInterval = null;
    this.activeOrderIds = new Set(); // Track orders that need continuous sound
    this.initAudio();
    this.preloadAudio();
  }

  initAudio() {
    try {
      // Create a simple notification sound using Web Audio API
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Resume audio context if it's suspended (browser requirement)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      console.log('Audio context initialized:', this.audioContext.state);
    } catch (error) {
      console.warn('Web Audio API not supported, falling back to simple beep');
      this.audioContext = null;
    }
  }

  preloadAudio() {
    try {
      // Create a pre-loaded audio element for reliable playback
      this.preloadedAudio = new Audio();
      this.preloadedAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      this.preloadedAudio.load();
      console.log('Audio preloaded successfully');
    } catch (error) {
      console.warn('Failed to preload audio:', error);
    }
  }

  async playNotificationSound() {
    if (!this.isEnabled) return;

    try {
      // Check if we need to re-initialize audio context
      if (!this.audioContext || this.audioContext.state === 'closed') {
        console.log('Audio context not available, re-initializing...');
        this.initAudio();
      }

      // Resume audio context if suspended
      if (this.audioContext && this.audioContext.state === 'suspended') {
        console.log('Audio context suspended, attempting to resume...');
        try {
          await this.audioContext.resume();
          console.log('Audio context resumed:', this.audioContext.state);
        } catch (resumeError) {
          console.warn('Failed to resume audio context, creating new one:', resumeError);
          this.initAudio();
        }
      }

      if (this.audioContext && this.audioContext.state === 'running') {
        // Play the custom sound
        await this.playCustomSound();
      } else {
        console.log('Audio context not running, using fallback sound');
        // Fallback: try to play a simple beep
        this.playFallbackSound();
      }
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
      this.playFallbackSound();
    }
  }

  async playCustomSound() {
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Create a pleasant notification sound
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.4);
      
      console.log('Custom sound played successfully');
    } catch (error) {
      console.error('Error playing custom sound:', error);
      throw error;
    }
  }

  playFallbackSound() {
    try {
      console.log('Playing fallback sound...');
      
      // Method 1: Try to create a new audio context for this specific sound
      try {
        const tempAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = tempAudioContext.createOscillator();
        const gainNode = tempAudioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(tempAudioContext.destination);
        
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        oscillator.stop(tempAudioContext.currentTime + 0.2);
        
        console.log('Fallback sound played successfully with temp audio context');
        return;
      } catch (tempError) {
        console.warn('Temp audio context failed:', tempError);
      }
      
      // Method 2: Try HTML5 Audio with a simple beep
      try {
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
        
        audio.play().then(() => {
          console.log('HTML5 Audio fallback played successfully');
        }).catch((error) => {
          console.warn('HTML5 Audio fallback failed:', error);
          this.playAlternativeSound();
        });
      } catch (audioError) {
        console.warn('HTML5 Audio fallback failed:', audioError);
        this.playAlternativeSound();
      }
      
    } catch (error) {
      console.warn('All fallback sounds failed:', error);
      this.playAlternativeSound();
    }
  }

  playAlternativeSound() {
    try {
      // Try the preloaded audio first (most reliable)
      if (this.preloadedAudio) {
        console.log('Trying preloaded audio...');
        this.preloadedAudio.currentTime = 0; // Reset to beginning
        this.preloadedAudio.play().then(() => {
          console.log('Preloaded audio played successfully');
        }).catch((error) => {
          console.warn('Preloaded audio failed, trying oscillator:', error);
          this.playOscillatorSound();
        });
        return;
      }
      
      // Fallback to oscillator
      this.playOscillatorSound();
    } catch (error) {
      console.warn('Alternative sound failed:', error);
      this.playOscillatorSound();
    }
  }

  playOscillatorSound() {
    try {
      // Create a very simple beep using oscillator
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
      
      console.log('Oscillator sound played successfully');
    } catch (error) {
      console.warn('Oscillator sound failed:', error);
      // Last resort: just log it
      console.log('🔔 New order notification!');
    }
  }

  enable() {
    this.isEnabled = true;
    // Resume audio context when enabling
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  disable() {
    this.isEnabled = false;
  }

  isSoundEnabled() {
    return this.isEnabled;
  }

  // Test sound function
  testSound() {
    console.log('Testing notification sound...');
    // Force re-initialize audio context if needed
    if (!this.audioContext || this.audioContext.state === 'closed') {
      console.log('Re-initializing audio context...');
      this.initAudio();
    }
    this.playNotificationSound();
  }

  // Request notification permission and show browser notification
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Show browser notification as fallback
  showBrowserNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  }

  // Start continuous sound for a specific order
  startContinuousSound(orderId) {
    if (!this.isEnabled) return;
    
    this.activeOrderIds.add(orderId);
    console.log(`Starting continuous sound for order ${orderId}`);
    
    // Play sound immediately
    this.playNotificationSound();
    
    // Set up continuous sound every 3 seconds
    this.continuousSoundInterval = setInterval(() => {
      if (this.activeOrderIds.has(orderId)) {
        console.log(`Playing continuous sound for order ${orderId}`);
        this.playNotificationSound();
      }
    }, 3000);
  }

  // Stop continuous sound for a specific order
  stopContinuousSound(orderId) {
    if (this.activeOrderIds.has(orderId)) {
      this.activeOrderIds.delete(orderId);
      console.log(`Stopping continuous sound for order ${orderId}`);
      
      // If no more active orders, clear the interval
      if (this.activeOrderIds.size === 0 && this.continuousSoundInterval) {
        clearInterval(this.continuousSoundInterval);
        this.continuousSoundInterval = null;
        console.log('All continuous sounds stopped');
      }
    }
  }

  // Stop all continuous sounds
  stopAllContinuousSounds() {
    this.activeOrderIds.clear();
    if (this.continuousSoundInterval) {
      clearInterval(this.continuousSoundInterval);
      this.continuousSoundInterval = null;
      console.log('All continuous sounds stopped');
    }
  }

  // Check if continuous sound is playing for an order
  isContinuousSoundPlaying(orderId) {
    return this.activeOrderIds.has(orderId);
  }

  // Get all active order IDs
  getActiveOrderIds() {
    return Array.from(this.activeOrderIds);
  }

  // Show notification (general method for UI notifications)
  showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // For now, we'll use console logging and browser notifications
    // In a real app, you might want to integrate with a toast notification library
    
    // Try to show browser notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      this.showBrowserNotification('Order Management', message);
    }
    
    // You could also integrate with a toast notification library here
    // For example: toast.success(message) or toast.error(message)
  }

  // Force audio initialization (for testing)
  forceAudioInitialization() {
    console.log('Forcing audio initialization...');
    this.initAudio();
    this.preloadAudio();
  }
}

export default new NotificationService();
