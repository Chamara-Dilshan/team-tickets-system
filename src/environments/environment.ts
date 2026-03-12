export const environment = {
  production: false,
  // Outbound: Angular → Power Automate → Teams
  powerAutomateUrl: 'https://default07938a687a1a48118cb5cbc8ce2530.1e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/9af51633435749f0b8bf9c1a2b05c385/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=kKULsprTcGO9_j3MZLSMSR3MYhx4mZIVlR8grEODgBs',
  // Inbound: Teams → Power Automate → Backend API → Angular
  backendApiUrl: 'http://localhost:3000'
};
