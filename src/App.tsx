import { SafeAreaProvider } from 'react-native-safe-area-context';
import AzusaPlayer from './AzusaPlayer';

export default function App() {
  return (
    <SafeAreaProvider>
      <AzusaPlayer />
    </SafeAreaProvider>
  );
}
