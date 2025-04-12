import express from 'express';
const router = express.Router();
import {sendMessage ,getAllUsers ,getMessages ,getAllBoardMessages} from '../controllers/board.js'

router.post('/send', sendMessage);
router.get('/all-users', getAllUsers);
router.get('/all', getAllBoardMessages);

router.get('/get', getMessages);

export default router;