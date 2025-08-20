import React from 'react';
import { StatusBar } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { GeneratePdfScreen } from '../screens/generate-pdf/GeneratePdfScreen';
import { PdfViewerScreen } from '../screens/pdf-viewer/PdfViewerScreen';
import type { RootStackParams } from './types';

const Stack = createStackNavigator<RootStackParams>();

export const AppNavigation: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator
        initialRouteName="GeneratePdf"
        screenOptions={{ headerShown: false }}  
      >
        <Stack.Screen name="GeneratePdf" component={GeneratePdfScreen as any} />
        <Stack.Screen
          name="PdfViewer"
          component={PdfViewerScreen as any}
          initialParams={{ uri: '', fileName: undefined }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


