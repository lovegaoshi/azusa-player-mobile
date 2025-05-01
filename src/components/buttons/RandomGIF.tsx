import React, { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { randomNumber } from '@utils/Utils';

const getRandomNumberExclude = (randRange: number, exclude = -1) => {
  if (exclude > 0) {
    const val = randomNumber(randRange - 1);
    if (val === exclude) {
      return randRange - 1;
    }
    return val;
  }
  return randomNumber(randRange);
};

interface Props {
  gifs: string[];
  favList: string;
  onClickCallback?: () => void;
  iconsize?: number;
}
/**
 * returns a button that shows a random gif from the input array. when clicked, change the gif into another one.
 */
export default function RandomGIFButton({
  gifs,
  favList,
  onClickCallback = () => undefined,
  iconsize = 72,
}: Props) {
  const [randomGIFSrc, setRandomGIFSrc] = useState(-1);
  const [randomGIFURI, setRandomGIFURI] = useState({ uri: 'dummyVal' });
  const { t } = useTranslation();

  useEffect(() => {
    const newIndex = getRandomNumberExclude(gifs.length, randomGIFSrc);
    setRandomGIFSrc(newIndex);
    setRandomGIFURI({ uri: gifs[newIndex] });
  }, [favList]);

  return (
    <Pressable
      onPress={() => {
        const newIndex = getRandomNumberExclude(gifs.length, randomGIFSrc);
        setRandomGIFSrc(newIndex);
        setRandomGIFURI({ uri: gifs[newIndex] });
        onClickCallback();
      }}
      accessibilityLabel={t('Accessibility.gif')}
    >
      <Image
        style={{ width: iconsize, height: iconsize }}
        source={{ ...randomGIFURI, width: iconsize, height: iconsize }}
        contentFit={'contain'}
      />
    </Pressable>
  );
}
