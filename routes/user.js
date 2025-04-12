import express from 'express';

import { registerUser ,login,forgotPassword ,resetPassword ,getAllUsers ,updateUser ,getUserById ,updateUserRoleandPassword ,deleteUserById, getUserByAgentId, getUsersByReferId} from '../controllers/user.js';
const router = express.Router();

router.post('/create-user', registerUser);
router.post('/login' , login)
router.post('/forgot-password', forgotPassword);
router.post('/confirm-password', resetPassword)
router.get("/get-user", getAllUsers)
router.get("/get-refer-user/:referId", getUsersByReferId)
router.put('/update-user/:userId', updateUser);
router.get('/get-user/:userId', getUserById);
router.get('/user-byAgentId/:agentId', getUserByAgentId);
router.put('/update-role-password', updateUserRoleandPassword);
router.delete('/delete-user/:userId', deleteUserById);


export default router;
