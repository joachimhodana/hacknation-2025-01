import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type DeviceInfo = {
  isInBrowser: boolean;
  os: 'iOS' | 'Android' | 'Windows' | 'MacOS' | 'Linux' | 'Unknown';
  isMobile: boolean;
  isDesktop: boolean;
};

export const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isInBrowser: false,
    os: 'Unknown',
    isMobile: false,
    isDesktop: false,
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      const userAgent = 
        typeof navigator !== 'undefined' 
          ? navigator.userAgent || navigator.vendor || (window as any).opera 
          : '';

      // Check if running in a browser
      const isInBrowser = /android/i.test(userAgent) ||
        /iPhone|iPad|iPod/i.test(userAgent) ||
        /Mobile|WebKit/i.test(userAgent);

      // Determine the OS based on the user agent
      let os: DeviceInfo['os'] = 'Unknown';
      if (/android/i.test(userAgent)) {
        os = 'Android';
      } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
        os = 'iOS';
      } else if (/Windows/i.test(userAgent)) {
        os = 'Windows';
      } else if (/Macintosh|Mac OS X/i.test(userAgent)) {
        os = 'MacOS';
      } else if (/Linux/i.test(userAgent)) {
        os = 'Linux';
      }

      // Determine if mobile or desktop
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      );
      const isDesktop = !isMobile;

      setDeviceInfo({ isInBrowser, os, isMobile, isDesktop });
    } else {
      // For native platforms, use Platform.OS
      const os = Platform.OS === 'android' ? 'Android' : 'iOS';
      setDeviceInfo({
        isInBrowser: false,
        os,
        isMobile: true,
        isDesktop: false,
      });
    }
  }, []);

  return deviceInfo;
};

export default useDeviceDetection;

