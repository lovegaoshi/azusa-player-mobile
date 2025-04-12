import React, { useRef, useState } from 'react';
import { View } from 'react-native';

import { styles } from '@components/style';
import { isOldArch } from '@utils/RNUtils';

interface Props {
  children: React.JSX.Element;
  noFlex?: boolean;
}
/**
 * a view of flex:1 for new arch, resolves resizing issues
 */
export default ({ children, noFlex }: Props) => {
  if (isOldArch() && !noFlex) {
    return <View style={styles.flex}>{children}</View>;
  }

  const [initHeight, setInitHeight] = useState(0);
  const largestHeight = useRef(-1);

  return (
    <View
      style={initHeight === 0 ? styles.flex : { height: initHeight }}
      onLayout={e => {
        if (initHeight > 0 || e.nativeEvent.layout.height === 0) {
          return;
        }
        if (largestHeight.current < e.nativeEvent.layout.height) {
          largestHeight.current = e.nativeEvent.layout.height;
          return;
        }
        setInitHeight(largestHeight.current);
      }}
    >
      {children}
    </View>
  );
};
