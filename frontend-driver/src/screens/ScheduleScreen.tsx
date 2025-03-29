import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  isSameDay,
  parseISO
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { getPersonalSchedules, driverCheckin, driverCheckout } from '../services/schedulesServices';
import { useSchedule } from '~/context/ScheduleContext';

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
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const { updateIsInProgress } = useSchedule();

  const fetchSchedules = async (date: Date) => {
    try {
      setLoading(true);
      const start = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const end = format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const data = await getPersonalSchedules(start, end);
      setSchedules(data);
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
    fetchSchedules(currentWeek);
  }, [currentWeek]);

  const handleDayPress = (date: string) => {
    setSelectedDate(date);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
  };

  const getSelectedSchedule = (): Schedule | undefined => {
    return schedules.find(
      (schedule) => format(new Date(schedule.date), 'yyyy-MM-dd') === selectedDate
    );
  };

  const selectedSchedule = getSelectedSchedule();

  // Navigation functions for week view
  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const handleCheckin = async (scheduleId: string) => {
    try {
      setIsLoading(true);
      const updatedSchedule = await driverCheckin(scheduleId);
      updateIsInProgress(true);
      // Cập nhật danh sách lịch
      setSchedules(
        schedules.map((schedule) =>
          schedule._id === updatedSchedule._id ? updatedSchedule : schedule
        )
      );
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
      updateIsInProgress(false);
      setSchedules(
        schedules.map((schedule) =>
          schedule._id === updatedSchedule._id ? updatedSchedule : schedule
        )
      );
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
            className="rounded-lg bg-blue-600 px-4 py-2"
            onPress={() => handleCheckin(schedule._id)}>
            <Text className="font-semibold text-white">Check-in</Text>
          </TouchableOpacity>
        );
      case 'in_progress':
        return (
          <TouchableOpacity
            className="rounded-lg bg-amber-500 px-4 py-2"
            onPress={() => handleCheckout(schedule._id)}>
            <Text className="font-semibold text-white">Check-out</Text>
          </TouchableOpacity>
        );
      case 'completed':
        return (
          <View className="rounded-lg bg-green-100 px-4 py-2">
            <Text className="text-green-800">Đã hoàn thành</Text>
          </View>
        );
      default:
        return null;
    }
  };

  // Generate days for the current week
  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentWeek, { weekStartsOn: 1 }),
    end: endOfWeek(currentWeek, { weekStartsOn: 1 }),
  });

  // Check if a day has a schedule
  const getDaySchedule = (date: Date): Schedule | undefined => {
    return schedules.find((schedule) =>
      isSameDay(new Date(schedule.date), date)
    );
  };

  // Render a single day cell
  const renderDayCell = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const isSelected = formattedDate === selectedDate;
    const daySchedule = getDaySchedule(date);
    const isToday = isSameDay(date, new Date());

    return (
      <TouchableOpacity
        key={formattedDate}
        className={`flex-1 min-h-[80px] p-2 border border-gray-200 ${isSelected ? 'border-blue-500 bg-blue-50' : ''
          } ${isToday ? 'bg-blue-100' : ''}`}
        onPress={() => handleDayPress(formattedDate)}
      >
        <Text className={`text-center font-medium ${isToday ? 'text-blue-600' : ''}`}>
          {format(date, 'EEE', { locale: vi })}
        </Text>
        <Text className="text-center">{format(date, 'd')}</Text>
        {daySchedule && (
          <View
            className="mt-1 p-1 rounded-md"
            style={{ backgroundColor: getStatusColor(daySchedule.status) + '30' }}
          >
            <Text className="text-xs text-center">
              Ca {daySchedule.shift}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="mb-4 text-xl font-bold">Lịch làm việc</Text>

          {/* Current week button */}
          <TouchableOpacity
            onPress={handleCurrentWeek}
            className="mb-3 py-2 bg-blue-600 rounded-lg"
          >
            <Text className="font-semibold text-center text-white">
              Tuần hiện tại
            </Text>
          </TouchableOpacity>

          {/* Week navigation */}
          <View className="flex-row justify-between items-center mb-4 bg-gray-100 p-3 rounded-lg">
            <TouchableOpacity
              onPress={handlePreviousWeek}
              className="bg-white px-3 py-2 rounded-md shadow-sm"
            >
              <Text className="text-blue-600 font-medium">← Tuần trước</Text>
            </TouchableOpacity>

            <Text className="font-semibold text-center">
              {format(weekDays[0], 'dd/MM')} - {format(weekDays[6], 'dd/MM')}
            </Text>

            <TouchableOpacity
              onPress={handleNextWeek}
              className="bg-white px-3 py-2 rounded-md shadow-sm"
            >
              <Text className="text-blue-600 font-medium">Tuần sau →</Text>
            </TouchableOpacity>
          </View>

          {/* Week calendar */}
          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" className="py-8" />
          ) : (
            <View className="flex-row mb-4">
              {weekDays.map(renderDayCell)}
            </View>
          )}

          {loading ? (
            <ActivityIndicator className="mt-4" size="large" color="#2563eb" />
          ) : selectedDate && selectedSchedule ? (
            <View className="mt-4 rounded-lg bg-gray-50 p-4">
              <Text className="mb-2 font-semibold">Chi tiết ca làm:</Text>
              <Text>Ngày: {format(new Date(selectedSchedule.date), 'dd/MM/yyyy')}</Text>
              <Text>
                Ca: {selectedSchedule.shift} ({getShiftTimeText(selectedSchedule.shift)})
              </Text>
              <Text>Xe: {selectedSchedule.vehicle.name}</Text>
              <Text>Trạng thái: {getStatusText(selectedSchedule.status)}</Text>

              {selectedSchedule.checkinTime && (
                <Text>
                  Giờ check-in: {format(new Date(selectedSchedule.checkinTime), 'HH:mm:ss')}
                </Text>
              )}
              {selectedSchedule.checkoutTime && (
                <Text>
                  Giờ check-out: {format(new Date(selectedSchedule.checkoutTime), 'HH:mm:ss')}
                </Text>
              )}

              <View className="mt-4">{renderActionButtons(selectedSchedule)}</View>
            </View>
          ) : selectedDate ? (
            <View className="mt-4 rounded-lg bg-gray-50 p-4">
              <Text className="text-center text-gray-500">
                Không có lịch làm việc cho ngày {format(new Date(selectedDate), 'dd/MM/yyyy')}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
