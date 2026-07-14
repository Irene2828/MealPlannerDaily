import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainLayout from './src/screens/MainLayout';
import { GroceryProvider } from './src/context/GroceryContext';
import {
  useFonts,
  Fraunces_700Bold,
  Fraunces_900Black,
} from '@expo-google-fonts/fraunces';
import {
  Lora_400Regular,
  Lora_500Medium,
  Lora_600SemiBold,
} from '@expo-google-fonts/lora';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';

export default function App() {
  let [fontsLoaded] = useFonts({
    Fraunces_700Bold,
    Fraunces_900Black,
    Lora_400Regular,
    Lora_500Medium,
    Lora_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <GroceryProvider>
        <MainLayout />
      </GroceryProvider>
    </SafeAreaProvider>
  );
}

