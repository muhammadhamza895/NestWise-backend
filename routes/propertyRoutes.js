import express from 'express';
import { searchProperties, getLocationTrends, analyseProperties } from '../controller/propertyController.js';
import { webCrawlerurlGenerator, trendUrlGenerator } from '../middleware/aiMiddlewares.js';

const router = express.Router();

// Route to search for properties
router.post('/properties/search', webCrawlerurlGenerator, searchProperties);
router.post('/properties/analysis', analyseProperties);

// Route to get location trends
router.get('/locations/:city/:purpose/trends',trendUrlGenerator, getLocationTrends);

export default router;