import { ArgumentParser } from 'argparse';
import axios from 'axios';
import fs from 'fs';
import SteriaTheme from './SteriaTheme.js';
import SteriaThemeDark from './SteriaThemeDark.js';

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
const garbdata = basicReq.data.data;

const garblistdata = await Promise.all(
  garbdata.lottery_list.map(async list => {
    const req = await axios.get(
      `https://api.bilibili.com/x/vas/dlc_act/lottery_home_detail?act_id=${args.garbid}&lottery_id=${list.lottery_id}`
    );
    return req.data.data;
  })
);

const parsedGarbData = {
  themeName: garbdata.act_title,
  themeDesc: garbdata.product_introduce,
  gifs: [],
  themeIcon: garbdata.act_y_img,
  portraits: garblistdata
    .map(item =>
      item.item_list.map(list =>
        list.card_info.video_list
          ? {
              type: 'biliNFTVideoNew',
              identifier: `["${args.garbid}","${item.lottery_id}","${list.card_info.card_name}"]`,
            }
          : list.card_info.card_img
      )
    )
    .flat(),
};

const emojiId = garbdata.collect_list?.filter(v =>
  v.redeem_item_name.includes('表情包')
)[0]?.redeem_item_id;

if (emojiId) {
  const realEmojiId = (
    await axios.get(`https://bili-nft.vercel.app/get-emote/?mid=${emojiId}`)
  ).data.id;
  parsedGarbData.gifs = (
    await axios.get(
      `https://api.bilibili.com/x/emote/package?business=reply&ids=${realEmojiId}`
    )
  ).data.data.packages[0].emote.map(v => v.url);
}

const convertedGarbData = args.lighttheme ? SteriaTheme : SteriaThemeDark;

convertedGarbData.metaData.themeName = parsedGarbData.themeName;
convertedGarbData.metaData.themeDesc = parsedGarbData.themeDesc;
convertedGarbData.metaData.themeAuthor = 'NoxAutoGen';
convertedGarbData.metaData.themeIcon = parsedGarbData.themeIcon;
convertedGarbData.gifs = parsedGarbData.gifs;

convertedGarbData.backgroundImages = parsedGarbData.portraits;
fs.writeFile(
  './src/components/styles/steriaGarb.json',
  JSON.stringify([...steriaGarb, convertedGarbData], null, 2),
  () => undefined
);
