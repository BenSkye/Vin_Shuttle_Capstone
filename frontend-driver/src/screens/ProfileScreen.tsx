//@ts-nocheck
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserProfile, UserProfile } from '../services/userServices';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authServices';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '~/context/AuthContext';

// Định nghĩa type cho navigation
type RootStackParamList = {
  Profile: undefined;
  TripHistory: undefined;
  Login: undefined;
  // ... other screens
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const { userHaslogout } = useAuth();
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        } else {
          setError('Không thể tải thông tin profile. Vui lòng thử lại sau.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true); // Hiển thị loading khi đăng xuất
      
      // Cập nhật context (sẽ xóa push token và thông tin đăng nhập)
      await userHaslogout();
      
      // Điều hướng về Login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Hiển thị thông báo lỗi nếu cần
      setError('Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.');
    } finally {
      setLoading(false); // Đảm bảo tắt loading kể cả khi có lỗi
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#00C000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView>
        <View className="bg-white px-4 pt-6 pb-8">
          <Text className="text-2xl font-bold text-gray-800 mb-6">Thông tin cá nhân</Text>
          <View className="items-center">
            <View className="relative">
              <Image
                source={
                  imageError || !profile?.avatar
                    ? require('../assets/default-avatar.png')
                    : { uri: profile.avatar }
                }
                className="w-28 h-28 rounded-full"
                onError={() => setImageError(true)}
              />
              <View className="absolute bottom-0 right-0 bg-gray-100 p-2 rounded-full border-2 border-white">
                <Ionicons name="camera" size={20} color="#00C000" />
              </View>
            </View>
            <Text className="text-xl font-semibold mt-4 text-gray-800">{profile?.name}</Text>
            <Text className="text-gray-500 mt-1">Tài xế</Text>
          </View>
        </View>

        <View className="px-4 mt-4">
          <View className="bg-white rounded-xl shadow-sm">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800 mb-4">Thông tin liên hệ</Text>
              <View className="space-y-4">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center">
                    <Ionicons name="call-outline" size={20} color="#00C000" />
                  </View>
                  <View className="ml-3">
                    <Text className="text-gray-500 text-sm">Số điện thoại</Text>
                    <Text className="text-gray-800 font-medium">{profile?.phone}</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center">
                    <Ionicons name="mail-outline" size={20} color="#00C000" />
                  </View>
                  <View className="ml-3">
                    <Text className="text-gray-500 text-sm">Email</Text>
                    <Text className="text-gray-800 font-medium">{profile?.email}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            className="mt-6 bg-red-500 rounded-xl p-4 flex-row items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text className="text-white font-medium ml-2">Đăng xuất</Text>
          </TouchableOpacity>

          {error && (
            <Text className="text-red-500 text-center mt-4 px-4">{error}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}