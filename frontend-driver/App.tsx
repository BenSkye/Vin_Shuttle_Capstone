// App.tsx
import React, { useEffect, useRef } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import './global.css';
import * as Notifications from 'expo-notifications';

import { ScheduleProvider } from '~/context/ScheduleContext';
import { LocationProvider } from '~/context/LocationContext';
import { AuthProvider } from '~/context/AuthContext';
import { NotificationProvider } from '~/context/NotificationContext';
import { useNavigationContainerRef } from '@react-navigation/native';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
export default function App() {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Lắng nghe thông báo khi ứng dụng đang chạy (foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Lắng nghe khi người dùng nhấn vào thông báo
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('User tapped on notification:', data);

      // Chỉ hiển thị thông báo, không điều hướng
      alert(`Bạn vừa nhận được thông báo: ${data.notification?.title || 'Không có tiêu đề'}`);
    });

    // Cleanup
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);
  return (
    <AuthProvider>
      <NotificationProvider>
        <ScheduleProvider>
          <LocationProvider>
            <AppNavigator />
          </LocationProvider>
        </ScheduleProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}