'use client';
import React from 'react';
import useConversationSocket from '@/hooks/useConversationSocket';
import Link from 'next/link';
import { IConversation } from '@/interface/conversation';

const ConversationListPage = () => {
    const { data: conversations, isLoading, error } = useConversationSocket();

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">Error: {error.message}</div>;
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Conversations</h1>
            <div className="space-y-4">
                {(conversations as IConversation[]).map((conversation) => (
                    <Link
                        key={conversation._id}
                        href={`/conversations/${conversation._id}`}
                        className="block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">
                                {conversation.driverId?.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {conversation.lastMessage?.content || 'Bắt đầu nhắn tin với tài xế'}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ConversationListPage;