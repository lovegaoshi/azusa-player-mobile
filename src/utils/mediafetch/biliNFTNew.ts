/* eslint-disable @typescript-eslint/no-explicit-any */
import bfetch from '@utils/BiliFetch';

// see https://github.com/lovegaoshi/biliNFT

const API =
  'https://api.bilibili.com/x/vas/dlc_act/lottery_home_detail?act_id={act_id}&lottery_id={lottery_id}';

interface Props {
  act_id: string;
  lottery_id: string;
  index: number | string;
  resolver?: (v: any) => string;
  filter?: (v: any) => any;
}

const biliNFTFetch = async ({
  act_id,
  lottery_id,
  index,
  resolver = (json: any) => json.card_info.card_img,
  filter = (json: any) =>
    json.item_list.filter(
      (item: { card_info: { card_name: string } }) =>
        item.card_info.card_name === index
    )[0],
}: Props) => {
  const res = await bfetch(
    API.replace('{act_id}', act_id).replace('{lottery_id}', lottery_id)
  );
  const json = await res.json();
  if (typeof index === 'string') {
    return resolver(filter(json.data));
  }
  return resolver(json.data.item_list[index]);
};

const biliNFTVideoFetch = async ({ act_id, lottery_id, index }: Props) =>
  biliNFTFetch({
    act_id,
    lottery_id,
    index,
    resolver: v => v.card_info.video_list[0],
  });

const biliNFTRedeemFetch = async ({ act_id, lottery_id, index }: Props) =>
  biliNFTFetch({
    act_id,
    lottery_id,
    index,
    resolver: v =>
      v.card_item.card_type_info.content.animation.animation_video_urls[0],
    filter: v =>
      v.collect_list.collect_infos.filter(
        (item: any) => item.redeem_item_name === index
      )[0],
  });

export { biliNFTVideoFetch, biliNFTRedeemFetch };
