// config/env.ts
interface Config {
  googleClientId: string;
  googleCallbackUri: string;
}

const getConfig = (): Config => {
  return {
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ,
    googleCallbackUri: import.meta.env.VITE_GOOGLE_CALLBACK_URI
  };
};

export const config = getConfig();

// Debug için - development'da konsola yazdır
if (import.meta.env.DEV) {
  console.log('Google OAuth Config:', {
    clientIdExists: !!config.googleClientId,
    callbackUri: config.googleCallbackUri
  });
}