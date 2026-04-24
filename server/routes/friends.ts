import express from 'express';
import { storage } from '../storage.js';
import { friends, users, type User } from '../../shared/schema.js';
import { sql } from 'drizzle-orm';
import { db } from '../db.js';
import { getAuthenticatedUserId } from '../middleware/session-auth.js';

const router = express.Router();

/**
 * Helper to determine the inverse relationship based on specified relationship and gender
 * @param relationship The relationship specified by the receiver (e.g., 'Father')
 * @param gender The gender of the receiver (e.g., 'Male')
 * @returns The inverse relationship (e.g., 'Son')
 */
function getInverseRelationship(relationship: string, gender: string | null): string | null {
  if (!relationship) return null;
  
  const rel = relationship.toLowerCase();
  const gen = (gender || 'unknown').toLowerCase();
  
  // Mapping of relationship -> [male_inverse, female_inverse, unknown_inverse]
  const inverseMap: Record<string, [string, string, string]> = {
    'father': ['Son', 'Daughter', 'Child'],
    'mother': ['Son', 'Daughter', 'Child'],
    'son': ['Father', 'Mother', 'Parent'],
    'daughter': ['Father', 'Mother', 'Parent'],
    'brother': ['Brother', 'Sister', 'Sibling'],
    'sister': ['Brother', 'Sister', 'Sibling'],
    'spouse': ['Spouse', 'Spouse', 'Spouse'],
    'grandfather': ['Grandson', 'Granddaughter', 'Grandchild'],
    'grandmother': ['Grandson', 'Granddaughter', 'Grandchild'],
    'grandson': ['Grandfather', 'Grandmother', 'Grandparent'],
    'granddaughter': ['Grandfather', 'Grandmother', 'Grandparent'],
    'friend': ['Friend', 'Friend', 'Friend']
  };
  
  if (inverseMap[rel]) {
    if (gen === 'male') return inverseMap[rel][0];
    if (gen === 'female') return inverseMap[rel][1];
    return inverseMap[rel][2];
  }
  
  return null;
}

// Get family tree for a user
router.get('/family-tree/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID' });

  try {
    // 1. Get the target user
    const { rows: userRows } = await db.execute(sql`
      SELECT id, username, display_name as "displayName", profile_picture as "profilePicture"
      FROM users
      WHERE id = ${userId}
    `);
    
    if (userRows.length === 0) return res.status(404).json({ error: 'User not found' });
    const targetUser = userRows[0];

    // 2. Get all accepted or pending relationships defined by the user (Bidirectional)
    const { rows: relatives } = await db.execute(sql`
      SELECT 
        u.id,
        u.username,
        u.display_name as "displayName",
        u.profile_picture as "profilePicture",
        f.relationship,
        f.birth_year as "birthYear",
        f.death_year as "deathYear",
        f.is_deceased as "isDeceased"
      FROM friends f
      JOIN users u ON f.friend_id = u.id
      WHERE f.user_id = ${userId} 
        AND (f.status = 'accepted' OR f.status = 'pending')
        AND f.relationship IS NOT NULL
    `);

    console.log(`[FamilyTree] Found ${relatives.length} relationships for user ${userId}`);

    // Helper to map record to tree node
    const mapToNode = (r: any) => ({
      id: Number(r.id),
      name: String(r.displayName || r.username || "Unknown Relative"),
      relationship: String(r.relationship),
      profilePicture: r.profilePicture,
      birthYear: r.birthYear,
      deathYear: r.deathYear,
      isDeceased: !!r.isDeceased
    });

    // 3. Build the hierarchical structure (user-centric for now)
    // Use flexible case matching for relationships
    const findByRel = (rels: string[]) => 
      relatives.filter(r => rels.some(rel => r.relationship.toLowerCase() === rel.toLowerCase()));

    const parents = findByRel(['Father', 'Mother']);
    const children = findByRel(['Son', 'Daughter']);
    const siblings = findByRel(['Brother', 'Sister']);
    const spouse = findByRel(['Spouse'])[0];

    // Create the "User" node
    const userNode: any = {
      id: targetUser.id,
      name: targetUser.displayName || targetUser.username,
      relationship: "You",
      profilePicture: targetUser.profilePicture,
      children: children.map(mapToNode),
      spouse: spouse ? mapToNode(spouse) : undefined
    };

    // If there are parents, we try to make one of them the root
    let treeData = userNode;
    
    if (parents.length > 0) {
      const mainParent = parents[0];
      treeData = {
        ...mapToNode(mainParent),
        children: [
          userNode,
          ...siblings.map(mapToNode)
        ]
      };
      
      if (parents.length > 1) {
        treeData.spouse = mapToNode(parents[1]);
      }
    }

    res.json(treeData);
  } catch (error) {
    console.error('Error building family tree:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all friends for the current user
router.get('/friends', async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const includePending = req.query.includePending === 'true';

  try {
    const { rows: userFriends } = await db.execute(sql`
      SELECT 
        u.id,
        u.username,
        u.display_name as "displayName",
        u.profile_picture as "profilePicture",
        f.status
      FROM friends f
      LEFT JOIN users u ON f.friend_id = u.id
      WHERE f.user_id = ${userId} 
        AND (f.status = 'accepted' ${includePending ? sql`OR f.status = 'pending'` : sql``})
    `);

    res.json(userFriends);
  } catch (error) {
    console.error('Error getting friends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all friend requests for the current user
router.get('/friend-requests', async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const friendRequests = await db.execute(sql`
      SELECT u.id, u.username, u.display_name as "displayName", u.profile_picture as "profilePicture"
      FROM friends f
      LEFT JOIN users u ON f.user_id = u.id
      WHERE f.friend_id = ${userId} AND f.status = 'pending'
    `);

    res.json(friendRequests.rows);
  } catch (error) {
    console.error('Error getting friend requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get friend suggestions for the current user
router.get('/friend-suggestions', async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const suggestions = await db.execute(sql`
      SELECT u.id, u.username, u.display_name as "displayName", u.profile_picture as "profilePicture"
      FROM users u
      LEFT JOIN friends f ON
        (f.user_id = ${userId} AND f.friend_id = u.id) OR
        (f.friend_id = ${userId} AND f.user_id = u.id)
      WHERE f.id IS NULL AND u.id != ${userId} -- Exclude the logged-in user
    `);

    res.json(suggestions.rows);
  } catch (error) {
    console.error('Error getting friend suggestions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send a friend request
router.post('/friend-requests/:friendId', async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const friendId = parseInt(req.params.friendId);
  const { relationship } = req.body;

  if (userId === friendId) {
    return res.status(400).json({ error: 'Cannot send friend request to yourself' });
  }

  try {
    const { rows: existingFriendship } = await db.execute(sql`
      SELECT *
      FROM friends
      WHERE (user_id = ${userId} AND friend_id = ${friendId})
         OR (user_id = ${friendId} AND friend_id = ${userId})
    `);

    if (existingFriendship.length > 0) {
      return res.status(400).json({ error: 'Friend request already exists' });
    }

    await db.execute(sql`
      INSERT INTO friends (user_id, friend_id, status, relationship)
      VALUES (${userId}, ${friendId}, 'pending', ${relationship || null})
    `);

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Error processing friend request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept a friend request
router.post('/friend-request/:friendId/accept', async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const friendId = parseInt(req.params.friendId);
  const { relationship } = req.body;

  try {
    // 1. Get the accepting user's gender for inverse relationship calculation
    const { rows: userRows } = await db.execute(sql`
      SELECT gender FROM users WHERE id = ${userId}
    `);
    const userGender = userRows.length > 0 ? userRows[0].gender : null;

    // 2. Determine the inverse relationship for the sender
    const inverseRel = getInverseRelationship(relationship, userGender);

    // 3. Update the original request record (Sender -> Receiver)
    // We update the status to 'accepted' and set the inverse relationship
    const { rows: result } = await db.execute(sql`
      UPDATE friends
      SET status = 'accepted', relationship = ${inverseRel || null}
      WHERE user_id = ${friendId} AND friend_id = ${userId}
      RETURNING *
    `);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // 4. Create/Update the reverse friendship record (Receiver -> Sender)
    // This record stores the relationship specified by the accepting user
    await db.execute(sql`
      INSERT INTO friends (user_id, friend_id, status, relationship)
      VALUES (${userId}, ${friendId}, 'accepted', ${relationship || null})
      ON CONFLICT (user_id, friend_id) 
      DO UPDATE SET status = 'accepted', relationship = ${relationship || null}
    `);

    console.log(`[FriendRequest] Accepted: User ${userId} (${userGender}) -> Friend ${friendId}. Relationships: ${relationship} / ${inverseRel}`);

    res.json({ message: 'Friend request accepted and family links established' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject a friend request
router.delete('/friend-request/:friendId', async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const friendId = parseInt(req.params.friendId);

  try {
    const { rows: result } = await db.execute(sql`
      DELETE FROM friends
      WHERE user_id = ${friendId} AND friend_id = ${userId} AND status = 'pending'
      RETURNING *
    `);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove a friend
router.delete('/friend/:friendId', async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const friendId = parseInt(req.params.friendId);

  try {
    const { rows: result } = await db.execute(sql`
      DELETE FROM friends
      WHERE (
        (user_id = ${userId} AND friend_id = ${friendId} AND status = 'accepted')
        OR
        (user_id = ${friendId} AND friend_id = ${userId} AND status = 'accepted')
      )
      RETURNING *
    `);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Friend not found' });
    }

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search for users by username or display name
router.get('/search', async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const query = req.query.q as string;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }

  try {
    // Use ILIKE for case-insensitive search
    const searchTerm = `%${query}%`;
    
    const { rows: users } = await db.execute(sql`
      WITH friend_status AS (
        SELECT 
          friend_id,
          status
        FROM friends
        WHERE user_id = ${userId}
        
        UNION
        
        SELECT 
          user_id as friend_id,
          status
        FROM friends
        WHERE friend_id = ${userId}
      )
      
      SELECT 
        u.id,
        u.username,
        u.display_name as "displayName",
        u.profile_picture as "profilePicture",
        COALESCE(fs.status, 'none') as status
      FROM users u
      LEFT JOIN friend_status fs ON u.id = fs.friend_id
      WHERE 
        u.id != ${userId} AND
        (u.username ILIKE ${searchTerm} OR u.display_name ILIKE ${searchTerm})
      LIMIT 20
    `);
    
    res.json(users);
  } catch (error) {
    console.error('Error searching for users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a friendship
router.post('/friends', async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { friendId } = req.body; // Get friend ID from request body

  if (!friendId || typeof friendId !== 'number') {
    return res.status(400).json({ error: 'Invalid or missing friendId' });
  }

  try {
    // Check if a friendship already exists
    const existingFriendship = await db.execute(sql`
      SELECT * FROM friends
      WHERE (user_id = ${userId} AND friend_id = ${friendId})
         OR (user_id = ${friendId} AND friend_id = ${userId})
    `);

    if (existingFriendship.rows.length > 0) {
      return res.status(409).json({ error: 'Friendship already exists' });
    }

    // Create the friendship
    await db.execute(sql`
      INSERT INTO friends (user_id, friend_id, status)
      VALUES (${userId}, ${friendId}, 'accepted')
    `);

    res.status(201).json({ message: 'Friendship created successfully' });
  } catch (error) {
    console.error('Error creating friendship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update friend relationship and metadata
router.put('/relationship', async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { friendId, relationship, birthYear, deathYear, isDeceased } = req.body;
  if (!friendId) return res.status(400).json({ error: 'friendId is required' });

  console.log(`[API] Relationship update attempt: userId=${userId}, friendId=${friendId}, relationship=${relationship}`);

  try {
    // Find the existing accepted friendship
    const { rows: friendships } = await db.execute(sql`
      SELECT id FROM friends
      WHERE user_id = ${userId} AND friend_id = ${friendId} 
        AND (status = 'accepted' OR status = 'pending')
    `);

    console.log(`[API] Found ${friendships.length} candidate friendship records for update`);

    if (friendships.length === 0) {
      return res.status(404).json({ error: 'Accepted friendship not found' });
    }

    const friendshipId = friendships[0].id;
    
    // Safely parse numbers to avoid NaN issues
    const parseYear = (val: any) => {
      if (val === undefined || val === null || val === '') return null;
      const num = parseInt(val);
      return isNaN(num) ? null : num;
    };

    // Update the relationship and metadata
    const updated = await storage.updateFriendship(friendshipId, {
      relationship: relationship || null,
      birthYear: parseYear(birthYear),
      deathYear: parseYear(deathYear),
      isDeceased: !!isDeceased
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating relationship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
