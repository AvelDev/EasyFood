import { updatePoll } from "./firestore";

export interface AutoCloseConfig {
  enabled: boolean;
  checkIntervalMs: number;
}

class PollAutoCloser {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private config: AutoCloseConfig = {
    enabled: true,
    checkIntervalMs: 10000, // Check every 10 seconds
  };

  /**
   * Schedule automatic closure for a poll
   */
  schedulePollClosure(pollId: string, endTime: Date, onClosed?: () => void) {
    if (!this.config.enabled) return;

    // Clear existing timer if any
    this.cancelPollClosure(pollId);

    const now = new Date().getTime();
    const endTimeMs = endTime.getTime();
    const timeUntilEnd = endTimeMs - now;

    if (timeUntilEnd <= 0) {
      // Poll should already be closed
      this.closePoll(pollId, onClosed);
      return;
    }

    // Set timer to close poll when time expires
    const timer = setTimeout(() => {
      this.closePoll(pollId, onClosed);
      this.timers.delete(pollId);
    }, timeUntilEnd);

    this.timers.set(pollId, timer);
  }

  /**
   * Cancel scheduled closure for a poll
   */
  cancelPollClosure(pollId: string) {
    const timer = this.timers.get(pollId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(pollId);
    }
  }

  /**
   * Manually close a poll
   */
  private async closePoll(pollId: string, onClosed?: () => void) {
    try {
      // Mark poll as closed in Firestore
      await updatePoll(pollId, { closed: true });
      
      // Execute callback if provided
      onClosed?.();
      
      console.log(`Poll ${pollId} has been automatically closed`);
    } catch (error) {
      console.error(`Error automatically closing poll ${pollId}:`, error);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AutoCloseConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): AutoCloseConfig {
    return { ...this.config };
  }

  /**
   * Clean up all timers
   */
  cleanup() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }

  /**
   * Get active timer count (for debugging)
   */
  getActiveTimerCount(): number {
    return this.timers.size;
  }
}

// Export singleton instance
export const pollAutoCloser = new PollAutoCloser();
