import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler, Platform } from 'react-native';

import AppTabs from '@/components/app-tabs';

export default function TabsLayout() {
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') return undefined;

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        router.replace('/');
        return true;
      });

      return () => subscription.remove();
    }, []),
  );

  return <AppTabs />;
}
