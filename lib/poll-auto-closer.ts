import {
  updatePoll,
  getVotes,
  calculateVoteCounts,
  determineWinnerWithTieBreaking,
  getPolls,
} from "./firestore";

export interface AutoCloseConfig {
  enabled: boolean;
  checkIntervalMs: number;
  fallbackCheckEnabled: boolean;
}

class PollAutoCloser {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private fallbackInterval: NodeJS.Timeout | null = null;
  private config: AutoCloseConfig = {
    enabled: true,
    checkIntervalMs: 10000, // Check every 10 seconds
    fallbackCheckEnabled: true, // Enable periodic check for missed closures
  };

  constructor() {
    // Start fallback checker if enabled
    if (this.config.fallbackCheckEnabled) {
      this.startFallbackChecker();
    }
  }

  /**
   * Start periodic check for polls that should be closed but weren't
   * This serves as a fallback in case setTimeout fails (e.g., in serverless environments)
   */
  private startFallbackChecker() {
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
    }

    this.fallbackInterval = setInterval(async () => {
      try {
        await this.checkAndCloseExpiredPolls();
      } catch (error) {
        console.error("Error in fallback poll checker:", error);
      }
    }, this.config.checkIntervalMs);
  }

  /**
   * Check for polls that should be closed and close them
   */
  private async checkAndCloseExpiredPolls() {
    // Skip if not in browser environment (during build)
    if (typeof window === "undefined") {
      return;
    }

    try {
      const polls = await getPolls();
      const now = new Date();

      for (const poll of polls) {
        if (!poll.closed && poll.votingEndsAt <= now) {
          console.log(`Found expired poll ${poll.id}, closing it...`);
          await this.closePoll(poll.id);
          // Remove timer if it exists (it might have failed)
          this.timers.delete(poll.id);
        }
      }
    } catch (error) {
      // Silently ignore permission errors during build or when not authenticated
      if (error instanceof Error && error.message.includes("permission-denied")) {
        return;
      }
      console.error("Error checking expired polls:", error);
    }
  }

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
    console.log(`Scheduled poll ${pollId} to close in ${Math.round(timeUntilEnd / 1000)} seconds`);
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
      // Get current votes to determine winner
      const votes = await getVotes(pollId);
      const voteCounts = calculateVoteCounts(votes);
      const winner = determineWinnerWithTieBreaking(voteCounts);

      // Mark poll as closed in Firestore with winner
      await updatePoll(pollId, {
        closed: true,
        selectedRestaurant: winner,
      });

      // Execute callback if provided
      onClosed?.();

      console.log(
        `Poll ${pollId} has been automatically closed with winner: ${
          winner || "none"
        }`,
      );
    } catch (error) {
      console.error(`Error automatically closing poll ${pollId}:`, error);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AutoCloseConfig>) {
    this.config = { ...this.config, ...config };
    
    // Restart fallback checker if configuration changed
    if (config.fallbackCheckEnabled !== undefined || config.checkIntervalMs !== undefined) {
      if (this.config.fallbackCheckEnabled) {
        this.startFallbackChecker();
      } else {
        this.stopFallbackChecker();
      }
    }
  }

  /**
   * Stop the fallback checker
   */
  private stopFallbackChecker() {
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
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
    this.stopFallbackChecker();
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
