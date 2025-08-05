import express from 'express';
import { protect } from '../middleware/authmiddleware.js';
import { closeDealRequest } from '../controller/closingDealController.js';

const dealRoutes = express.Router();

dealRoutes.post('/close-deal', protect, closeDealRequest);

export default dealRoutes;