import { wbiQuery } from '@stores/wbi';
import { Source } from '@enums/MediaFetch';

const API = 'https://api.bilibili.com/x/player/wbi/v2?bvid={bvid}&cid={cid}';

interface Section {
  title: string;
  from: number;
  to: number;
  cover: string;
}

export const getSections = async (song: NoxMedia.Song): Promise<Section[]> => {
  if (song.source !== Source.bilivideo || song.id.startsWith('null-'))
    return [];
  const res = await wbiQuery(
    API.replace('{bvid}', song.bvid).replace('{cid}', song.id),
  );
  const json = await res.json();
  return json.data.view_endpoints.map((view: any) => ({
    title: view.content,
    from: view.from,
    to: view.to,
    cover: view.imgUrl,
  }));
};
