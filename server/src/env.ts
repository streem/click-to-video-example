import dotenv from 'dotenv';

dotenv.config({ path: '.env' }); 

export const serverConfig = {
    port: process.env.PORT,
}

export const streemConfig = {
    apiEnv: process.env.STREEM_API_ENVIRONMENT || 'sandbox',
    apiRegion: process.env.STREEM_API_REGION || 'us',
    apiKeyId: process.env.STREEM_API_KEY_ID!,
    apiKeySecret: process.env.STREEM_API_KEY_SECRET!,
    companyCode: process.env.STREEM_COMPANY_CODE!
}
