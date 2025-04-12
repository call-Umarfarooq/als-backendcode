import express from 'express';
import { createTeam, deleteTeam, getTeamById, getTeamsByOwner, removeAgentFromTeam, updateTeam ,countTeam } from '../controllers/team.controller.js';
const router = express.Router();


router.post('/create-team', createTeam);
router.get("/count",countTeam)
router.get('/all-teams/:ownerId', getTeamsByOwner);
router.get('/team-byId/:id', getTeamById);
router.delete('/delete-team/:id', deleteTeam);
router.put('/update-team/:id', updateTeam);
router.delete('/remove-agent/:teamId/:agentId', removeAgentFromTeam);

export default router;