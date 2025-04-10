'use client'

import React, { useEffect, useRef, useState } from 'react'

import useConversationSocket from '@/hooks/useConversationSocket'

import { useAuth } from '@/context/AuthContext'
import { IConversation, IMessage } from '@/interface/conversation.interface'

const ConversationListPage = () => {
  const { authUser } = useAuth()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [showConversationList, setShowConversationList] = useState(true)
  const [showSearchSidebar, setShowSearchSidebar] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const messageContainerRef = useRef<HTMLDivElement>(null)
  const { data: conversations, isLoading: listLoading, error: listError } = useConversationSocket()

  const {
    data: conversation,
    isLoading: conversationLoading,
    error: conversationError,
    sendMessage,
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

  // Add useEffect to handle mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)

      if (!mobile) {
        setShowConversationList(true)
      } else if (selectedConversationId && mobile) {
        setShowConversationList(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [selectedConversationId])

  const toggleSearchSidebar = () => {
    setShowSearchSidebar(!showSearchSidebar)
  }

  const handleBackToList = () => {
    setShowConversationList(true)
    setShowSearchSidebar(false)
  }

  if (listLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        Loading conversations...
      </div>
    )
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
    <div className="flex h-screen flex-col bg-gray-100 md:flex-row">
      {/* Mobile Toggle Button */}
      <button
        className="fixed left-0 top-1/2 z-50 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-r-lg bg-blue-500 text-white shadow-lg md:hidden"
        onClick={toggleSearchSidebar}
        aria-label="Toggle search sidebar"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 5l7 7-7 7M5 5l7 7-7 7"
          ></path>
        </svg>
      </button>

      {/* Sidebar (Conversation List) */}
      <div
        className={`fixed inset-0 z-50 flex w-full transform flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out md:relative md:inset-auto md:w-80 ${
          // On mobile
          isMobile
            ? showSearchSidebar
              ? 'translate-x-0'
              : '-translate-x-full'
            : // On desktop
            'translate-x-0'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold">Conversations</h1>
          <div className="flex space-x-2">
            <button className="rounded-full p-2 hover:bg-gray-200" aria-label="New conversation">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
            </button>
            <button
              className="rounded-full p-2 hover:bg-gray-200 md:hidden"
              onClick={() => setShowSearchSidebar(false)}
              aria-label="Close sidebar"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Search conversations"
            className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search conversations"
          />
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {(conversations as IConversation[]).map((conv) => (
            <div
              key={conv._id}
              className={`flex cursor-pointer items-center border-b border-gray-200 p-4 hover:bg-gray-100 ${selectedConversationId === conv._id ? 'bg-blue-50' : ''}`}
              onClick={() => {
                setSelectedConversationId(conv._id)
                if (isMobile) {
                  setShowConversationList(false)
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedConversationId(conv._id)}
              tabIndex={0}
              aria-label={`Conversation with ${conv.driverId?.name}`}
            >
              {/* Avatar */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-lg font-semibold text-white">
                {getInitial(conv.driverId?.name)}
              </div>
              {/* Conversation Info */}
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  {/* Tên tài xế - làm nổi bật */}
                  <h2 className="text-base font-semibold text-gray-900 truncate">
                    {conv.driverId?.name || 'Tài xế'}
                  </h2>

                  {/* Mã chuyến đi - thêm background highlight */}
                  <div className="flex-shrink-0 bg-blue-50 rounded-md px-2 py-1">
                    <span className="text-sm font-medium text-blue-700">
                      {conv.tripCode}
                    </span>
                  </div>
                </div>

                {/* Dòng thời gian + tin nhắn */}
                <div className="mt-1 flex items-center justify-between gap-2">
                  {/* Tin nhắn cuối - làm nổi bật khi có nội dung */}
                  <p className={`text-sm truncate ${conv.lastMessage?.content ? 'text-gray-800 font-medium' : 'text-gray-500 italic'}`}>
                    {conv.lastMessage?.content || 'Bắt đầu nhắn tin với tài xế'}
                  </p>

                  {/* Thời gian - làm mờ và nhỏ hơn */}
                  <span className="flex-shrink-0 text-xs text-gray-400">
                    {getTimeString(conv.lastMessage?.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Conversation Area */}
      <div className="flex h-full flex-1 flex-col bg-gray-100">
        {selectedConversationId ? (
          conversationLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <p>Loading conversation...</p>
            </div>
          ) : conversationError ? (
            <div className="flex flex-1 items-center justify-center text-red-500">
              Error: {conversationError.message}
            </div>
          ) : (
            <>
              {/* Conversation Header */}
              <div className="flex items-center border-b border-gray-200 bg-white p-4">
                <button
                  className="mr-3 rounded-full p-2 hover:bg-gray-200 md:hidden"
                  onClick={handleBackToList}
                  aria-label="Back to conversations"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    ></path>
                  </svg>
                </button>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-lg font-semibold text-white">
                  {getInitial((conversation as IConversation)?.driverId?.name)}
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-semibold">
                    {(conversation as IConversation)?.tripCode}- {(conversation as IConversation)?.driverId?.name}
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
                        <p>{msg.content}</p>
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
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-48 w-48 items-center justify-center rounded-full bg-gray-200">
                <svg
                  className="h-24 w-24 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  ></path>
                </svg>
              </div>
              <p className="text-lg text-gray-600">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationListPage
