import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Lyric } from 'react-native-lyric';
import { useProgress } from 'react-native-track-player';
import { searchLyricOptions, searchLyric } from '../../utils/Data';
import { reExtractSongName } from '../../utils/re';
import { IconButton } from 'react-native-paper';
import {} from 'react-native';

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
          icon="more"
          onPress={() => setModalVisible(!modalVisible)}
        />
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.headerText}>Lyric Options</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <IconButton icon="chevron-down"/>
              </TouchableOpacity>
            </View>
            <FlatList
              data={[
                { key: 'Option 1' },
                { key: 'Option 2' },
                { key: 'Option 3' },
              ]}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => console.log(item.key)}>
                  <Text style={styles.listItem}>{item.key}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.key}
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
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.1)', 
  },

  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'grey',
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white', 
  },

  listItem: {
    padding: 10,
    fontSize: 18,
    borderTopColor: 'grey',
  },
});
