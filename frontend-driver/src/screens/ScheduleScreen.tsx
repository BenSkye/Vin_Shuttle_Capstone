import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Modal, TouchableOpacity, Alert } from 'react-native';
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
}

interface MarkedDates {
  [date: string]: {
    marked: boolean;
    dotColor: string;
    selected?: boolean;
  };
}

export default function ScheduleScreen() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchSchedules = async (date: Date) => {
    try {
      setLoading(true);
      const start = format(startOfMonth(date), 'yyyy-MM-dd');
      const end = format(endOfMonth(date), 'yyyy-MM-dd');
      console.log('Fetching schedules with dates:', { start, end }); // Debug log
      const data = await getPersonalSchedules(start, end);
      console.log('Received schedules:', data); // Debug log
      setSchedules(data);
      
      // Create marked dates object
      const marked: MarkedDates = {};
      data.forEach((schedule) => {
        const scheduleDate = format(new Date(schedule.date), 'yyyy-MM-dd');
        marked[scheduleDate] = {
          marked: true,
          dotColor: schedule.status === 'not_started' ? '#2563eb' : '#22c55e',
        };
      });
      setMarkedDates(marked);
    } catch (error: any) {
      console.error('Error in fetchSchedules:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      Alert.alert('Lỗi', 'Không thể tải lịch làm việc. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules(new Date());
  }, []);

  const handleCheckin = async (scheduleId: string) => {
    try {
      console.log('Attempting check-in for schedule:', scheduleId); // Debug log
      await driverCheckin(scheduleId);
      Alert.alert('Thành công', 'Đã check-in thành công');
      fetchSchedules(new Date());
      setIsModalVisible(false);
    } catch (error: any) {
      console.error('Error in handleCheckin:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      Alert.alert('Lỗi', 'Không thể check-in. Vui lòng thử lại sau.');
    }
  };

  const handleCheckout = async (scheduleId: string) => {
    try {
      console.log('Attempting check-out for schedule:', scheduleId); // Debug log
      await driverCheckout(scheduleId);
      Alert.alert('Thành công', 'Đã check-out thành công');
      fetchSchedules(new Date());
      setIsModalVisible(false);
    } catch (error: any) {
      console.error('Error in handleCheckout:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      Alert.alert('Lỗi', 'Không thể check-out. Vui lòng thử lại sau.');
    }
  };

  const handleDayPress = (day: DateData) => {
    // Clear previous selection and set new one
    const newMarkedDates: MarkedDates = {};
    
    // Preserve the dots for all scheduled dates
    schedules.forEach((schedule) => {
      const scheduleDate = format(new Date(schedule.date), 'yyyy-MM-dd');
      newMarkedDates[scheduleDate] = {
        marked: true,
        dotColor: schedule.status === 'not_started' ? '#2563eb' : '#22c55e',
      };
    });

    // Add selection for the new date
    newMarkedDates[day.dateString] = {
      ...newMarkedDates[day.dateString],
      selected: true,
    };

    setSelectedDate(day.dateString);
    setMarkedDates(newMarkedDates);

    const schedule = schedules.find(
      (s) => format(new Date(s.date), 'yyyy-MM-dd') === day.dateString
    );
    
    if (schedule) {
      setSelectedDate(day.dateString);
      setIsModalVisible(true);
    }
  };

  const getSelectedSchedule = (): Schedule | undefined => {
    return schedules.find(
      (schedule) => format(new Date(schedule.date), 'yyyy-MM-dd') === selectedDate
    );
  };

  const selectedSchedule = getSelectedSchedule();

  return (
    <SafeAreaView className="flex-1 bg-white">
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
            <Text>Ca: {selectedSchedule.shift}</Text>
            <Text>Xe: {selectedSchedule.vehicle.name}</Text>
            <Text>Trạng thái: {
              selectedSchedule.status === 'not_started' ? 'Chưa bắt đầu' : 'Đã hoàn thành'
            }</Text>
          </View>
        ) : null}

        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white p-6 rounded-lg w-[80%]">
              <Text className="text-lg font-bold mb-4">Chọn hành động</Text>
              
              {selectedSchedule && (
                <View>
                  <Text className="mb-4">
                    Ca làm ngày: {format(new Date(selectedSchedule.date), 'dd/MM/yyyy')}
                  </Text>
                  <Text className="mb-4">Ca: {selectedSchedule.shift}</Text>
                </View>
              )}

              <View className="flex-row justify-end space-x-4">
                <TouchableOpacity
                  className="bg-gray-200 px-4 py-2 rounded"
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text>Đóng</Text>
                </TouchableOpacity>

                {selectedSchedule && selectedSchedule.status === 'not_started' && (
                  <TouchableOpacity
                    className="bg-blue-500 px-4 py-2 rounded"
                    onPress={() => handleCheckin(selectedSchedule._id)}
                  >
                    <Text className="text-white">Check-in</Text>
                  </TouchableOpacity>
                )}

                {selectedSchedule && selectedSchedule.status === 'in_progress' && (
                  <TouchableOpacity
                    className="bg-green-500 px-4 py-2 rounded"
                    onPress={() => handleCheckout(selectedSchedule._id)}
                  >
                    <Text className="text-white">Check-out</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}