import React, { useEffect, useState } from 'react';
import { Pressable, Image, StyleSheet } from 'react-native';

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

interface randomGIFParam {
  gifs: Array<string>;
  favList: string;
  onClickCallback?: () => void;
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
  onClickCallback = () => void 0,
}: randomGIFParam) {
  const [randomGIFSrc, setRandomGIFSrc] = useState(
    getRandomNumberExclude(gifs.length, -1)
  );

  useEffect(() => {
    setRandomGIFSrc(getRandomNumberExclude(gifs.length, randomGIFSrc));
  }, [favList]);

  return (
    <Pressable
      onPress={() => {
        setRandomGIFSrc(getRandomNumberExclude(gifs.length, randomGIFSrc));
        onClickCallback();
      }}
    >
      <FastImage
        style={{ width: 72, height: 72 }}
        source={{ uri: gifs[randomGIFSrc] }}
        alt=""
      />
    </Pressable>
  );
}
