import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

interface Props {
  children: React.JSX.Element;
}

// auto unmounts a react navigation view when the screen is unfocused

export default ({ children }: Props) => {
  const [mounted, setMounted] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setMounted(true);
      // Do something when the screen is focused
      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
        setMounted(false);
      };
    }, []),
  );

  if (!mounted) return;
  return children;
};
