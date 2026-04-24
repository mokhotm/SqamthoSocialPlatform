import express, { Response, Request } from 'express';
import { db } from '../db.js';
import { conversations, conversationParticipants, messages, users } from '../../shared/schema.js';
import { sql } from 'drizzle-orm';

// TypeScript doesn't know these modules exist yet, so we'll manually import them
// @ts-ignore
import { authenticateToken } from '../middleware/auth.js';
// @ts-ignore
import { io } from '../socket.js';

const router = express.Router();

// Type definitions
interface RequestWithUser extends Request {
    user?: {
        id: number;
    };
}

interface ConversationResponse {
    id: number;
    userId: number | null;
    user: {
        id: number;
        username: string;
        displayName: string | null;
        profilePicture: string | null;
    };
    lastMessage: {
        content: string | null;
        timestamp: Date | null;
    } | null;
    unreadCount: number;
}

interface MessageResponse {
    id: number;
    content: string;
    userId: number;
    timestamp: Date;
    read: boolean;
}

// Get all conversations for a user
router.get('/', authenticateToken, async (req: RequestWithUser, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Get all conversations where the user is a participant
        const result = await db.execute(sql`
            SELECT 
                cp1.conversation_id,
                u.id as other_user_id,
                u.username as other_username, 
                u.display_name as other_display_name,
                u.profile_picture as other_profile_picture,
                m.content as message_content,
                m.timestamp as message_timestamp,
                COUNT(CASE WHEN m2.read = false AND m2.user_id != ${userId} THEN 1 ELSE NULL END) as unread_count
            FROM conversation_participants cp1
            JOIN conversation_participants cp2 
                ON cp1.conversation_id = cp2.conversation_id AND cp2.user_id != ${userId}
            JOIN users u ON cp2.user_id = u.id
            LEFT JOIN LATERAL (
                SELECT * FROM messages 
                WHERE conversation_id = cp1.conversation_id 
                ORDER BY timestamp DESC LIMIT 1
            ) m ON true
            LEFT JOIN messages m2 ON m2.conversation_id = cp1.conversation_id
            WHERE cp1.user_id = ${userId}
            GROUP BY cp1.conversation_id, u.id, u.username, u.display_name, u.profile_picture, m.content, m.timestamp
            ORDER BY m.timestamp DESC NULLS LAST
        `);

        // Transform the results into the expected response format
        const conversationResponse: ConversationResponse[] = [];
        if (Array.isArray(result)) {
            for (const row of result) {
                conversationResponse.push({
                    id: row.conversation_id,
                    userId: row.other_user_id,
                    user: {
                        id: row.other_user_id,
                        username: row.other_username,
                        displayName: row.other_display_name,
                        profilePicture: row.other_profile_picture
                    },
                    lastMessage: row.message_content ? {
                        content: row.message_content,
                        timestamp: row.message_timestamp
                    } : null,
                    unreadCount: Number(row.unread_count) || 0
                });
            }
        }

        res.json(conversationResponse);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get messages for a specific conversation
router.get('/:conversationId/messages', authenticateToken, async (req: RequestWithUser, res: Response) => {
    const userId = req.user?.id;
    const conversationId = parseInt(req.params.conversationId);

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (isNaN(conversationId)) {
        return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    try {
        // Verify the user is a participant in this conversation
        const participants = await db.execute(sql`
            SELECT * FROM conversation_participants 
            WHERE conversation_id = ${conversationId} AND user_id = ${userId}
        `);
            
        if (!Array.isArray(participants) || participants.length === 0) {
            return res.status(403).json({ error: 'You are not a participant in this conversation' });
        }

        // Get the messages for the conversation
        const conversationMessages = await db.execute(sql`
            SELECT id, content, user_id, timestamp, read
            FROM messages
            WHERE conversation_id = ${conversationId}
            ORDER BY timestamp DESC
        `);

        // Mark messages as read
        await db.execute(sql`
            UPDATE messages
            SET read = true
            WHERE conversation_id = ${conversationId}
              AND user_id != ${userId}
              AND read = false
        `);

        // Transform the results to match expected format
        const formattedMessages: MessageResponse[] = [];
        if (Array.isArray(conversationMessages)) {
            for (const msg of conversationMessages) {
                formattedMessages.push({
                    id: msg.id,
                    content: msg.content,
                    userId: msg.user_id,
                    timestamp: msg.timestamp,
                    read: msg.read
                });
            }
        }

        return res.json(formattedMessages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Send a message in a conversation
router.post('/:conversationId/messages', authenticateToken, async (req: RequestWithUser, res: Response) => {
    const userId = req.user?.id;
    const conversationId = parseInt(req.params.conversationId);
    const { content } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (isNaN(conversationId)) {
        return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Message content is required' });
    }

    try {
        // Check if the user is a participant in the conversation
        const participants = await db.execute(sql`
            SELECT * FROM conversation_participants 
            WHERE conversation_id = ${conversationId} AND user_id = ${userId}
        `);

        if (!Array.isArray(participants) || participants.length === 0) {
            return res.status(403).json({ error: 'You are not a participant in this conversation' });
        }

        // Create the new message
        const newMessages = await db.execute(sql`
            INSERT INTO messages (conversation_id, user_id, content, read, timestamp)
            VALUES (${conversationId}, ${userId}, ${content}, false, NOW())
            RETURNING id, conversation_id, user_id, content, read, timestamp
        `);

        if (!Array.isArray(newMessages) || newMessages.length === 0) {
            return res.status(500).json({ error: 'Failed to create message' });
        }

        const newMessage = newMessages[0];

        // Notify all participants via socket
        io.to(`conversation:${conversationId}`).emit('messageReceived', {
            messageId: newMessage.id,
            conversationId: conversationId,
            senderId: userId,
            content: content,
            timestamp: newMessage.timestamp
        });

        // Format the result
        const formattedMessage = {
            id: newMessage.id,
            conversationId: newMessage.conversation_id,
            userId: newMessage.user_id,
            content: newMessage.content,
            read: newMessage.read,
            timestamp: newMessage.timestamp
        };

        return res.status(201).json(formattedMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new conversation
router.post('/', authenticateToken, async (req: RequestWithUser, res: Response) => {
    const userId = req.user?.id;
    const { participantId } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!participantId) {
        return res.status(400).json({ error: 'Participant ID is required' });
    }

    const participantIdNum = Number(participantId);

    try {
        // Check if the participant user exists
        const participantUsers = await db.execute(sql`
            SELECT * FROM users WHERE id = ${participantIdNum}
        `);
        
        if (!Array.isArray(participantUsers) || participantUsers.length === 0) {
            return res.status(404).json({ error: 'Participant user not found' });
        }

        // Check if conversation between these users already exists
        const existingConversations = await db.execute(sql`
            SELECT cp1.conversation_id 
            FROM conversation_participants cp1
            JOIN conversation_participants cp2 
                ON cp1.conversation_id = cp2.conversation_id 
                AND cp1.user_id = ${userId} 
                AND cp2.user_id = ${participantIdNum}
        `);

        if (Array.isArray(existingConversations) && existingConversations.length > 0) {
            // Get the existing conversation details
            const existingConversation = existingConversations[0];
            const conversationId = existingConversation.conversation_id;

            // Get participant details
            const otherUser = await db.execute(sql`
                SELECT id, username, display_name, profile_picture
                FROM users
                WHERE id = ${participantIdNum}
            `);
            
            if (!Array.isArray(otherUser) || otherUser.length === 0) {
                return res.status(404).json({ error: 'Participant user details not found' });
            }

            return res.status(200).json({
                id: conversationId,
                userId: participantIdNum,
                user: {
                    id: otherUser[0].id,
                    username: otherUser[0].username,
                    displayName: otherUser[0].display_name,
                    profilePicture: otherUser[0].profile_picture
                },
                lastMessage: null,
                unreadCount: 0,
                message: 'Conversation already exists'
            });
        }

        // Create a new conversation
        const newConversationResult = await db.execute(sql`
            WITH new_conversation AS (
                INSERT INTO conversations (created_by, created_at)
                VALUES (${userId}, NOW())
                RETURNING id
            )
            INSERT INTO conversation_participants (conversation_id, user_id)
            SELECT id, ${userId} FROM new_conversation
            UNION ALL
            SELECT id, ${participantIdNum} FROM new_conversation
            RETURNING conversation_id
        `);
        
        if (!Array.isArray(newConversationResult) || newConversationResult.length === 0) {
            return res.status(500).json({ error: 'Failed to create conversation' });
        }
        
        const conversationId = newConversationResult[0].conversation_id;

        // Get participant details
        const otherUser = await db.execute(sql`
            SELECT id, username, display_name, profile_picture
            FROM users
            WHERE id = ${participantIdNum}
        `);
        
        if (!Array.isArray(otherUser) || otherUser.length === 0) {
            return res.status(500).json({ error: 'Failed to get participant details' });
        }

        // Return the new conversation with participant details
        return res.status(201).json({
            id: conversationId,
            userId: participantIdNum,
            user: {
                id: otherUser[0].id,
                username: otherUser[0].username,
                displayName: otherUser[0].display_name,
                profilePicture: otherUser[0].profile_picture
            },
            lastMessage: null,
            unreadCount: 0
        });
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
