import * as React from 'react';
import { View, SafeAreaView, LayoutAnimation } from 'react-native';
import { IconButton } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';

import { PaperText as Text } from '@components/commonui/ScaledText';
import { ItemSelectStyles as styles } from '@components/style';
import Searchbar from './Searchbar';
import { useNoxSetting } from '@stores/useApp';
import { MFsdk } from '@utils/mediafetch/evalsdk';
import { fetchMFsdk } from '@utils/mfsdk';

interface ItemProps {
  sdk: MFsdk;
  listRef?: React.RefObject<FlashList<MFsdk> | null>;
}

const RenderItem = ({ sdk, listRef }: ItemProps) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const rmMFsdks = useNoxSetting(state => state.rmMFsdks);
  const replaceMFsdks = useNoxSetting(state => state.replaceMFsdks);

  const deleteTheme = async () => {
    rmMFsdks([sdk]);
    listRef?.current?.prepareForLayoutAnimationRender();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
  };

  return (
    <View style={styles.skinItemContainer}>
      <View style={styles.skinItemLeftContainer}>
        <View style={styles.skinItemTextContainer}>
          <Text
            variant={'titleMedium'}
            style={styles.skinTitleText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >{`${sdk.platform} v${sdk.version} @${sdk.author}`}</Text>
          <Text
            variant={'labelLarge'}
            style={{
              color: playerStyle.colors.secondary,
              maxWidth: '90%',
            }}
            numberOfLines={2}
          >
            {sdk.srcUrl}
          </Text>
        </View>
      </View>
      <View style={styles.skinItemRightContainer}>
        <IconButton
          icon="sync"
          style={styles.deleteButton}
          onPress={() => fetchMFsdk(sdk.srcUrl).then(replaceMFsdks)}
        />
        <IconButton
          icon="trash-can"
          style={styles.deleteButton}
          onPress={deleteTheme}
        />
      </View>
    </View>
  );
};

const MFSettings = () => {
  const MFsdks = useNoxSetting(state => state.MFsdks);
  const scrollViewRef = React.useRef<FlashList<MFsdk>>(null);

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <Searchbar />
      <FlashList
        ref={scrollViewRef}
        data={MFsdks}
        renderItem={({ item }) => (
          <RenderItem sdk={item} listRef={scrollViewRef} />
        )}
        estimatedItemSize={100}
      />
    </SafeAreaView>
  );
};

export default MFSettings;
