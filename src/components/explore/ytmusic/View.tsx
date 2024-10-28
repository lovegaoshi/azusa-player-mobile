import { View, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { Mood } from 'libmuse';
import { useState } from 'react';

import { styles } from '@components/style';

interface Props {
  moods: Mood[];
  processMood: (mood: string) => void;
}
export default ({ moods, processMood }: Props) => {
  const [activeMood, setActiveMood] = useState('');

  const onClickMood = (mood: string) => {
    const newMood = mood === activeMood ? '' : mood;
    setActiveMood(newMood);
    processMood(newMood);
  };

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {moods.map(mood => (
          <View style={styles.rowView}>
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
