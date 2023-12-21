/* eslint-disable node/no-extraneous-import */
/* eslint-disable node/no-unsupported-features/es-syntax */
import { ArgumentParser } from 'argparse';
import axios from 'axios';
import fs from 'fs';
import SteriaTheme from './SteriaTheme.js';
import SteriaThemeDark from './SteriaThemeDark.js';

/**
 * 
https://api.bilibili.com/x/vas/dlc_act/act/basic?act_id={藏品id}
https://api.bilibili.com/x/vas/dlc_act/act/item/list?act_id={藏品id}
 */

const parser = new ArgumentParser({
  description: 'Argparse example',
});

parser.add_argument('--garbid', { help: 'baz bar' });
parser.add_argument('--lighttheme', { help: 'baz bar' });

console.dir(parser.parse_args());

const args = parser.parse_args();

if (args.garbid === undefined) {
  throw Error('garbid is not defined.');
}

const steriaGarb = JSON.parse(
  fs.readFileSync('./src/components/styles/steriaGarb.json', 'utf8')
);

const basicReq = await axios.get(
  `https://api.bilibili.com/x/vas/dlc_act/act/basic?act_id=${args.garbid}`
);
const listReq = await axios.get(
  `https://api.bilibili.com/x/vas/dlc_act/act/item/list?act_id=${args.garbid}`
);

const garbdata = basicReq.data.data;
const parsedGarbData = {
  themeName: garbdata.act_title,
  themeDesc: garbdata.product_introduce,
  gifs: garbdata.suit_items.emoji_package[0].items.map(
    val => val.properties.image
  ),
  portraits: Object.keys(garbdata.suit_items.space_bg[0].properties)
    .filter(val => val.includes('_portrait'))
    .map(val => garbdata.suit_items.space_bg[0].properties[val]),
  themeIcon: garbdata.fan_user.avatar,
};

const convertedGarbData = args.lighttheme ? SteriaTheme : SteriaThemeDark;

convertedGarbData.metaData.themeName = parsedGarbData.themeName;
convertedGarbData.metaData.themeDesc = parsedGarbData.themeDesc;
convertedGarbData.metaData.themeAuthor = 'NoxAutoGen';
convertedGarbData.metaData.themeIcon = parsedGarbData.themeIcon;
convertedGarbData.gifs = parsedGarbData.gifs;
convertedGarbData.backgroundImages = parsedGarbData.headmp4
  ? [
      ...parsedGarbData.portraits,
      {
        type: 'biliGarbHeadVideo',
        identifier: args.garbid,
      },
    ]
  : parsedGarbData.portraits;
convertedGarbData.thumbupSVGA = parsedGarbData.thumbupSVGA;
convertedGarbData.loadingIcon = parsedGarbData.loadingIcon;
fs.writeFile(
  './src/components/styles/steriaGarb.json',
  JSON.stringify([...steriaGarb, convertedGarbData], null, 2),
  () => undefined
);
