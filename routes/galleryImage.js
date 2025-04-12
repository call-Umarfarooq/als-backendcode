import express from 'express';
import { createGallery,getGallery ,deleteGalleryImageByIndex} from '../controllers/galleryImg.js'
const router = express.Router();


router.post('/create-gallery',  createGallery);
router.get('/get-gallery/:userId',  getGallery);
router.post('/delete-image', deleteGalleryImageByIndex);


export default router;