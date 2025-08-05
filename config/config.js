import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

export const config = {
    port: process.env.PORT || 3000,
    firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
    huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
    modelId: process.env.MODEL_ID || 'mistralai/Mistral-7B-Instruct-v0.2',
    openRouterApiKey: '',
    openAIApiKey: '',
    azureApiKey: '',
    useAzure: false,
};


