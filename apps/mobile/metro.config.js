// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude leaflet packages from native builds
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Block leaflet and react-leaflet on native platforms only
  if (platform !== 'web') {
    if (
      moduleName === 'leaflet' ||
      moduleName === 'react-leaflet' ||
      moduleName.startsWith('leaflet/') ||
      moduleName.startsWith('react-leaflet/') ||
      moduleName.startsWith('@react-leaflet/')
    ) {
      return {
        type: 'empty',
      };
    }
  }
  
  // Use default resolver
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
