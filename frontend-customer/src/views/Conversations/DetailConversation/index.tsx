// pages/conversations/[id].tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'

import useConversationSocket from '@/hooks/useConversationSocket'
import { useAuth } from '@/context/AuthContext'
import { IConversation, IMessage } from '@/interface/conversation.interface'

// pages/conversations/[id].tsx

// pages/conversations/[id].tsx

// pages/conversations/[id].tsx

// pages/conversations/[id].tsx

const ConversationDetail = ({ id, onBackClick }: { id: string; onBackClick?: () => void }) => {
  const { authUser } = useAuth()
  const { data: conversation, isLoading, error, sendMessage } = useConversationSocket(id)
  const [message, setMessage] = useState('')
  const messageContainerRef = useRef<HTMLDivElement>(null)



  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [(conversation as IConversation)?.listMessage])

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
    if (message.trim() && (conversation as IConversation)?._id) {
      sendMessage((conversation as IConversation)._id, message)
      setMessage('')
    }
  }

  const getTimeString = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Function to get first letter of name for avatar fallback
  const getInitial = (name?: string) => {
    if (!name) return '?'
    return name.charAt(0).toUpperCase()
  }
  //yessir

  return (
    <div className="flex h-full flex-col bg-gray-100">
      {/* Conversation Header */}
      <div className="flex items-center border-b border-gray-200 bg-white p-4">

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-lg font-semibold text-white">
          {getInitial((conversation as IConversation)?.driverId?.name)}
        </div>
        <div className="ml-3">
          <h2 className="text-lg font-semibold">
            {(conversation as IConversation)?.driverId?.name}
          </h2>
          <p className="text-sm text-gray-600">Driver</p>
        </div>
      </div>

      {/* Message List */}
      <div ref={messageContainerRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {(conversation as IConversation)?.listMessage.map((msg, index) => {
          const isOutgoing = msg.senderId === authUser?.id
          return (
            <div
              key={index}
              className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs rounded-lg p-3 md:max-w-md ${isOutgoing ? 'bg-blue-500 text-white' : 'bg-white'
                  }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p
                  className={`mt-1 text-xs ${isOutgoing ? 'text-blue-100' : 'text-gray-500'}`}
                >
                  {getTimeString(msg.createdAt)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tin nhắn..."
            aria-label="Tin nhắn"
          />
          <button
            onClick={handleSendMessage}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            aria-label="Send message"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConversationDetail