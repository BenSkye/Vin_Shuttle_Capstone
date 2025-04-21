import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';

interface ConfirmPauseModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => Promise<void>;
    isLoading: boolean;
    error?: string | null;
}

const ConfirmPauseModal: React.FC<ConfirmPauseModalProps> = ({
    visible,
    onClose,
    onConfirm,
    isLoading,
    error
}) => {
    const [pauseReason, setPauseReason] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const handleConfirm = async () => {
        if (!pauseReason.trim()) {
            setErrorMessage('Vui lòng nhập lý do tạm dừng!');
            return;
        }
        await onConfirm(pauseReason);
        setPauseReason('');
        setErrorMessage(null);
    };

    useEffect(() => {
        if (error) {
            setErrorMessage(error)
        }
        if (error === null) {
            setErrorMessage(null);
        }
    }, [error]);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="m-5 bg-white rounded-lg p-5 w-11/12">
                    {errorMessage && (
                        <Text className="text-red-500 mb-2">{errorMessage}</Text>
                    )}
                    <Text className="text-lg font-bold mb-4">Xác nhận tạm dừng ca làm</Text>

                    <Text className="mb-2">Lý do tạm dừng:</Text>
                    <TextInput
                        className="border border-gray-300 rounded p-3 mb-4"
                        placeholder="Nhập lý do tạm dừng..."
                        value={pauseReason}
                        onChangeText={setPauseReason}
                        multiline
                        numberOfLines={3}
                    />

                    <View className="flex-row justify-between">
                        <TouchableOpacity
                            className="px-4 py-2 bg-gray-300 rounded-lg"
                            onPress={onClose}
                            disabled={isLoading}
                        >
                            <Text className="font-medium">Hủy</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="px-4 py-2 bg-orange-500 rounded-lg"
                            onPress={handleConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="font-medium text-white">Xác nhận</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ConfirmPauseModal;