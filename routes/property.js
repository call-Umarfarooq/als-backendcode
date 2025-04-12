
import express from 'express';
import {createPropertyAddress ,createImages, createFloorPlan,createVideo, createOtherMedia, createFeature,getProperties ,deleteProperty ,updatePropertyAddress ,getFeatureByPropertyId,getPropertyImagesByPropertyId,deletePropertyImageByIndex ,getPropertyVideoByPropertyId ,deletePropertyVideoByIndex,getOtherMediaByPropertyId ,deleteOtherMediaByPropertyIdAndIndex ,getFloorPlanByPropertyId ,deleteFloorPlan ,countProperty ,getSixPropertiesWithImages} from '../controllers/property.js'
const router = express.Router();

router.post('/create-address', createPropertyAddress)
router.put('/update-address', updatePropertyAddress);
router.post('/create-images', createImages)
router.get('/property-images/:propertyId', getPropertyImagesByPropertyId);
router.delete('/property-images/delete', deletePropertyImageByIndex);
router.get("/count" ,countProperty)

router.get('/six-properties', getSixPropertiesWithImages);


router.post('/create-floor-plain', createFloorPlan)
router.get('/property-floor-plan/:propertyId', getFloorPlanByPropertyId);
router.delete('/property-floor-plan/:propertyId/:index', deleteFloorPlan);

router.post('/create-video', createVideo)
router.get('/property-video/:propertyId', getPropertyVideoByPropertyId);
router.delete('/property-video/delete', deletePropertyVideoByIndex);

router.post('/create-other-media', createOtherMedia)
router.get('/property-other-media/:propertyId', getOtherMediaByPropertyId);

router.delete('/property-other-media/:propertyId/:index', deleteOtherMediaByPropertyIdAndIndex);


router.post('/create-feature', createFeature)
router.get('/getfeatures/:propertyId', getFeatureByPropertyId);

router.get('/get-property-name/:userId', getProperties)
router.delete('/delete-property/:propertyId', deleteProperty);

export default router;
