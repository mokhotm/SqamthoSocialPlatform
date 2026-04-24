import { Routes, Route } from 'react-router-dom';
import { ConversationList } from '@/components/conversations/conversation-list';
import { ConversationView } from '@/components/conversations/conversation-view';
import { NewConversationDialog } from '@/components/conversations/new-conversation-dialog';

export function ConversationsPage() {
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Conversations</h1>
        <NewConversationDialog />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <ConversationList />
        </div>
        <div className="col-span-8">
          <Routes>
            <Route path=":conversationId" element={<ConversationView />} />
            <Route
              path="*"
              element={
                <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                  <p className="text-muted-foreground">
                    Select a conversation to view messages
                  </p>
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}
