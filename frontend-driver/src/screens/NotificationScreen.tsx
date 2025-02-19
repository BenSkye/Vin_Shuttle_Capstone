import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationScreen() {
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <Text className="text-xl">Chào mừng bạn đến với ứng dụng tài xế</Text>
    </SafeAreaView>
  );
}