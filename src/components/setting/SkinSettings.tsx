import * as React from 'react';
import Image from 'react-native-fast-image';
import { View, SafeAreaView, StyleSheet, Dimensions } from 'react-native';
import {
  Text,
  IconButton,
  TouchableRipple,
  RadioButton,
} from 'react-native-paper';
import Animated, {
  Layout,
  LightSpeedInLeft,
  LightSpeedOutRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  ScrollView,
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import SkinSearchbar from './SkinSearchbar';
import { useNoxSetting } from '@hooks/useSetting';
import AzusaTheme from '../styles/AzusaTheme';
// import AzusaTheme from '../styles/SteriaTheme';
import NoxTheme from '../styles/NoxTheme';
import AdaptiveTheme from '../styles/DefaultAdaptiveTheme';
import { getUniqObjects } from '@utils/Utils';

const WindowWidth = Dimensions.get('window').width;

interface DisplayTheme extends NoxTheme.Style {
  builtin: boolean;
  isAdaptive?: boolean;
}

interface SkinItemProps {
  skin: DisplayTheme;
  checked: string;
  setChecked: (val: string) => void;
}

const BuiltInThemes: DisplayTheme[] = [
  {
    ...AdaptiveTheme,
    builtin: true,
  },
  {
    ...AzusaTheme,
    builtin: true,
  },
  {
    ...NoxTheme,
    builtin: true,
  },
];

const SkinItem = ({ skin, checked, setChecked }: SkinItemProps) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setPlayerStyle = useNoxSetting(state => state.setPlayerStyle);
  const playerStyles = useNoxSetting(state => state.playerStyles);
  const setPlayerStyles = useNoxSetting(state => state.setPlayerStyles);
  const getThemeID = (skin: NoxTheme.Style) =>
    `${skin.metaData.themeName}.${skin.metaData.themeAuthor}`;
  const themeID = getThemeID(skin);
  const mounted = React.useRef(false);
  const isPressed = useSharedValue(false);
  const offset = useSharedValue({ x: 0, y: 0 });
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offset.value.x },
        { translateY: offset.value.y },
        { scale: withSpring(isPressed.value ? 1.2 : 1) },
      ],
    };
  });

  const deleteTheme = () =>
    setPlayerStyles(playerStyles.filter(pSkin => pSkin !== skin));

  const start = useSharedValue({ x: 0, y: 0 });
  const gesture = Gesture.Pan()
    .manualActivation(true)
    .onTouchesMove((e, state) => {
      if (
        e.changedTouches[0].x > 5 &&
        e.changedTouches[0].x < 77 &&
        e.changedTouches[0].y < 72
      ) {
        state.activate();
      }
    })
    .onStart(() => {
      isPressed.value = true;
    })
    .onUpdate(e => {
      offset.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
    })
    .onEnd(() => {
      if (Math.abs(offset.value.x) > WindowWidth * 0.4 && !skin.builtin) {
        runOnJS(deleteTheme)();
      } else {
        offset.value = {
          x: withSpring(0),
          y: withSpring(0),
        };
      }
    })
    .onFinalize(() => {
      isPressed.value = false;
    });

  const selectTheme = () => {
    setChecked(themeID);
    setPlayerStyle(skin);
  };

  React.useEffect(() => {
    mounted.current = true;
  }, []);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        entering={mounted.current ? LightSpeedInLeft : undefined}
        exiting={LightSpeedOutRight}
        layout={Layout.springify()}
        style={animatedStyles}
      >
        <TouchableRipple onPress={selectTheme}>
          <View style={styles.skinItemContainer}>
            <View style={styles.skinItemLeftContainer}>
              <Image
                source={{ uri: skin.metaData.themeIcon }}
                style={styles.skinItemImage}
              />
              <View style={styles.skinItemTextContainer}>
                <Text
                  variant={'titleMedium'}
                  style={styles.skinTitleText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >{`${skin.metaData.themeName} by ${skin.metaData.themeAuthor}`}</Text>
                <Text
                  variant={'labelLarge'}
                  style={{
                    color: playerStyle.colors.secondary,
                    maxWidth: '90%',
                  }}
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
      </Animated.View>
    </GestureDetector>
  );
};

const SkinSettings = () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const playerStyles = useNoxSetting(state => state.playerStyles);
  const setPlayerStyles = useNoxSetting(state => state.setPlayerStyles);
  const allThemes = BuiltInThemes.concat(playerStyles);
  const getThemeID = (skin: NoxTheme.Style) =>
    `${skin.metaData.themeName}.${skin.metaData.themeAuthor}`;
  const [checked, setChecked] = React.useState(getThemeID(playerStyle));
  const scrollViewRef = React.useRef<ScrollView | null>(null);

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

  React.useEffect(() => {
    const currentThemeIndex = allThemes.findIndex(
      theme => getThemeID(theme) === checked
    );
    if (currentThemeIndex > -1) {
      scrollViewRef.current?.scrollTo({
        x: 0,
        y: Math.max(
          0,
          currentThemeIndex * 107 - Dimensions.get('window').height / 2
        ),
        animated: false,
      });
    }
  }, []);

  return (
    <SafeAreaView
      style={[
        styles.safeAreaView,
        { backgroundColor: playerStyle.customColors.maskedBackgroundColor },
      ]}
    >
      <SkinSearchbar onSearched={loadCustomSkin} />
      <ScrollView ref={scrollViewRef}>
        {allThemes.map(item => (
          <SkinItem
            skin={item}
            checked={checked}
            setChecked={setChecked}
            key={getThemeID(item)}
          />
        ))}
      </ScrollView>
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
  skinTitleText: {
    maxWidth: '100%',
  },
});

export default SkinSettings;
