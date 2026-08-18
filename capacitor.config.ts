import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eduplatform.software',
  appName: 'EduPlatform',
  webDir: 'out',
  server: {
    url: 'https://eduplatformsoftware.com',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#ffffff',
  },
};

export default config;
