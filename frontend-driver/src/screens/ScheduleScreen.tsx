import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { getPersonalSchedules, driverCheckin, driverCheckout } from '../services/schedulesServices';

interface Schedule {
  _id: string;
  driver: {
    _id: string;
    name: string;
  };
  date: string;
  shift: string;
  vehicle: {
    _id: string;
    name: string;
  };
  status: string;
  isLate: boolean;
  isEarlyCheckout: boolean;
  createdAt: string;
  updatedAt: string;
  checkinTime: string;
  checkoutTime: string;
}

interface MarkedDates {
  [date: string]: {
    marked: boolean;
    dotColor: string;
    selected?: boolean;
  };
}

// Thêm enum và interface cho shifts
enum Shift {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}

const SHIFT_TIMES: Record<Shift, { start: number; end: number }> = {
  [Shift.A]: { start: 6, end: 14 },
  [Shift.B]: { start: 10, end: 18 },
  [Shift.C]: { start: 12, end: 20 },
  [Shift.D]: { start: 15, end: 23 },
};

const getShiftTimeText = (shift: string): string => {
  const shiftKey = shift as Shift;
  if (SHIFT_TIMES[shiftKey]) {
    const { start, end } = SHIFT_TIMES[shiftKey];
    return `${start}:00 - ${end}:00`;
  }
  return 'Không xác định';
};

export default function ScheduleScreen() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchSchedules = async (date: Date) => {
    try {
      setLoading(true);
      const start = format(startOfMonth(date), 'yyyy-MM-dd');
      const end = format(endOfMonth(date), 'yyyy-MM-dd');
      const data = await getPersonalSchedules(start, end);
      setSchedules(data);
      
      // Create marked dates object
      const marked: MarkedDates = {};
      data.forEach((schedule) => {
        const scheduleDate = format(new Date(schedule.date), 'yyyy-MM-dd');
        marked[scheduleDate] = {
          marked: true,
          dotColor: getStatusColor(schedule.status),
        };
      });
      setMarkedDates(marked);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'not_started':
        return '#2563eb'; // blue
      case 'in_progress':
        return '#f59e0b'; // amber
      case 'completed':
        return '#22c55e'; // green
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'not_started':
        return 'Chưa bắt đầu';
      case 'in_progress':
        return 'Đang thực hiện';
      case 'completed':
        return 'Đã hoàn thành';
      default:
        return 'Không xác định';
    }
  };

  useEffect(() => {
    fetchSchedules(new Date());
  }, []);

  const handleDayPress = (day: DateData) => {
    // Clear previous selection and set new one
    const newMarkedDates: MarkedDates = {};
    
    // Preserve the dots for all scheduled dates
    schedules.forEach((schedule) => {
      const scheduleDate = format(new Date(schedule.date), 'yyyy-MM-dd');
      newMarkedDates[scheduleDate] = {
        marked: true,
        dotColor: getStatusColor(schedule.status),
      };
    });

    // Add selection for the new date
    newMarkedDates[day.dateString] = {
      ...newMarkedDates[day.dateString],
      selected: true,
    };

    setSelectedDate(day.dateString);
    setMarkedDates(newMarkedDates);
  };

  const getSelectedSchedule = (): Schedule | undefined => {
    return schedules.find(
      (schedule) => format(new Date(schedule.date), 'yyyy-MM-dd') === selectedDate
    );
  };

  const selectedSchedule = getSelectedSchedule();

  const handleCheckin = async (scheduleId: string) => {
    try {
      setIsLoading(true);
      const updatedSchedule = await driverCheckin(scheduleId);
      // Cập nhật danh sách lịch
      setSchedules(schedules.map(schedule => 
        schedule._id === updatedSchedule._id ? updatedSchedule : schedule
      ));
    } catch (error) {
      console.error('Checkin error:', error);
      Alert.alert('Lỗi', 'Không thể check-in. Vui lòng thử lại sau hoặc kiểm tra lại ngày tháng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async (scheduleId: string) => {
    try {
      setIsLoading(true);
      const updatedSchedule = await driverCheckout(scheduleId);
      // Cập nhật danh sách lịch
      setSchedules(schedules.map(schedule => 
        schedule._id === updatedSchedule._id ? updatedSchedule : schedule
      ));
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Lỗi', 'Không thể check-out. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderActionButtons = (schedule: Schedule) => {
    if (isLoading) {
      return <ActivityIndicator size="small" color="#2563eb" />;
    }

    switch (schedule.status) {
      case 'not_started':
        return (
          <TouchableOpacity
            className="bg-blue-600 px-4 py-2 rounded-lg"
            onPress={() => handleCheckin(schedule._id)}
          >
            <Text className="text-white font-semibold">Check-in</Text>
          </TouchableOpacity>
        );
      case 'in_progress':
        return (
          <TouchableOpacity
            className="bg-amber-500 px-4 py-2 rounded-lg"
            onPress={() => handleCheckout(schedule._id)}
          >
            <Text className="text-white font-semibold">Check-out</Text>
          </TouchableOpacity>
        );
      case 'completed':
        return (
          <View className="bg-green-100 px-4 py-2 rounded-lg">
            <Text className="text-green-800">Đã hoàn thành</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-xl font-bold mb-4">Lịch làm việc</Text>
          
          <Calendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              todayTextColor: '#2563eb',
              selectedDayBackgroundColor: '#2563eb',
            }}
            onMonthChange={(month: DateData) => {
              fetchSchedules(new Date(month.timestamp));
            }}
          />

          {loading ? (
            <ActivityIndicator className="mt-4" size="large" color="#2563eb" />
          ) : selectedDate && selectedSchedule ? (
            <View className="mt-4 p-4 bg-gray-50 rounded-lg">
              <Text className="font-semibold mb-2">Chi tiết ca làm:</Text>
              <Text>Ngày: {format(new Date(selectedSchedule.date), 'dd/MM/yyyy')}</Text>
              <Text>Ca: {selectedSchedule.shift} ({getShiftTimeText(selectedSchedule.shift)})</Text>
              <Text>Xe: {selectedSchedule.vehicle.name}</Text>
              <Text>Trạng thái: {getStatusText(selectedSchedule.status)}</Text>
              
              {selectedSchedule.checkinTime && (
                <Text>Giờ check-in: {format(new Date(selectedSchedule.checkinTime), 'HH:mm:ss')}</Text>
              )}
              {selectedSchedule.checkoutTime && (
                <Text>Giờ check-out: {format(new Date(selectedSchedule.checkoutTime), 'HH:mm:ss')}</Text>
              )}
              
              <View className="mt-4">
                {renderActionButtons(selectedSchedule)}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}