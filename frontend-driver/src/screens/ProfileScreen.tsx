import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserProfile, UserProfile } from '../services/userService';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
      } catch (err) {
        setError('Không thể tải thông tin profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#00C000" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500 text-center px-4">{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView>
        {/* Header */}
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

        {/* Information Section */}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}