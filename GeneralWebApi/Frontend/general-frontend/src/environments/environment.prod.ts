// Production environment configuration
export const environment = {
  production: true,
  //this is the default api url for the production environment
  // but the first step is to use runtime config service to fetch the api url from the backend
  // if the runtime config service is not available, use the default api url
  apiUrl: 'https://generalwebapi-gwddatbmdxg6f5eu.swedencentral-01.azurewebsites.net',
  appName: 'GeneralWebApi Frontend',
  version: '1.0.0',
  enableLogging: false,
  enableDevTools: false,
  // Additional production settings
  mockData: false,
  debugMode: false,
  logLevel: 'error',
};
