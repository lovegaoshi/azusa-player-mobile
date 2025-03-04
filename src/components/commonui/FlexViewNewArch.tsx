import React, { useState } from 'react';
import { View } from 'react-native';
import { styles } from '@components/style';

interface Props {
  children: React.JSX.Element;
  noFlex?: boolean;
}
/**
 * a view of flex:1 for new arch, resolves resizing issues
 */
export default ({ children, noFlex }: Props) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  if (global?.nativeFabricUIManager === undefined && !noFlex) {
    return <View style={styles.flex}>{children}</View>;
  }

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
