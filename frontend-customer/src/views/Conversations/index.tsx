'use client'

import React from 'react'

import Link from 'next/link'

import useConversationSocket from '@/hooks/useConversationSocket'

import { IConversation } from '@/interface/conversation.interface'

const ConversationListPage = () => {
  const { data: conversations, isLoading, error } = useConversationSocket()

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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="mb-6 text-2xl font-bold">Conversations</h1>
      <div className="space-y-4">
        {(conversations as IConversation[]).map((conversation) => (
          <Link
            key={conversation._id}
            href={`/conversations/${conversation._id}`}
            className="block rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{conversation.driverId?.name}</h3>
              <p className="text-sm text-gray-600">
                {conversation.lastMessage?.content || 'Bắt đầu nhắn tin với tài xế'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default ConversationListPage
