import * as React from 'react';
import FastImage from 'react-native-fast-image';
import { View, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import {
  Text,
  IconButton,
  TouchableRipple,
  RadioButton,
} from 'react-native-paper';
import SkinSearchbar from './SkinSearchbar';
import { useNoxSetting } from '../../hooks/useSetting';
import AzusaTheme from '../styles/AzusaTheme';
import NoxTheme from '../styles/NoxTheme';
import { getUniqObjects } from '../../utils/Utils';

interface DisplayTheme extends NoxTheme.style {
  builtin: boolean;
}

const BuiltInThemes: DisplayTheme[] = [
  {
    ...AzusaTheme,
    builtin: true,
  },
  {
    ...NoxTheme,
    builtin: true,
  },
];

export default () => {
  const playerStyle = useNoxSetting((state) => state.playerStyle);
  const setPlayerStyle = useNoxSetting((state) => state.setPlayerStyle);
  const playerStyles = useNoxSetting((state) => state.playerStyles);
  const setPlayerStyles = useNoxSetting((state) => state.setPlayerStyles);
  const allThemes = BuiltInThemes.concat(playerStyles);

  const getThemeID = (skin: NoxTheme.style) =>
    `${skin.metaData.themeName}.${skin.metaData.themeAuthor}`;
  const [checked, setChecked] = React.useState(getThemeID(playerStyle));

  const loadCustomSkin = async (skins: any) => {
    // skins MUST BE an array of objects
    if (!Array.isArray(skins)) {
      throw new Error('requested skin URL is not an array. aborting.');
    }
    const uniqueSkins = getUniqObjects(
      skins.filter((skin) => skin.metaData).concat(playerStyles),
      getThemeID
    );
    setPlayerStyles(uniqueSkins);
  };

  const renderSkinItem = (skin: DisplayTheme) => {
    const themeID = getThemeID(skin);
    const selectTheme = () => {
      setChecked(themeID);
      setPlayerStyle(skin);
    };

    const deleteTheme = () =>
      setPlayerStyles(playerStyles.filter((pSkin) => pSkin !== skin));

    return (
      <TouchableRipple onPress={selectTheme}>
        <View style={styles.skinItemContainer}>
          <View style={styles.skinItemLeftContainer}>
            <FastImage
              source={{ uri: skin.metaData.themeIcon }}
              style={styles.skinItemImage}
            />
            <View style={styles.skinItemTextContainer}>
              <Text
                variant={'titleMedium'}
              >{`${skin.metaData.themeName} by ${skin.metaData.themeAuthor}`}</Text>
              <Text
                variant={'labelLarge'}
                style={{ color: playerStyle.colors.secondary }}
              >
                {skin.metaData.themeDesc}
              </Text>
              <View style={styles.lightbulbContainer}>
                <IconButton
                  icon={
                    skin.metaData.darkTheme
                      ? 'lightbulb-outline'
                      : 'lightbulb-on'
                  }
                  size={25}
                  style={styles.lightbulbIcon}
                />
              </View>
            </View>
          </View>
          <View style={styles.skinItemRightContainer}>
            <RadioButton
              value={themeID}
              status={checked === themeID ? 'checked' : 'unchecked'}
              onPress={selectTheme}
            />
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

  return (
    <SafeAreaView
      style={[styles.safeAreaView, { backgroundColor: playerStyle.customColors.maskedBackgroundColor }]}
    >
      <SkinSearchbar onSearched={loadCustomSkin} />
      <FlatList
        data={allThemes}
        renderItem={({ item, index }) => renderSkinItem(item)}
        keyExtractor={(item) => getThemeID(item)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  skinItemContainer: {
    flexDirection: 'row',
  },
  skinItemLeftContainer: {
    flexDirection: 'row',
    paddingVertical: 5,
    flex: 5,
    paddingLeft: 5,
  },
  skinItemImage: {
    width: 72,
    height: 72,
    borderRadius: 40,
  },
  skinItemTextContainer: {
    paddingLeft: 5,
  },
  lightbulbContainer: {
    flexDirection: 'row',
  },
  lightbulbIcon: {
    marginHorizontal: 0,
    marginVertical: 0,
    marginLeft: -8,
    marginTop: -8,
  },
  skinItemRightContainer: {
    alignContent: 'flex-end',
  },
  deleteButton: {
    marginLeft: -3,
  },
});
