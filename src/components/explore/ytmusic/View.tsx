import { View, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { useEffect, useState } from 'react';

import { styles } from '@components/style';
import { UseYTMExplore } from './useYTMExplore';

interface Props {
  useYTMExplore: UseYTMExplore;
}
export default ({ useYTMExplore }: Props) => {
  const [activeMood, setActiveMood] = useState('');
  const { moods, refreshHome, initialize } = useYTMExplore;

  const onClickMood = (mood: string) => {
    const newMood = mood === activeMood ? '' : mood;
    setActiveMood(newMood);
    refreshHome(newMood);
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {moods.map(mood => (
          <View style={styles.rowView} key={mood.params}>
            <Button
              key={mood.name}
              mode={mood.params === activeMood ? 'contained' : 'outlined'}
              onPress={() => onClickMood(mood.params)}
            >
              {mood.name}
            </Button>
            <View style={{ width: 15 }} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
