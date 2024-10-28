import * as React from 'react';

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
}

export default () => {
  const [biliDynamic, setBiliDynamic] = React.useState<BiliCatSongs>({});
  const [biliRanking, setBiliRanking] = React.useState<BiliCatSongs>({});
  const [biliMusicTop, setBiliMusicTop] = React.useState<NoxMedia.Song[]>([]);
  const [biliMusicHot, setBiliMusicHot] = React.useState<NoxMedia.Song[]>([]);
  const [biliMusicNew, setBiliMusicNew] = React.useState<NoxMedia.Song[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const initData = async () =>
    Promise.all([
      fetchRanking().then(setBiliRanking),
      fetchDynamic().then(setBiliDynamic),
      fetchCurrentMusicTop().then(setBiliMusicTop),
      fetchMusicHot().then(setBiliMusicHot),
      fetchMusicNew().then(setBiliMusicNew),
    ]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDynamic()
      .then(setBiliDynamic)
      .then(() => setRefreshing(false));
  }, []);

  React.useEffect(() => {
    if (!loading) return;
    initData().then(() => setLoading(false));
  }, []);

  return {
    loading,
    refreshing,
    onRefresh,
    biliDynamic,
    biliRanking,
    biliMusicTop,
    biliMusicHot,
    biliMusicNew,
  };
};
