'use client'

import React, { useState, useRef, useEffect } from 'react'
import useConversationSocket from '@/hooks/useConversationSocket'
import { IConversation, IMessage } from '@/interface/conversation.interface'
import { useAuth } from '@/context/AuthContext'

const ConversationListPage = () => {
  const { authUser } = useAuth()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const messageContainerRef = useRef<HTMLDivElement>(null)
  const {
    data: conversations,
    isLoading: listLoading,
    error: listError
  } = useConversationSocket()

  const {
    data: conversation,
    isLoading: conversationLoading,
    error: conversationError,
    sendMessage
  } = useConversationSocket(selectedConversationId || undefined)

  const [message, setMessage] = useState('')

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [(conversation as IConversation)?.listMessage])

  if (listLoading) {
    return <div className="flex h-[calc(100vh-64px)] items-center justify-center">Loading conversations...</div>
  }

  if (listError) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center text-red-500">
        Error: {listError.message}
      </div>
    )
  }

  const handleSendMessage = () => {
    if (message.trim() && selectedConversationId) {
      sendMessage(selectedConversationId, message)
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

  return (
    <div className="h-[calc(100vh-64px)] flex bg-gray-100">
      {/* Sidebar (Conversation List) */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Conversations</h1>
          <div className="flex space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-200" aria-label="New conversation">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200" aria-label="Settings">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Search conversations"
            className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search conversations"
          />
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {(conversations as IConversation[]).map((conv) => (
            <div
              key={conv._id}
              className={`flex items-center p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-200 ${selectedConversationId === conv._id ? 'bg-blue-50' : ''
                }`}
              onClick={() => setSelectedConversationId(conv._id)}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedConversationId(conv._id)}
              tabIndex={0}
              aria-label={`Conversation with ${conv.driverId?.name}`}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                {getInitial(conv.driverId?.name)}
              </div>
              {/* Conversation Info */}
              <div className="flex-1 ml-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium">{conv.driverId?.name}</h2>
                  <span className="text-sm text-gray-500">{getTimeString(conv.lastMessage?.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {conv.lastMessage?.content || 'Bắt đầu nhắn tin với tài xế'}
                </p>
              </div>
              {/* Unread Badge - Can be implemented when you have unread message functionality */}
              {false && (
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                  1
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Conversation Area */}
      <div className="flex-1 flex flex-col bg-gray-100">
        {selectedConversationId ? (
          conversationLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <p>Loading conversation...</p>
            </div>
          ) : conversationError ? (
            <div className="flex-1 flex items-center justify-center text-red-500">
              Error: {conversationError.message}
            </div>
          ) : (
            <>
              {/* Conversation Header */}
              <div className="p-4 bg-white border-b border-gray-200 flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                  {getInitial((conversation as IConversation)?.driverId?.name)}
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-semibold">{(conversation as IConversation)?.driverId?.name}</h2>
                  <p className="text-sm text-gray-600">Driver</p>
                </div>
              </div>

              {/* Message List */}
              <div
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {(conversation as IConversation)?.listMessage.map((msg, index) => {
                  const isOutgoing = msg.senderId === authUser?.id;
                  return (
                    <div
                      key={index}
                      className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs md:max-w-md rounded-lg p-3 ${isOutgoing ? 'bg-blue-500 text-white' : 'bg-white'
                        }`}>
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isOutgoing ? 'text-blue-100' : 'text-gray-500'}`}>
                          {getTimeString(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type a message..."
                    aria-label="Type a message"
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
            </>
          )
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-48 h-48 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
              </div>
              <p className="text-gray-600 text-lg">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationListPage
