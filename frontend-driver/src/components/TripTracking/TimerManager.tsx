import { useEffect, useRef } from 'react';

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
  // Store the end time as a ref so it persists between renders
  const endTimeRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!isActive || totalMinutes <= 0) return;

    // Calculate end time only once when timer becomes active
    if (endTimeRef.current === null) {
      // Convert minutes to milliseconds
      const totalTime = totalMinutes * 60 * 1000;
      endTimeRef.current = new Date().getTime() + totalTime;
      
      // Initial update
      onTimerUpdate(totalTime);
    }

    // Update the timer every second
    const timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const timeLeft = endTimeRef.current! - now;

      if (timeLeft <= 0) {
        // Time's up
        clearInterval(timerInterval);
        onTimerUpdate(0);
        onTimerComplete();
      } else {
        onTimerUpdate(timeLeft);
      }
    }, 1000);

    // Cleanup on unmount or when isActive changes
    return () => {
      clearInterval(timerInterval);
    };
  }, [isActive, totalMinutes, onTimerUpdate, onTimerComplete]);

  // Reset end time ref when component is deactivated
  useEffect(() => {
    if (!isActive) {
      endTimeRef.current = null;
    }
  }, [isActive]);

  return null; // This is a logic-only component, no UI to render
};

export default TimerManager;