/* eslint-disable @typescript-eslint/no-explicit-any */
import bfetch from '@utils/BiliFetch';

// see https://github.com/SocialSisterYi/bilibili-API-collect/issues/1155

const API = 'https://api.bilibili.com/x/vas/dlc_act/asset_bag?act_id={act_id}';

interface Props {
  act_id: string;
  index: number | string;
  resolver?: (v: any) => string;
  filter?: (v: any) => any;
}

const biliNFTFetch = async ({
  act_id,
  index,
  resolver = (json: any) => json.card_item.card_img,
  filter = (json: any) =>
    json.item_list.find((item: any) => item.card_item.card_name === index),
}: Props) => {
  const res = await bfetch(API.replace('{act_id}', act_id));
  const json = await res.json();
  if (typeof index === 'string') {
    return resolver(filter(json.data));
  }
  return resolver(json.data.item_list[index]);
};

const biliNFTVideoFetch = ({ act_id, index }: Props) =>
  biliNFTFetch({
    act_id,
    index,
    resolver: v => v.card_item.video_list[0],
  });

const biliNFTRedeemFetch = ({ act_id, index }: Props) =>
  biliNFTFetch({
    act_id,
    index,
    resolver: v =>
      v.card_item.card_type_info.content.animation.animation_video_urls[0],
    filter: v =>
      v.collect_list.find((item: any) => item.redeem_item_name === index),
  });

export { biliNFTVideoFetch, biliNFTRedeemFetch };
