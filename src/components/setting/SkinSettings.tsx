import * as React from 'react';
import FastImage from 'react-native-fast-image';
import { View, FlatList, SafeAreaView } from 'react-native';
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
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setPlayerStyle = useNoxSetting(state => state.setPlayerStyle);
  const playerStyles = useNoxSetting(state => state.playerStyles);
  const setPlayerStyles = useNoxSetting(state => state.setPlayerStyles);
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
      skins.filter(skin => skin.metaData).concat(playerStyles),
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
      setPlayerStyles(playerStyles.filter(pSkin => pSkin !== skin));

    return (
      <TouchableRipple onPress={selectTheme}>
        <View style={{ flexDirection: 'row' }}>
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 5,
              flex: 5,
              paddingLeft: 5,
            }}
          >
            <FastImage
              source={{ uri: skin.metaData.themeIcon }}
              style={{
                width: 72,
                height: 72,
                borderRadius: 40,
              }}
            />
            <View style={{ paddingLeft: 5 }}>
              <Text
                variant={'titleMedium'}
              >{`${skin.metaData.themeName} by ${skin.metaData.themeAuthor}`}</Text>
              <Text
                variant={'labelLarge'}
                style={{ color: playerStyle.colors.secondary }}
              >
                {skin.metaData.themeDesc}
              </Text>
              <Text
                variant={'labelLarge'}
                style={{ color: playerStyle.colors.secondary }}
              >
                {skin.metaData.darkTheme ? 'Dark theme' : 'Light theme'}
              </Text>
            </View>
          </View>
          <View style={{ alignContent: 'flex-end' }}>
            <RadioButton
              value={themeID}
              status={checked === themeID ? 'checked' : 'unchecked'}
              onPress={selectTheme}
            />
            <IconButton
              icon="trash-can"
              style={{ marginLeft: -3 }}
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
      style={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        flex: 1,
      }}
    >
      <SkinSearchbar onSearched={loadCustomSkin} />
      <FlatList
        data={allThemes}
        renderItem={({ item, index }) => renderSkinItem(item)}
        keyExtractor={item => getThemeID(item)}
      />
    </SafeAreaView>
  );
};
