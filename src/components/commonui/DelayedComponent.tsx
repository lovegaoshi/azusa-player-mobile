import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

const DefaultSuspenseComponent = () => (
  <View style={{ alignContent: 'center', justifyContent: 'center', flex: 1 }}>
    <ActivityIndicator size={60} />
  </View>
);

interface Props {
  delay?: number;
  children?: React.ReactNode;
  SuspenseComponent?: () => React.ReactNode;
}

export default ({
  delay = 1,
  children,
  SuspenseComponent = DefaultSuspenseComponent,
}: Props) => {
  const [loaded, setLoaded] = React.useState(delay === 0);

  React.useEffect(() => {
    setTimeout(() => setLoaded(true), delay);
  }, []);

  if (!loaded) {
    return <SuspenseComponent />;
  }
  return children;
};
