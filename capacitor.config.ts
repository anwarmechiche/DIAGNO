import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'tradepro',
  webDir: 'out', // ASSURE-TOI QUE C'EST 'out' ICI
  server: {
    androidScheme: 'https'
  }
};

export default config;