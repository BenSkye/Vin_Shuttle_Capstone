// App.tsx
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import './global.css';
import { ScheduleProvider } from '~/context/ScheduleContext';
import { LocationProvider } from '~/context/LocationContext';
import { AuthProvider } from '~/context/AuthContext';
export default function App() {
  return (
    <AuthProvider>
      <ScheduleProvider>
        <LocationProvider>
          <AppNavigator />
        </LocationProvider>
      </ScheduleProvider>
    </AuthProvider>
  );
}