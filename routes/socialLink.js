import express from 'express';

import { createSocialLink,getSocialLink } from '../controllers/socailLink.js'
const router = express.Router();


router.post('/create-link',createSocialLink );
router.get('/get-link/:userId',getSocialLink );


export default router;
