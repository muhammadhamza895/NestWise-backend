import { config } from "../config/config.js";
import fetch from "node-fetch";
import OpenAI from "openai"

class AIServiceHuggingFace {
  constructor() {
    this.apiKey = config.huggingfaceApiKey;
  }

  async generateText(prompt) {
    return this.generateTextWithHuggingFace(prompt);
  }

  async generateTextWithHuggingFace(prompt) {
    try {
      const startTime = Date.now();
      console.log(`Starting Hugging Face generation at ${new Date().toISOString()}`);

      const client = new OpenAI({
        baseURL: "https://router.huggingface.co/v1",
        apiKey: this.apiKey,
      });
      const chatCompletion = await client.chat.completions.create({
        model: "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const endTime = Date.now();
      console.log(`Hugging Face generation completed in ${(endTime - startTime) / 1000} seconds`);

      return chatCompletion.choices[0].message.content;
    } catch (error) {
      console.error("Error generating text with Hugging Face:", error);
      return `Error: ${error.message}`;
    }
  }

  _preparePropertyData(properties, maxProperties = 3) {
    // Limit the number of properties
    const limitedProperties = properties.slice(0, maxProperties);

    // Clean and simplify each property
    return limitedProperties.map(property => ({
      building_name: property.building_name,
      property_type: property.property_type,
      location_address: property.location_address,
      price: property.price,
      area_sqft: property.area_sqft,
      // Extract just a few key amenities
      amenities: Array.isArray(property.amenities)
        ? property.amenities.slice(0, 5)
        : [],
      // Truncate description to save tokens
      description: property.description
        ? property.description.substring(0, 150) + (property.description.length > 150 ? '...' : '')
        : ''
    }));
  }

  // Helper method to filter and clean location data
  _prepareLocationData(locations, maxLocations = 5) {
    // Limit the number of locations
    return locations.slice(0, maxLocations);
  }

  async analyzeProperties(
    properties,
  ) {
    //     const prompt = `You are a real estate analysis expert.

    // Your task:
    // Analyze the following property listings from ${city}:

    // ${JSON.stringify(properties, null, 2)}

    // === INSTRUCTIONS ===
    // You MUST return only the final output in this strict format:

    // - Best Value Property  
    //   • ...
    // - Recommendations  
    //   • ...

    // Do NOT include any steps, explanations, thoughts, or <think> tags. Just give the clean final summary in bullet points under the exact headings.
    // Keep your response concise and focused on these properties only.
    // Do not add any introduction or closing line. Just output starts directly with "- Best Value Property".

    // Failure to follow this will be considered incorrect output.
    // `;

    const prompt = `As a real estate expert, analyze these properties:

        Properties Found :
        ${JSON.stringify(properties, null, 2)}

        INSTRUCTIONS:
        1. Provide a brief analysis with these sections:
           - Best Value Analysis (which offers the best value)
           - Quick Recommendations

        2. You MUST return only the final output in this strict markdown format:
            # Property Insights

            ## Best Value Analysis
            - ...

            ## Quick Recommendations  
             - ...

        Keep your response concise and focused on these properties only.
        `;

    return this.generateText(prompt);
  }

  async analyzeLocationTrends(locations, city) {
    // Prepare limited location data
    const preparedLocations = this._prepareLocationData(locations);

    const prompt = `As a real estate expert, analyze these location price trends for ${city}:

        ${JSON.stringify(preparedLocations, null, 2)}

        Please provide:
        1. A brief summary of price trends for each location
        2. Which areas are showing the highest appreciation
        3. Which areas offer the best rental yield
        4. Quick investment recommendations based on this data

        Keep your response concise (maximum 300 words).
        `;

    return this.generateText(prompt);
  }
}

export default new AIServiceHuggingFace();