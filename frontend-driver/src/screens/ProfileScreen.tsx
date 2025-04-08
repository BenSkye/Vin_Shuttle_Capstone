//@ts-nocheck
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserProfile, UserProfile } from '../services/userServices';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '~/context/AuthContext';

// Define type for navigation
type RootStackParamList = {
  Profile: undefined;
  TripHistory: undefined;
  Login: undefined;
  // ... other screens
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const settingsOptions = [
  { title: 'Thông tin cá nhân', icon: 'person', color: '#1E88E5' },
  { title: 'Thông báo', icon: 'notifications', color: '#FB8C00' },
  { title: 'Lịch sử cuốc xe', icon: 'time', color: '#29B6F6' },
  { title: 'Thay đổi mật khẩu', icon: 'lock-closed', color: '#8E24AA' },
  { title: 'Hỗ trợ', icon: 'help-circle', color: '#43A047' },
  { title: 'Điều khoản sử dụng', icon: 'document-text', color: '#EC407A' },
  { title: 'Đăng xuất', icon: 'log-out', color: '#F4511E' },
];

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
        console.log('profile user', data)
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

  const handleOptionPress = async (option: string) => {
    if (option === 'Đăng xuất') {
      await handleLogout();
    } else if (option === 'Lịch sử cuốc xe') {
      navigation.navigate('TripHistory');
    }
    // Add other option handlers as needed
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await userHaslogout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      setError('Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#00C000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Profile Section */}
        <View className="m-4 flex-row items-center rounded-xl bg-gray-100 p-5">
          <Image
            source={
              imageError || !profile?.avatar
                ? require('../assets/default-avatar.png')
                : { uri: profile.avatar }
            }
            className="h-14 w-14 rounded-full"
            onError={() => setImageError(true)}
          />
          <View className="ml-4">
            <Text className="text-base font-bold text-gray-800">{profile?.name || 'Tài xế'}</Text>
            <TouchableOpacity>
              <Text className="mt-1 text-blue-500">Chỉnh sửa tài khoản</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Options */}
        {settingsOptions.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row items-center border-b border-gray-200 px-5 py-4"
            onPress={() => handleOptionPress(item.title)}
          >
            <View
              className="mr-4 h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: item.color }}
            >
              <Ionicons name={item.icon} size={20} color="#fff" />
            </View>
            <Text className="flex-1 text-base text-gray-800">{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#777" />
          </TouchableOpacity>
        ))}

        {error && <Text className="mt-4 text-center text-red-500">{error}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}
