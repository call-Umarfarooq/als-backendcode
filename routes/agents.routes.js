import express from 'express';
const router = express.Router();
import { acceptInvitation, createAgents, createAgentsContacts, getAgentById, getAllAgents, removeAgent, resendInvitation ,getAgentByReferId, getAllActiveAgent ,agentCount ,getAgents ,getID} from '../controllers/agents.controller.js';


router.post('/create-agents', createAgents);
router.get('/by-email',getID)
router.get("/count", agentCount)
router.post('/accept-invitation', acceptInvitation);
router.post('/resend-invitation', resendInvitation);
router.get('/all-agents/:referBy', getAllAgents);
router.get('/all-active-agents/:referBy', getAllActiveAgent);
router.get('/get-agent/:id', getAgentById);
router.get('/get-agents/:referBy', getAgentByReferId);
router.get('/remove-agent/:id', removeAgent);
router.post('/create-contacts', createAgentsContacts);
router.get('/five-agents', getAgents);

export default router;