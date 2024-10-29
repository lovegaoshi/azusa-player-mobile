import { useState, useCallback } from 'react';

import { fetchDynamic } from '@utils/mediafetch/biliDynamic';
import { fetchRanking } from '@utils/mediafetch/biliRanking';
import { fetchCurrentMusicTop } from '@utils/mediafetch/biliMusicTop';
import { fetchMusicHot } from '@utils/mediafetch/biliMusicHot';
import { fetchMusicNew } from '@utils/mediafetch/biliMusicNew';
import { BiliCatSongs } from '../SongTab';

export interface UseBiliExplore {
  biliDynamic: BiliCatSongs;
  biliRanking: BiliCatSongs;
  biliMusicTop: NoxMedia.Song[];
  biliMusicHot: NoxMedia.Song[];
  biliMusicNew: NoxMedia.Song[];
  refreshing: boolean;
  loading: boolean;
  onRefresh: () => void;
  init: () => void;
}

export default () => {
  const [biliDynamic, setBiliDynamic] = useState<BiliCatSongs>({});
  const [biliRanking, setBiliRanking] = useState<BiliCatSongs>({});
  const [biliMusicTop, setBiliMusicTop] = useState<NoxMedia.Song[]>([]);
  const [biliMusicHot, setBiliMusicHot] = useState<NoxMedia.Song[]>([]);
  const [biliMusicNew, setBiliMusicNew] = useState<NoxMedia.Song[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const initData = async () =>
    Promise.all([
      fetchRanking().then(setBiliRanking),
      fetchDynamic().then(setBiliDynamic),
      fetchCurrentMusicTop().then(setBiliMusicTop),
      fetchMusicHot().then(setBiliMusicHot),
      fetchMusicNew().then(setBiliMusicNew),
    ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDynamic()
      .then(setBiliDynamic)
      .then(() => setRefreshing(false));
  }, []);

  const init = () => {
    if (!loading) return;
    initData().then(() => setLoading(false));
  };

  return {
    loading,
    refreshing,
    onRefresh,
    biliDynamic,
    biliRanking,
    biliMusicTop,
    biliMusicHot,
    biliMusicNew,
    init,
  };
};
