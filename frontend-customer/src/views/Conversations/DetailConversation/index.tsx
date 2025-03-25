// pages/conversations/[id].tsx
'use client'

import React, { useState } from 'react'

import useConversationSocket from '@/hooks/useConversationSocket'

import { IConversation } from '@/interface/conversation.interface'

// pages/conversations/[id].tsx

// pages/conversations/[id].tsx

// pages/conversations/[id].tsx

const ConversationDetail = ({ id }: { id: string }) => {
  const { data: conversation, isLoading, error, sendMessage } = useConversationSocket(id as string)
  const [message, setMessage] = useState('')

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error: {error.message}
      </div>
    )
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage((conversation as IConversation)._id, message)
      setMessage('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="mb-6 text-2xl font-bold">Conversation Detail</h1>
      <div className="mb-6 space-y-4">
        {(conversation as IConversation)?.listMessage.map((msg, index) => (
          <div
            key={index}
            className={`rounded-lg p-4 ${msg.senderId === '' || 'userid' ? 'ml-auto w-3/4 bg-blue-100' : 'w-3/4 bg-white'
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
            className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSendMessage}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConversationDetail
