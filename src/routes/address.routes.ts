import express from 'express';

import addressController from '../controllers/address.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);
router.post('/', addressController.createAddress);
router.get('/', addressController.getUserAddresses);

export default router;
