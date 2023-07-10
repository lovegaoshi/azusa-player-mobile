import { regexFetchProps } from './generic';
import { fetchAudioInfo } from './ytbvideo';

const fetchYTPlaylist = async (playlistId: string) => {
  const res = await fetch(
    `https://www.youtube.com/playlist?list=${playlistId}`
  );
  const content = await res.text();
  const matchedSet = new Set<string>();
  for (const matched of content.matchAll(/\/watch\?v=([A-Za-z0-9_-]{11})/g)) {
    matchedSet.add(matched[1]);
  }
  return Array.from(matchedSet);
};

const regexFetch = async ({
  reExtracted,
  progressEmitter = () => undefined,
  favList = [],
}: regexFetchProps) => {
  const results = await Promise.all(
    (await fetchYTPlaylist(reExtracted[1]))
      .filter(val => !favList.includes(val))
      .map((val, index, arr) =>
        fetchAudioInfo(val, () => progressEmitter((index * 100) / arr.length))
      )
  );
  return results
    .filter(val => val !== undefined)
    .reduce((acc, curr) => acc!.concat(curr!), [] as NoxMedia.Song[]);
};

export default {
  regexSearchMatch: /youtu.*list=([^&]+)/,
  regexFetch,
};
