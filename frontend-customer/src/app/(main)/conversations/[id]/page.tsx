import { use } from 'react'

import ConversationDetail from '@/views/Conversations/DetailConversation'

export default function ConversationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = use(params).id
  return <ConversationDetail id={id} />
}
