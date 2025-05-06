'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import useConversationSocket from '@/hooks/useConversationSocket'

import { useAuth } from '@/context/AuthContext'
import { IConversation, IMessage } from '@/interface/conversation.interface'
import ConversationDetail from './DetailConversation'

const ConversationListPage = () => {
  const searchParams = useSearchParams()
  const tripId = searchParams.get('tripId')

  const { authUser } = useAuth()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [showConversationList, setShowConversationList] = useState(true)
  const [showSearchSidebar, setShowSearchSidebar] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const messageContainerRef = useRef<HTMLDivElement>(null)
  const { data: conversations, isLoading: listLoading, error: listError } = useConversationSocket()

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance

    if (isLeftSwipe) {
      setShowSearchSidebar(false)
    }
  }

  // Find conversation by tripId and set it as selected
  useEffect(() => {
    console.log('TripId from URL:', tripId, 'Type:', typeof tripId);

    if (!tripId) return;

    if (conversations) {
      const conversationsArray = Array.isArray(conversations) ? conversations : [conversations];

      if (conversationsArray.length === 0) {
        console.log('No conversations available yet');
        return;
      }

      console.log('Searching for conversation with tripId:', tripId);

      // Debug: Log all tripIds to see what's available
      conversationsArray.forEach(conv => {
        const tripIdObj = conv.tripId as any;
        console.log(
          'Conv ID:', conv._id,
          'TripId:', tripIdObj?._id,
          'TripId type:', typeof conv.tripId,
          'Matches?', tripIdObj?._id && tripIdObj?._id === tripId
        );
      });

      // Find conversation where tripId._id matches the tripId from URL
      let foundConversation = conversationsArray.find(conv => {
        const tripIdObj = conv.tripId as any;
        return tripIdObj?._id === tripId;
      });

      console.log('Found conversation:', foundConversation);

      if (foundConversation) {
        console.log('Setting selected conversation to:', foundConversation._id);
        setSelectedConversationId(foundConversation._id);

        // Immediately show the conversation detail view (hide the list on mobile)
        if (isMobile) {
          setShowConversationList(false);
          setShowSearchSidebar(false);
        }
      } else {
        console.log('Could not find a conversation matching tripId:', tripId);
        // Log all tripIds to help debug
        console.log('Available tripIds:', conversationsArray.map(c => (c.tripId as any)?._id).join(', '));
      }
    } else {
      console.log('Conversations data not yet loaded');
    }
  }, [tripId, conversations, isMobile]);

  // Additional effect to ensure we have conversation selected when data is available
  useEffect(() => {
    const selectConversationFromTripId = () => {
      if (!tripId || !conversations || selectedConversationId) return;

      console.log('Running additional selection logic');
      const conversationsArray = Array.isArray(conversations) ? conversations : [conversations];

      for (const conv of conversationsArray) {
        // Check if tripId._id matches the URL tripId
        const tripIdObj = conv.tripId as any;
        if (tripIdObj?._id === tripId) {
          console.log('Found match in additional check, selecting:', conv._id);
          setSelectedConversationId(conv._id);
          if (isMobile) {
            setShowConversationList(false);
            setShowSearchSidebar(false);
          }
          break;
        }
      }
    };

    selectConversationFromTripId();
  }, [tripId, conversations, selectedConversationId, isMobile]);

  // Console log conversation data
  useEffect(() => {
    if (conversations) {
      const conversationsArray = Array.isArray(conversations) ? conversations : [conversations];
      if (conversationsArray.length > 0) {
        console.log('All conversations:', conversationsArray[0].tripId);
      }
    }
  }, [conversations]);

  // useEffect(() => {
  //   console.log('Selected conversation:', conversation)
  // }, [conversation])

  const [message, setMessage] = useState('')

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
    }
  }

  // useEffect(() => {
  //   scrollToBottom()
  // }, [(conversation as IConversation)?.listMessage])

  // Add useEffect to handle mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)

      // Only show conversation list on desktop if no conversation is selected
      if (!mobile && !selectedConversationId) {
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
        Đang tải danh sách cuộc trò chuyện...
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

  // const handleSendMessage = () => {
  //   if (message.trim() && selectedConversationId) {
  //     sendMessage(selectedConversationId, message)
  //     setMessage('')
  //   }
  // }

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
    <div className="flex h-[calc(100vh-72px)] flex-col bg-gray-100 md:flex-row">
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
        className={`fixed inset-0 z-50 flex w-full transform flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out md:relative md:inset-auto md:w-80 ${isMobile
          ? showSearchSidebar
            ? 'translate-x-0'
            : '-translate-x-full'
          : 'translate-x-0'
          }`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold">Tin nhắn</h1>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {(conversations as IConversation[])?.length > 0 ? (
            (conversations as IConversation[]).map((conv) => (
              <div
                key={conv._id}
                className={`flex cursor-pointer items-center border-b border-gray-200 p-4 hover:bg-gray-100 ${selectedConversationId === conv._id ? 'bg-blue-50' : ''}`}
                onClick={() => {
                  setSelectedConversationId(conv._id)
                  setShowConversationList(false)
                  setShowSearchSidebar(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSelectedConversationId(conv._id)
                    setShowConversationList(false)
                    setShowSearchSidebar(false)
                  }
                }}
                tabIndex={0}
                aria-label={`Conversation with ${conv.driverId?.name}`}
              >
                {/* Avatar */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-lg font-semibold text-white">
                  {getInitial(conv.driverId?.name)}
                </div>

                {/* Conversation Info */}
                <div className="ml-4 flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium truncate">{conv.driverId?.name}</h2>
                  </div>
                  <p className="text-sm text-gray-500">Cuốc xe {conv.tripCode}</p>
                  <div className="flex items-center text-sm text-gray-600 space-x-2">
                    <p className="truncate flex-1">
                      {conv.lastMessage?.content || 'Bắt đầu nhắn tin với tài xế'}
                    </p>
                    {conv.lastMessage?.timestamp && (
                      <>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-500 whitespace-nowrap">
                          {getTimeString(conv.lastMessage?.timestamp)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center">
              <p className="text-gray-500">Đang không có cuộc trò chuyện nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Conversation Area */}
      <div className="flex h-full flex-1 flex-col bg-gray-100">
        {selectedConversationId ? (
          <ConversationDetail
            id={selectedConversationId}
            onBackClick={handleBackToList}
          />
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
              <p className="text-lg text-gray-600">Chọn cuộc trò chuyện để trao đổi thông tin với tài xế</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationListPage
