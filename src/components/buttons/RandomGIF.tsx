import React, { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
// import { Image } from 'expo-image';
import { Image } from 'expo-image';

const getRandomNumberExclude = (randRange: number, exclude = -1) => {
  if (exclude > 0) {
    const val = Math.floor(Math.random() * (randRange - 1)) >> 0;
    if (val === exclude) {
      return randRange - 1;
    }
    return val;
  }
  return Math.floor(Math.random() * randRange) >> 0;
};

interface Props {
  gifs: Array<string>;
  favList: string;
  onClickCallback?: () => void;
  iconsize?: number;
}
/**
 * returns a button that shows a random gif from the input array. when clicked, change the gif into another one.
 * @param {string[]} gifs a list of gifs.
 * @param {string} favList an identifier/signal that changes the gif.
 * @param {function} onClickCallback extra onclick function when button is clicked.
 */
export default function RandomGIFButton({
  gifs,
  favList,
  onClickCallback = () => undefined,
  iconsize = 72,
}: Props) {
  const [randomGIFSrc, setRandomGIFSrc] = useState(-1);
  const [randomGIFURI, setRandomGIFURI] = useState({ uri: 'dummyVal' });

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
    >
      <Image
        style={{ width: iconsize, height: iconsize }}
        source={randomGIFURI}
        resizeMode={'contain'}
        transition={{ effect: 'flip-from-top' }}
        // contentFit="contain"
      />
    </Pressable>
  );
}
