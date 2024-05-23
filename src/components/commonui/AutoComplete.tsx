import { View, GestureResponderEvent, StyleSheet } from 'react-native';
import { Menu, Searchbar } from 'react-native-paper';
import React, { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { useNoxSetting } from '@stores/useApp';

interface Props {
  placeholder: string;
  value: string;
  setValue: (v: string) => void;
  onSubmit: (v: string) => void;
  onIconPress: (e: GestureResponderEvent) => void;
  icon: () => React.ReactNode;
  resolveData?: (v: string) => Promise<string[]>;
}

export default ({
  placeholder,
  value,
  setValue,
  onSubmit,
  onIconPress,
  icon,
  resolveData,
}: Props) => {
  const [debouncedValue] = useDebounce(value, 500);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [data, setData] = useState<string[]>([]);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const [menuCoords, setMenuCoords] = useState<NoxTheme.coordinates>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (debouncedValue.length < 1) {
      setData([]);
      return;
    }
    resolveData?.(debouncedValue).then(setData);
    setShowAutoComplete(true);
  }, [debouncedValue]);

  return (
    <View style={styles.container}>
      <Searchbar
        onLayout={e =>
          setMenuCoords({
            x: e.nativeEvent.layout.x,
            y: e.nativeEvent.layout.y + e.nativeEvent.layout.height,
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          })
        }
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        onSubmitEditing={() => onSubmit(value)}
        selectTextOnFocus
        style={styles.input}
        selectionColor={playerStyle.customColors.textInputSelectionColor}
        onIconPress={onIconPress}
        icon={icon}
        onBlur={() => setShowAutoComplete(false)}
        onFocus={() => setShowAutoComplete(true)}
      />
      {resolveData && (
        <Menu
          visible={showAutoComplete}
          onDismiss={() => setShowAutoComplete(false)}
          anchor={menuCoords}
        >
          {data.map((datum, i) => (
            <Menu.Item
              key={i}
              onPress={() => {
                setValue(datum);
                setShowAutoComplete(false);
              }}
              title={datum}
            />
          ))}
        </Menu>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  input: { flex: 1 },
});
