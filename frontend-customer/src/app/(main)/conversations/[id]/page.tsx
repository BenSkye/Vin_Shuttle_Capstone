// pages/conversations/[id].tsx
'use client';
import React, { use, useState } from 'react';
import { useRouter } from 'next/router';
import useConversationSocket from '@/hooks/useConversationSocket';
import { IConversation } from '@/interface/conversation';

const ConversationDetail = ({ params }: { params: Promise<{ id: string }> }) => {
    const id = use(params).id;
    const { data: conversation, isLoading, error, sendMessage } = useConversationSocket(id as string);
    const [message, setMessage] = useState('');

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">Error: {error.message}</div>;
    }

    const handleSendMessage = () => {
        if (message.trim()) {
            sendMessage((conversation as IConversation)._id, message);
            setMessage('');
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Conversation Detail</h1>
            <div className="space-y-4 mb-6">
                {(conversation as IConversation)?.listMessage.map((msg, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg ${msg.senderId === '' || 'userid' ? 'bg-blue-100 ml-auto w-3/4' : 'bg-white w-3/4'
                            }`}
                    >
                        <p className="text-gray-800">{msg.content}</p>
                        <small className="text-xs text-gray-500">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                        </small>
                    </div>
                ))}
            </div>
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type a message..."
                    />
                    <button
                        onClick={handleSendMessage}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConversationDetail;