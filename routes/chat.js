import express from 'express';
const router = express.Router();
import { createChat ,getConversations ,getMessagesForConversation ,getConversationByAgentId} from '../controllers/chat.js'

router.post('/send', createChat);
router.get(
  '/conversations', getConversations 
);

router.post('/get-measage',getMessagesForConversation)
router.get('/conversation-by-agent/:agentId', getConversationByAgentId);
export default router;