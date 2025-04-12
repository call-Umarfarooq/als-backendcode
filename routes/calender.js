
import express from 'express';

const router = express.Router();
import {createCalendarEvent ,getEventsByUserId ,getEventsByEmail} from '../controllers/calender.js'

router.post('/create', createCalendarEvent);
router.get('/get/:userId', getEventsByUserId);
router.get('/get-by-email/:email' ,getEventsByEmail)

export default router;
