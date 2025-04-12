import express from 'express';
const router = express.Router();
import {createContract ,trackEmailOpen ,acceptContract,trackAndViewContract ,getContractsByUserId ,getContractById ,updateContractStatus ,updateSignature ,countSignd} from '../controllers/contract.js'

router.post('/create-contract', createContract);
router.get('/get-contracts/:userId', getContractsByUserId);
router.put('/update-status/:contractId', updateContractStatus);
router.put('/update-signature/:contractId',updateSignature)
router.get('/get-contract-by-id', getContractById);
router.get('/track-view/:id', trackEmailOpen);
router.get('/view/:id', trackAndViewContract);  
router.get('/accept/:id', acceptContract);
router.get("/count-sign", countSignd)

export default router;

