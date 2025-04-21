import React, { createContext, useContext, useState, useEffect } from 'react';
import { DriverSchedulesStatus } from '~/constants/driver-schedules.enum';
import { useAuth } from '~/context/AuthContext';
import { getPersonalScheduleToday } from '~/services/schedulesServices';

interface ScheduleContextType {
  isInProgress: boolean;
  isPaused: boolean;
  updateScheduleStatus: (status: { inProgress?: boolean; paused?: boolean }) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInProgress, setIsInProgress] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const { isLogin } = useAuth();
  // Khi mở app, kiểm tra xem có ca làm nào trong ngày và đang in_progress không
  useEffect(() => {
    const fetchTodaySchedule = async () => {
      try {
        const data = await getPersonalScheduleToday();
        if (!data) return;

        const inProgress = data.some(
          (schedule: any) => schedule.status === DriverSchedulesStatus.IN_PROGRESS
        );
        const paused = data.some(
          (schedule: any) => schedule.status === DriverSchedulesStatus.IS_PAUSED
        );

        setIsInProgress(inProgress);
        setIsPaused(paused);
      } catch (error) {
        console.error('Error fetching today schedule:', error);
      }
    };

    if (isLogin) {
      fetchTodaySchedule();
    } else {
      setIsInProgress(false);
      setIsPaused(false);
    }
  }, [isLogin]);


  const updateScheduleStatus = (status: { inProgress?: boolean; paused?: boolean }) => {
    if (status.inProgress !== undefined) setIsInProgress(status.inProgress);
    if (status.paused !== undefined) setIsPaused(status.paused);
  };

  return (
    <ScheduleContext.Provider value={{ isInProgress, isPaused, updateScheduleStatus }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
