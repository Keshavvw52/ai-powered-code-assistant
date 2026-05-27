export const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  bcryptRounds: 10,
  jwtExpiry: '7d',
};