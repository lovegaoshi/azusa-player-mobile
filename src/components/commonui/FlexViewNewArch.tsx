import React, { useState } from 'react';
import { View } from 'react-native';
import { styles } from '@components/style';

/**
 * a view of flex:1 for new arch, resolves resizing issues
 */
export default ({ children }: { children: React.JSX.Element }) => {
  const [initHeight, setInitHeight] = useState(0);

  return (
    <View
      style={initHeight === 0 ? styles.flex : { height: initHeight }}
      onLayout={e =>
        initHeight === 0 && setInitHeight(e.nativeEvent.layout.height)
      }
    >
      {children}
    </View>
  );
};
