import * as React from 'react';
import FastImage from 'react-native-fast-image';
import { View, Switch, Pressable, Image } from 'react-native';
import {
  List,
  Text,
  MD3Colors,
  IconButton,
  TouchableRipple,
  RadioButton,
} from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import SkinSearchbar from './SkinSearchbar';
import { useNoxSetting } from '../../hooks/useSetting';
import AzusaTheme from '../styles/AzusaTheme';
import NoxTheme from '../styles/NoxTheme';
import Style from '../styles/styleInterface';

const BuiltInThemes = [{
  theme: AzusaTheme,
  generic: false,
},
{
  theme: NoxTheme,
  generic: false,
},]

export default () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setPlayerStyle = useNoxSetting(state => state.setPlayerStyle);
  const [skinLists, setSkinLists] = React.useState<Style[]>([]);
  const allThemes = BuiltInThemes;

  const getThemeID = (skin: Style) =>
    `${skin.metaData.themeName}.${skin.metaData.themeAuthor}`;
  const [checked, setChecked] = React.useState(getThemeID(playerStyle));

  const renderSkinItem = (skin: Style, generic = true) => {
    const themeID = getThemeID(skin);
    const selectTheme = () => {
      setChecked(themeID);
      setPlayerStyle(skin);
    };

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
              onPress={() => console.log('pressedTrashcan')}
              disabled={!generic}
            />
          </View>
        </View>
      </TouchableRipple>
    );
  };

  return (
    <View
      style={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        flex: 1,
      }}
    >
    <View
      style={{flex: 0.5}}
    ><SkinSearchbar /></View>      
    <View
      style={{flex: 5.5}}
    ><FlashList
    data={allThemes}
    renderItem={({ item, index }) => renderSkinItem(item.theme, item.generic)}
    keyExtractor={item => `${item.theme.metaData.themeName}.${item.theme.metaData.themeAuthor}`}
    estimatedItemSize={10}
  /></View>  
    </View>
  );
};
