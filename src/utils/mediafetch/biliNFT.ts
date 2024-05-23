/* eslint-disable @typescript-eslint/no-explicit-any */
import bfetch from '@utils/BiliFetch';

// see https://github.com/lovegaoshi/biliNFT

const API =
  'https://api.bilibili.com/x/vas/dlc_act/act/item/list?act_id={act_id}';

interface Props {
  act_id: string;
  index: number | string;
  resolver?: (json: any) => string;
}

const biliNFTFetch = async ({
  act_id,
  index,
  resolver = (json: any) => json.card_img,
}: Props) => {
  const res = await bfetch(API.replace('{act_id}', act_id));
  const json = await res.json();
  if (typeof index === 'string') {
    return resolver(
      json.data.item_list.filter(
        (item: { card_item: { card_name: string } }) =>
          item.card_item.card_name === index
      )[0].card_item
    );
  }
  return resolver(json.data.item_list[index].card_item);
};

const biliNFTVideoFetch = async ({ act_id, index }: Props) => {
  return biliNFTFetch({
    act_id,
    index,
    resolver: (json: any) => json.video_list[0],
  });
};

export { biliNFTVideoFetch };
