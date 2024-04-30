/* eslint-disable @typescript-eslint/no-explicit-any */
import bfetch from '@utils/BiliFetch';

// see https://github.com/lovegaoshi/biliNFT

const API =
  'https://api.bilibili.com/x/vas/dlc_act/lottery_home_detail?act_id={act_id}&lottery_id={lottery_id}';

interface Props {
  act_id: string;
  lottery_id: string;
  index: number | string;
  resolver?: (json: any) => string;
}

const biliNFTFetch = async ({
  act_id,
  lottery_id,
  index,
  resolver = (json: any) => json.card_img,
}: Props) => {
  const res = await bfetch(
    API.replace('{act_id}', act_id).replace('{lottery_id}', lottery_id)
  );
  const json = await res.json();
  if (typeof index === 'string') {
    return resolver(
      json.data.item_list.filter(
        (item: { card_info: { card_name: string } }) =>
          item.card_info.card_name === index
      )[0].card_info
    );
  }
  return resolver(json.data.item_list[index].card_info);
};

const biliNFTVideoFetch = async ({ act_id, lottery_id, index }: Props) => {
  return biliNFTFetch({
    act_id,
    lottery_id,
    index,
    resolver: (json: any) => json.video_list[0],
  });
};

export { biliNFTFetch, biliNFTVideoFetch };
