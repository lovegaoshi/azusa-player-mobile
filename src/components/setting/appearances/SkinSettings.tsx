import * as React from 'react';
import { Image } from 'expo-image';
import { View, SafeAreaView, LayoutAnimation } from 'react-native';
import {
  Text,
  IconButton,
  TouchableRipple,
  RadioButton,
} from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';

import SkinSearchbar from './SkinSearchbar';
import { useNoxSetting } from '@stores/useApp';
import AzusaTheme from '@components/styles/AzusaTheme';
import NoxTheme from '@components/styles/NoxTheme';
import AdaptiveTheme from '@components/styles/AdaptiveTheme';
import { execWhenTrue } from '@utils/Utils';
import GenericSelectDialog from '../../dialogs/GenericSelectDialog';
import { getStyle } from '@utils/StyleStorage';
import { ItemSelectStyles as styles } from '@components/style';

interface DisplayTheme extends NoxTheme.Style {
  builtin: boolean;
}

interface SkinItemProps {
  skin: DisplayTheme;
  checked: string;
  onHold: () => void;
  selectTheme: () => void;
  listRef?: React.RefObject<FlashList<DisplayTheme>>;
}

const BuiltInThemes: DisplayTheme[] = [
  {
    ...AdaptiveTheme,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: super HACK
    isAdaptive: true,
    builtin: true,
  },
  {
    ...AzusaTheme,
    builtin: true,
  },
  {
    ...NoxTheme,
    builtin: true,
  },
];

const SkinItem = ({
  skin,
  checked,
  onHold,
  selectTheme,
  listRef,
}: SkinItemProps) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const playerStyles = useNoxSetting(state => state.playerStyles);
  const setPlayerStyles = useNoxSetting(state => state.setPlayerStyles);
  const getThemeID = (skin: NoxTheme.Style) =>
    `${skin.metaData.themeName}.${skin.metaData.themeAuthor}`;
  const themeID = getThemeID(skin);

  const deleteTheme = () => {
    setPlayerStyles(playerStyles.filter(pSkin => pSkin !== skin));
    listRef?.current?.prepareForLayoutAnimationRender();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
  };

  return (
    <TouchableRipple onPress={selectTheme} onLongPress={onHold}>
      <View style={styles.skinItemContainer}>
        <View style={styles.skinItemLeftContainer}>
          <Image
            source={{ uri: skin.metaData.themeIcon }}
            style={styles.skinItemImage}
          />
          <View style={styles.skinItemTextContainer}>
            <Text
              variant={'titleMedium'}
              style={styles.skinTitleText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >{`${skin.metaData.themeName} by ${skin.metaData.themeAuthor}`}</Text>
            <Text
              variant={'labelLarge'}
              style={{
                color: playerStyle.colors.secondary,
                maxWidth: '90%',
              }}
              numberOfLines={2}
            >
              {skin.metaData.themeDesc}
            </Text>
            <View style={styles.lightbulbContainer}>
              <IconButton
                icon={
                  skin.metaData.darkTheme ? 'lightbulb-outline' : 'lightbulb-on'
                }
                size={25}
                style={styles.lightbulbIcon}
              />
            </View>
          </View>
        </View>
        <View style={styles.skinItemRightContainer}>
          <View style={styles.radioButton}>
            <RadioButton
              value={themeID}
              status={checked === themeID ? 'checked' : 'unchecked'}
              onPress={selectTheme}
            />
          </View>
          <IconButton
            icon="trash-can"
            style={styles.deleteButton}
            onPress={deleteTheme}
            disabled={skin.builtin}
          />
        </View>
      </View>
    </TouchableRipple>
  );
};

const getThemeID = (skin: NoxTheme.Style) =>
  `${skin.metaData.themeName}.${skin.metaData.themeAuthor}`;

const SkinSettings = () => {
  const [selectSkin, setSelectSkin] = React.useState<NoxTheme.Style>();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const playerStyles = useNoxSetting(state => state.playerStyles);
  const setPlayerStyle = useNoxSetting(state => state.setPlayerStyle);
  const allThemes = BuiltInThemes.concat(playerStyles);
  const [checked, setChecked] = React.useState(getThemeID(playerStyle));
  const scrollViewRef = React.useRef<FlashList<DisplayTheme>>(null);

  const selectTheme = (theme: NoxTheme.Style) => {
    setChecked(getThemeID(theme));
    setPlayerStyle(theme);
    scrollViewRef.current?.prepareForLayoutAnimationRender();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
  };

  React.useEffect(() => {
    const currentThemeIndex = allThemes.findIndex(
      theme => getThemeID(theme) === checked,
    );
    if (currentThemeIndex > -1) {
      execWhenTrue({
        executeFn: () =>
          scrollViewRef.current?.scrollToIndex({
            index: currentThemeIndex,
            viewPosition: 0.5,
            animated: false,
          }),
        // @ts-expect-error detect if flashlist is rendered
        loopCheck: () => scrollViewRef.current.rlvRef._layout.height > 0,
      });
    }
  }, []);

  return (
    <SafeAreaView
      style={[
        styles.safeAreaView,
        { backgroundColor: playerStyle.customColors.maskedBackgroundColor },
      ]}
    >
      <SkinSearchbar getThemeID={getThemeID} />
      <FlashList
        ref={scrollViewRef}
        data={allThemes}
        renderItem={({ item }) => (
          <SkinItem
            skin={item as DisplayTheme}
            checked={checked}
            key={getThemeID(item as DisplayTheme)}
            onHold={() => setSelectSkin(getStyle(item))}
            selectTheme={() => selectTheme(item)}
            listRef={scrollViewRef}
          />
        )}
        estimatedItemSize={107}
      />
      <GenericSelectDialog
        visible={selectSkin !== undefined}
        options={selectSkin?.backgroundImages ?? []}
        renderOptionTitle={v => JSON.stringify(v)}
        title={selectSkin?.metaData.themeName}
        defaultIndex={0}
        onClose={() => setSelectSkin(undefined)}
        onSubmit={v => {
          selectTheme({
            ...selectSkin!,
            backgroundImages: [selectSkin?.backgroundImages[v] ?? ''],
          });
          setSelectSkin(undefined);
        }}
      />
    </SafeAreaView>
  );
};

export default SkinSettings;
