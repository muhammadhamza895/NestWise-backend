import firecrawlService from '../services/firecrawlService.js';
import aiServiceHuggingFace from '../services/aiServiceHuggingFace.js';

const dummyData = {
    "properties": [
        {
            "beds": "3",
            "baths": "3",
            "price": "PKR1.27 Crore",
            "amenities": [],
            "area_sqft": "235",
            "description": "Searching for the right option for a house? This 235 square yards house in Bahria Town is a great choice.",
            "building_name": "House Sized 235 Square Yards Available In Bahria Town - Precinct 27",
            "property_type": "House",
            "location_address": "Bahria Town - Precinct 27, Bahria Town Karachi"
        },
        {
            "beds": "3",
            "baths": "3",
            "price": "PKR1.28 Crore",
            "amenities": [],
            "area_sqft": "235",
            "description": "This villa features 3 bedrooms, a dining area, and a closed Italian kitchen, all within a 235 square yard space.",
            "building_name": "Road Category 235sq Yard Villa FOR SALE In Precinct-31",
            "property_type": "House",
            "location_address": "Bahria Town - Precinct 31, Bahria Town Karachi"
        },
        {
            "beds": "3",
            "baths": "3",
            "price": "PKR1.65 Crore",
            "amenities": [],
            "area_sqft": "200",
            "description": "This villa offers 3 bedrooms and is located in a prime area of Bahria Town.",
            "building_name": "200 Square Yards Villa Available For Sale in Precinct 10-A",
            "property_type": "House",
            "location_address": "Bahria Town - Precinct 10-A, Bahria Town Karachi"
        },
        {
            "beds": "3",
            "baths": "3",
            "price": "PKR1.25 Crore",
            "amenities": [],
            "area_sqft": "125",
            "description": "A well-maintained house with 3 bedrooms available for sale in Ali Block.",
            "building_name": "Bahria Town - Ali Block 125 Square Yards House Up For sale",
            "property_type": "House",
            "location_address": "Bahria Town - Ali Block, Bahria Town - Precinct 12"
        },
        {
            "beds": "3",
            "baths": "3",
            "price": "PKR1.1 Crore",
            "amenities": [],
            "area_sqft": "125",
            "description": "This villa features 3 bedrooms and is located in a well-connected area.",
            "building_name": "3Bed DDL 125sq yd Villa FOR SALE at Precicnt-10B",
            "property_type": "House",
            "location_address": "Bahria Town - Precinct 10-B, Bahria Town Karachi"
        },
        {
            "beds": "3",
            "baths": "3",
            "price": "PKR1.58 Crore",
            "amenities": [],
            "area_sqft": "152",
            "description": "A beautiful villa with 3 bedrooms, located just 2 minutes from the main gate of Bahria Town.",
            "building_name": "Iqbal Villas 152sq yd FOR SALE, 3 Bedrooms",
            "property_type": "House",
            "location_address": "Bahria Homes - Iqbal Villas, Bahria Town - Precinct 2"
        }
    ]
}

export const searchProperties = async (req, res) => {
    try {
        const { city, location, maxPrice, propertyCategory, propertyType, limit = 6 } = req.body;

        if (!city || !maxPrice) {
            return res.status(400).json({ success: false, message: 'City and maxPrice are required' });
        }

        const urls = [req.zameen_url]

        // Extract property data using Firecrawl, specifying the limit
        const propertiesData = await firecrawlService.findProperties(
            city,
            location,
            maxPrice,
            propertyCategory || 'Residential',
            propertyType || 'Flat',
            Math.min(limit, 6),
            urls
        );
        console.log({ propertiesData })

        // Analyze the properties using AI
        // let analysis = '';

        // if (propertiesData?.properties?.length) {
        //     analysis = await aiServiceHuggingFace.analyzeProperties(
        //         propertiesData.properties,
        //         city,
        //         maxPrice,
        //         propertyCategory || 'Residential',
        //         propertyType || 'Flat'
        //     );
        // }
        // console.log({ analysis })

        res.json({
            success: true,
            properties: propertiesData?.properties,
            // analysis
        });
    } catch (error) {
        console.error('Error searching properties:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search properties',
            error: error.message
        });
    }
};

export const analyseProperties = async (req, res) => {
    try {
        const { propertiesData = [] } = req.body;

        if (!Array.isArray(propertiesData) || propertiesData.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or missing properties data.',
            });
        }

        const analysis = await aiServiceHuggingFace.analyzeProperties(propertiesData);

        console.log('Property Analysis:', analysis);

        return res.json({
            success: true,
            analysis,
        });
    } catch (error) {
        console.error('Error analyzing properties:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to analyze properties',
            error: error.message,
        });
    }
};


export const getLocationTrends = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const urls = [req.zameen_url]

        // Extract location trend data using Firecrawl, with limit
        const locationsData = await firecrawlService.getLocationTrends(Math.min(limit, 5), urls);

        // Analyze the location trends using AI
        // const analysis = await aiServiceHuggingFace.analyzeLocationTrends(
        //     locationsData.locations,
        //     city
        // );

        res.json({
            success: true,
            locations: locationsData.locations,
            // analysis
        });
    } catch (error) {
        console.error('Error getting location trends:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get location trends',
            error: error.message
        });
    }
};