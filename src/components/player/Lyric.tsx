import React, { useCallback, useEffect, useState } from 'react';
import { Text } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Lyric } from 'react-native-lyric';
import { useProgress } from 'react-native-track-player';
import { searchLyricOptions, searchLyric } from '../../utils/Data';
import { reExtractSongName } from '../../utils/re';

export const LyricView = ({
  currentTime,
  onLyricPress,
  title,
  artist,
}: any) => {
  const { position, duration } = useProgress();
  const [lrc, setLrc] = useState('无法找到歌词,请手动搜索。');
  const [lrcOptions, setLrcOptions] = useState<any[]>([]);

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
    <TouchableWithoutFeedback onPress={onLyricPress}>
      <Lyric
        lrc={lrc}
        currentTime={position * 1000}
        lineHeight={32}
        lineRenderer={lineRenderer}
      />
    </TouchableWithoutFeedback>
  );
};
