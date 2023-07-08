import { logger } from '../Logger';
import bfetch from '../BiliFetch';

// see https://github.com/lovegaoshi/biliNFT

const API =
  'https://api.bilibili.com/x/vas/dlc_act/act/item/list?act_id={act_id}';

interface props {
  act_id: string;
  index: number;
  resolver?: (json: any) => string;
}

const biliNFTFetch = async ({
  act_id,
  index,
  resolver = (json: any) => json.card_img,
}: props) => {
  const res = await bfetch(API.replace('{act_id}', act_id));
  const json = await res.json();
  return resolver(json.data.item_list[index].card_item);
};

const biliNFTVideoFetch = async ({ act_id, index }: props) => {
  return biliNFTFetch({
    act_id,
    index,
    resolver: (json: any) => json.video_list[0],
  });
};

export { biliNFTFetch, biliNFTVideoFetch };
