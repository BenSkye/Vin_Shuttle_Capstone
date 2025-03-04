import React, { createContext, useContext, useState, useEffect } from 'react';
import { DriverSchedulesStatus } from '~/constants/driver-schedules.enum';
import { useAuth } from '~/context/AuthContext';
import { getPersonalScheduleToday } from '~/services/schedulesServices';

interface ScheduleContextType {
    isInProgress: boolean;
    updateIsInProgress: (status: boolean) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isInProgress, setIsInProgress] = useState<boolean>(false);
    const { isLogin } = useAuth();
    // Khi mở app, kiểm tra xem có ca làm nào trong ngày và đang in_progress không
    useEffect(() => {
        console.log('isLogin', isLogin);
        const fetchTodaySchedule = async () => {
            try {
                const data = await getPersonalScheduleToday();
                console.log('Today schedule:', data);
                if (!data) return;
                // Kiểm tra nếu có ca làm trong ngày và trạng thái là "in_progress"
                const inProgress = data.some((schedule: any) =>
                    schedule.status === DriverSchedulesStatus.IN_PROGRESS
                );
                setIsInProgress(inProgress);
            } catch (error) {
                console.error('Error fetching today schedule:', error);
            }
        };
        if (isLogin) {
            fetchTodaySchedule();
        } else {
            setIsInProgress(false);
        }
    }, [isLogin]);

    const updateIsInProgress = (status: boolean) => {
        setIsInProgress(status);
    };

    return (
        <ScheduleContext.Provider value={{ isInProgress, updateIsInProgress }}>
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
