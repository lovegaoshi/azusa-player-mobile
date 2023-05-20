import * as React from 'react';
import { IconButton, Text, TextInput } from 'react-native-paper';
import { View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { styles } from '../style';
import { useNoxSetting } from '../../hooks/useSetting';
import { seconds2HHMMSS } from '../../utils/Utils';

interface props {
  searchText: string;
  setSearchText: (val: string) => void;
  search?: boolean;
  onPressed?: () => void;
}

export default ({
  searchText,
  setSearchText,
  search = false,
  onPressed = () => void 0,
}: props) => {
  const { t } = useTranslation();
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const playerStyle = useNoxSetting(state => state.playerStyle);

  React.useEffect(() => {
    setSearchText('');
  }, [currentPlaylist]);

  return (
    <View style={{ flex: 3, paddingLeft: 10 }}>
      {search ? (
        <TextInput
          placeholder={String(t('PlaylistSearchBar.label'))}
          value={searchText}
          dense
          onChangeText={(val: string) => {
            setSearchText(val);
          }}
          style={{ height: 40 }}
          autoFocus
          selectTextOnFocus
          selectionColor={playerStyle.customColors.textInputSelectionColor}
        />
      ) : (
        <Pressable onPress={onPressed}>
          <Text variant="titleMedium" style={{}}>
            {currentPlaylist.title}
          </Text>
          <Text variant="labelMedium" style={{}}>
            {`${currentPlaylist.songList.length} / ${seconds2HHMMSS(
              currentPlaylist.songList.reduce(
                (accumulator, currentValue) =>
                  accumulator + currentValue.duration,
                0
              )
            )}`}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export const PlaylistInfo = () => {
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);

  return (
    <View style={[styles.topBarContainer, { top: 10 }]}>
      <View style={{ flex: 4 }}>
        <Text variant="titleMedium" style={{}}>
          {currentPlaylist.title}
        </Text>
        <Text variant="labelMedium" style={{}}>
          {`${currentPlaylist.songList.length} / ${seconds2HHMMSS(
            currentPlaylist.songList.reduce(
              (accumulator, currentValue) =>
                accumulator + currentValue.duration,
              0
            )
          )}`}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          flex: 2,
          bottom: 5,
          justifyContent: 'flex-end',
        }}
      >
        <IconButton
          icon="playlist-edit"
          onPress={() => console.log}
          size={25}
        />
        <IconButton icon="autorenew" onPress={() => console.log} size={25} />
      </View>
    </View>
  );
};
