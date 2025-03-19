// screens/ConversationDetail.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '~/context/AuthContext';
import useConversationSocket from '~/hook/useConversationSocket';
import { IConversation } from '~/interface/conversation';
export default function ConversationDetailScreen({ route }: { route: any }) {
    const { conversationId } = route.params;
    const { data: conversation, isLoading, error, sendMessage } = useConversationSocket(conversationId);
    const [message, setMessage] = useState('');
    const { user } = useAuth()

    const handleSendMessage = () => {
        if (message.trim()) {
            sendMessage(conversationId, message);
            setMessage('');
        }
    };

    useEffect(() => {
        console.log('conversation', conversation);

    }, [conversation]);


    useEffect(() => {
        console.log('user', user);

    }, [user]);


    const renderItem = ({ item }: { iteam: IMessage }) => (
        <View
            style={[
                styles.messageItem,
                item.senderId === user?.id ? styles.myMessage : styles.otherMessage,
            ]}
        >
            <Text style={styles.messageContent}>{item.content}</Text>
            <Text style={styles.messageTime}>
                {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {error.message}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={(conversation as IConversation)?.listMessage || []}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.messagesList}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Type a message..."
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
    messagesList: {
        padding: 16,
    },
    messageItem: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        maxWidth: '80%',
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#007bff',
    },
    otherMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
    },
    messageContent: {
        fontSize: 16,
        color: '#000',
    },
    messageTime: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    input: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginRight: 8,
    },
    sendButton: {
        padding: 12,
        backgroundColor: '#007bff',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});