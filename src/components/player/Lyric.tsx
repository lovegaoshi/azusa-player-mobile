import React, { useCallback, useEffect, useState } from 'react';
import { Modal, View, Button, StyleSheet, Text } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Lyric } from 'react-native-lyric';
import { useProgress } from 'react-native-track-player';
import { searchLyricOptions, searchLyric } from '../../utils/Data';
import { reExtractSongName } from '../../utils/re';
import { IconButton } from 'react-native-paper';

export const LyricView = ({
  currentTime,
  onLyricPress,
  title,
  artist,
}: any) => {
  const { position, duration } = useProgress();
  const [lrc, setLrc] = useState('无法找到歌词,请手动搜索。');
  const [lrcOptions, setLrcOptions] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (title !== undefined && title !== '') {
      const fetchAndSetLyricOptions = async () => {
        try {
          const extractedName = reExtractSongName(title, artist);
          const options = await searchLyricOptions(extractedName);
          setLrcOptions(options);
        } catch (error) {
          console.error('Error fetching lyric options:', error);
          setLrcOptions([]);
        }
      };

      fetchAndSetLyricOptions();
    }
  }, [title]);

  useEffect(() => {
    console.log('lrcoptions:', lrcOptions);
    if (lrcOptions.length > 0) searchLyric(lrcOptions[0].songMid, setLrc);
  }, [lrcOptions]);

  const lineRenderer = useCallback(
    ({ lrcLine: { millisecond, content }, index, active }: any) => (
      <Text style={{ textAlign: 'center', color: active ? 'black' : 'gray' }}>
        {content}
      </Text>
    ),
    []
  );

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={onLyricPress}>
        <Lyric
          lrc={lrc}
          currentTime={position * 1000}
          lineHeight={32}
          lineRenderer={lineRenderer}
        />
      </TouchableWithoutFeedback>
      <View style={styles.optionsButton}>
        <IconButton
          icon="playlist-edit"
          onPress={() => setModalVisible(!modalVisible)}
        />
      </View>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text>Placeholder for lyric options</Text>
            <Button
              title="Close"
              onPress={() => setModalVisible(!modalVisible)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  optionsButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1, // add this line
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
