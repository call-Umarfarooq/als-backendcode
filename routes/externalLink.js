import express from 'express';

import { createExternalLink,getExternalLink } from '../controllers/externalLink.js'
const router = express.Router();


router.post('/create-external',createExternalLink );
router.get('/get-external/:userId',getExternalLink );

export default router;