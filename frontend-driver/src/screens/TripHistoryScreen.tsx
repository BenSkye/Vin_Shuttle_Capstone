import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { getPersonalTrips, Trip, getRatingByTripId, Rating, getPaymentLinkTransferTrip } from '../services/tripServices';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { tripStatusText, TripStatus } from '../constants/trip.enum';
import { TripCard } from '~/components/TripHistory/TripCard';
import { TripDetailsModal } from '~/components/TripHistory/TripDetailsModal';

type TabType = 'paid' | 'unpaid';

export default function TripHistoryScreen({ navigation }: { navigation: any }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [tripRating, setTripRating] = useState<Rating | null>(null);
  const [loadingRating, setLoadingRating] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('paid');

  const fetchTrips = async () => {
    try {
      setLoading(true);
      let allTrips: Trip[] = [];

      if (activeTab === 'paid') {
        allTrips = await getPersonalTrips({ isPayed: true, orderBy: 'updatedAt', sortOrder: 'desc' });
      } else {
        allTrips = await getPersonalTrips({ isPrepaid: false, isPayed: false, status: TripStatus.COMPLETED, orderBy: 'updatedAt', sortOrder: 'desc' });
      }

      // Filter only completed and cancelled trips
      const historyTrips = allTrips.filter((trip) =>
        [TripStatus.COMPLETED, TripStatus.CANCELLED].includes(trip.status)
      );

      setTrips(historyTrips);
    } catch (error) {
      console.error('Error fetching trip history:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTrips();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTrips();
  }, [activeTab]);

  useEffect(() => {
    // Refresh when returning to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTrips();
    });

    return unsubscribe;
  }, [navigation, activeTab]);

  const handleShowTripDetails = async (trip: Trip) => {
    setSelectedTrip(trip);
    setShowTripDetails(true);

    // Fetch rating when showing trip details
    setLoadingRating(true);
    try {
      const ratingData = await getRatingByTripId(trip._id);
      setTripRating(ratingData as unknown as Rating);
    } catch (error) {
      console.error('Error fetching trip rating:', error);
      setTripRating(null);
    } finally {
      setLoadingRating(false);
    }
  };

  const handleTransferTrip = async () => {
    // Lọc ra các trip có isPrepaid là false và isPayed là false
    const unpaidTrips = trips.filter((trip) => !trip.isPrepaid && !trip.isPayed);
    const tripIds = unpaidTrips.map((trip) => trip._id);
    if (tripIds.length === 0) {
      Alert.alert('Thông báo', 'Không có cuốc xe nào cần thanh toán.');
      return;
    }
    const totalAmount = unpaidTrips.reduce((total, trip) => total + trip.amount, 0);
    // atlert cho người dùng biết số tiền cần chuyển và xác nhận 
    const confirmMessage = `Tổng số tiền cần chuyển cho hệ thống là ${totalAmount.toLocaleString('vi-VN')} VNĐ. Bạn có chắc chắn muốn chuyển tiền không?`;
    const userConfirmed = await new Promise((resolve) => {
      Alert.alert(
        'Xác Nhận',
        confirmMessage,
        [
          { text: 'Không', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Xác Nhận', onPress: () => resolve(true) },
        ]
      );
    });
    if (!userConfirmed) return;
    console.log('Chuyển tiền cho hệ thống với các cuốc xe:', tripIds);
    try {
      const paymentResult = await getPaymentLinkTransferTrip(tripIds);
      console.log('Payment link:', paymentResult);
      const paymentLink = paymentResult.paymentUrl;
      // Mở liên kết thanh toán trong trình duyệt
      Linking.openURL(paymentLink);
    } catch (error) {
      console.error('Error fetching payment link:', error);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="mt-10 flex-row items-center">
        {/* Nút Quay lại */}
        <TouchableOpacity
          className="p-2"
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="ml-2 text-xl font-bold text-gray-800">
          <Icon name="history" size={24} color="#1f2937" /> Lịch sử Cuốc Xe
        </Text>
      </View>

      {/* Tab Selector */}
      <View className="flex-row border-b border-gray-200 bg-white">
        <TouchableOpacity
          className={`flex-1 items-center py-3 ${activeTab === 'paid' ? 'border-b-2 border-blue-500' : ''}`}
          onPress={() => setActiveTab('paid')}
        >
          <Text className={`font-medium ${activeTab === 'paid' ? 'text-blue-600' : 'text-gray-500'}`}>
            Đã thanh toán
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 items-center py-3 ${activeTab === 'unpaid' ? 'border-b-2 border-blue-500' : ''}`}
          onPress={() => setActiveTab('unpaid')}
        >
          <Text className={`font-medium ${activeTab === 'unpaid' ? 'text-blue-600' : 'text-gray-500'}`}>
            Chưa thanh toán
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="p-4">
          {activeTab === "unpaid" && (
            <TouchableOpacity
              className="flex-row items-center justify-center rounded-lg py-3 mb-2 bg-blue-500"
              onPress={handleTransferTrip}
            >
              <Icon name="bank-transfer" size={20} color="white" />
              <Text className="ml-2 text-white font-medium">
                Chuyển tiền hệ thống các cuốc xe tài xế thu tiền
              </Text>
            </TouchableOpacity>
          )}

          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : trips.length > 0 ? (
            trips.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
                onPress={() => handleShowTripDetails(trip)}
              />
            ))
          ) : (
            <View className="flex-row items-center justify-center rounded-lg bg-white p-8 shadow-sm">
              <Icon name="history-off" size={24} color="#6b7280" />
              <Text className="ml-2 text-center text-gray-500">
                {activeTab === 'paid'
                  ? 'Không có cuốc xe đã thanh toán nào'
                  : 'Không có cuốc xe chưa thanh toán nào'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TripDetailsModal
        visible={showTripDetails}
        onClose={() => setShowTripDetails(false)}
        trip={selectedTrip}
        tripRating={tripRating}
        loadingRating={loadingRating}
      />
    </SafeAreaView>
  );
}