import { wbiQuery } from '@stores/wbi';
import { getDm } from '../Bilibili/bilidm';
import { getWebid } from '../Bilibili/biliWebid';

const API = 'https://api.bilibili.com/x/space/wbi/acc/info?mid={mid}';

export const getBiliUser = async (mid: string) => {
  const res = await wbiQuery(
    API.replace('{mid}', mid) + `${getDm()}${await getWebid(mid)}`,
  );
  const json = await res.json();
  return json.data;
};
