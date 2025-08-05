import FirecrawlApp from "@mendable/firecrawl-js";
import { config } from '../config/config.js';

class FirecrawlService {
    constructor() {
        this.firecrawl = new FirecrawlApp({
            apiKey: config.firecrawlApiKey
        });
    }

    async findProperties(city,location, maxPrice, propertyCategory = "Residential", propertyType = "Flat", limit = 6, urls) {
        try {
            // const formattedLocation = city.toLowerCase().replace(/\s+/g, '-');
            
            // URLs for property websites (using 99acres as an example)
            // const urls = [
            //     `https://www.zameen.com/Homes/Karachi-2-1.html`
            // ];
            console.log({urls})

            // const propertyTypePrompt = propertyType === "Flat" ? "Flats" : "Individual Houses";
            
            // Define schema directly as a JSON schema object
            const propertySchema = {
                type: "object",
                properties: {
                    properties: {
                        type: "array",
                        maxItems: limit,
                        description: "List of property details",
                        items: {
                            type: "object",
                            properties: {
                                building_name: {
                                    type: "string",
                                    description: "Name of the building/property"
                                },
                                property_type: {
                                    type: "string",
                                    description: "Type of property (commercial, residential, etc)"
                                },
                                location_address: {
                                    type: "string",
                                    description: "Complete address of the property"
                                },
                                price: {
                                    type: "string",
                                    description: "Price of the property"
                                },
                                description: {
                                    type: "string",
                                    description: "Brief description of the property"
                                },
                                amenities: {
                                    type: "array",
                                    items: { type: "string" },
                                    description: "List of key amenities"
                                },
                                area_sqft: {
                                    type: "string",
                                    description: "Area in square feet"
                                }, 
                                beds : {
                                    type: "string",
                                    description: "Number of beds"
                                },
                                baths : {
                                    type: "string",
                                    description: "Number of baths"
                                },
                            },
                            required: ["building_name", "property_type", "location_address", "price", "beds", "baths"],
                        }
                    }
                },
                required: ["properties"]
            };
            
            // const extractResult = await this.firecrawl.extract(
            //     urls,
            //     {
            //         prompt: `Extract ONLY ${limit} different ${propertyCategory} ${propertyTypePrompt} from ${city} that cost less than ${maxPrice} crores.
                    
            //         Requirements:
            //         - Property Category: ${propertyCategory} properties only
            //         - Property Type: ${propertyTypePrompt} only
            //         - Location: ${city}
            //         - Maximum Price: ${maxPrice} crores
            //         - Include essential property details (building name, price, location, area)
            //         - Keep descriptions brief (under 100 words)
            //         - IMPORTANT: Return data for EXACTLY ${limit} different properties. No more.
            //         `,
            //         schema: propertySchema,
            //         enableWebSearch: true
            //     }
            // );

            const locationText = location ? ` located in or around "${location}"` : '';
            // const locationText = location ? ` from this ${location}` : '';
            const extractResult = await this.firecrawl.extract(
                urls,
                {
                    prompt: `Extract ONLY ${limit} properties${locationText}
                    
                    Requirements:
                    - Include essential property details (building name, price, location, area)
                    - Keep descriptions brief (under 100 words)
                    - IMPORTANT: Return data for EXACTLY ${limit} different properties. No more.
                    `,
                    schema: propertySchema,
                    // enableWebSearch: true
                }
            );

            if (!extractResult.success) {
                throw new Error(`Failed to extract property data: ${extractResult.error || 'Unknown error'}`);
            }

            console.log('Extracted properties count:', extractResult.data.properties.length);

            return extractResult.data;
        } catch (error) {
            console.error('Error finding properties:', error);
            throw error;
        }
    }

    async getLocationTrends(limit = 5, urls) {
        try {
            // Define schema directly as a JSON schema object
            const locationSchema = {
                type: "object",
                properties: {
                    locations: {
                        type: "array",
                        description: "List of location data points",
                        items: {
                            type: "object",
                            properties: {
                                location: {
                                    type: "string",
                                    description: "Complete address of the property"
                                },
                                city_name : {
                                    type: "string",
                                    description: "Name of the city"
                                },
                                // price_per_sqft: {
                                //     type: "number"
                                // },
                                // percent_increase: {
                                //     type: "number"
                                // },
                                // rental_yield: {
                                //     type: "number"
                                // }
                                search_percentage : {
                                    type : "number",
                                    description : "Search Percentage"
                                }
                            },
                            required: ["location", "city_name", "search_percentage"]
                        }
                    }
                },
                required: ["locations"]
            };
            
            const extractResult = await this.firecrawl.extract(
                urls,
                {
                    prompt: `Extract Search Percentage trends data for ${limit}.
                    IMPORTANT:
                    - Return data for EXACTLY ${limit} different localities
                    - Include data points: location name, city name and search percentage
                    - Format as a list of locations with their respective data
                    `,
                    schema: locationSchema,
                    // enableWebSearch: true
                }
            );

            if (!extractResult.success) {
                throw new Error(`Failed to extract location data: ${extractResult.error || 'Unknown error'}`);
            }

            console.log('Extracted locations count:', extractResult.data.locations.length);
            
            return extractResult.data;
        } catch (error) {
            console.error('Error fetching location trends:', error);
            throw error;
        }
    }
}

export default new FirecrawlService();