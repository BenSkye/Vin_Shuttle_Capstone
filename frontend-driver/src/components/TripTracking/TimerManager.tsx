import { useEffect } from 'react';

interface TimerManagerProps {
  totalMinutes: number;
  isActive: boolean;
  onTimerUpdate: (timeLeft: number) => void;
  onTimerComplete: () => void;
}

const TimerManager = ({
  totalMinutes,
  isActive,
  onTimerUpdate,
  onTimerComplete,
}: TimerManagerProps) => {
  useEffect(() => {
    if (!isActive || totalMinutes <= 0) return;

    // Convert minutes to milliseconds
    const totalTime = totalMinutes * 60 * 1000;
    const targetEndTime = new Date().getTime() + totalTime;

    // Initial update
    onTimerUpdate(totalTime);

    // Update the timer every second
    const timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const timeLeft = targetEndTime - now;

      if (timeLeft <= 0) {
        // Time's up
        clearInterval(timerInterval);
        onTimerUpdate(0);
        onTimerComplete();
      } else {
        onTimerUpdate(timeLeft);
      }
    }, 1000);

    // Cleanup on unmount
    return () => clearInterval(timerInterval);
  }, [isActive, totalMinutes, onTimerUpdate, onTimerComplete]);

  return null; // This is a logic-only component, no UI to render
};

export default TimerManager;
