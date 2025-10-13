import * as React from 'react';
import { Button, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { getBiliFavlist, GetFavlistRes } from '@utils/Bilibili/bilifavOperate';
import GenericCheckDialog from '../../dialogs/GenericCheckDialog';
import bilifavlistFetch from '@utils/mediafetch/bilifavlist';
import { dummyPlaylist } from '@objects/Playlist';
import usePlaylistBrowseTree from '@hooks/usePlaylistBrowseTree';

export default function BiliSelectFavButton() {
  const { t } = useTranslation();
  const { addPlaylist } = usePlaylistBrowseTree();
  const [visible, setVisible] = React.useState(false);
  const [favLists, setFavLists] = React.useState<GetFavlistRes[]>([]);
  const [loading, setLoading] = React.useState(false);

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const onClick = async () => {
    setFavLists(await getBiliFavlist());
    showDialog();
  };

  const onSubmit = async (indices: boolean[]) => {
    setLoading(true);
    for (const [i, v] of indices.entries()) {
      if (v) {
        const newPlaylist = {
          ...dummyPlaylist(favLists[i].title),
          songList: (
            await bilifavlistFetch.regexFetch({
              reExtracted: [
                0,
                String(favLists[i].id),
                // HACK: only reExtracted[1] is used so hopefully fine...
              ] as unknown as RegExpExecArray,
              favList: [],
              useBiliTag: false,
            })
          ).songList,
          subscribeUrl: [
            `https://space.bilibili.com/3493085134719196/favlist?fid=${favLists[i].id}`,
          ],
        };
        addPlaylist(newPlaylist);
      }
    }
    hideDialog();
    setLoading(false);
  };

  return (
    <>
      {loading ? (
        <ActivityIndicator size={100} />
      ) : (
        <Button onPress={onClick}>{t('Login.SyncBiliFavlist')}</Button>
      )}
      <GenericCheckDialog
        visible={visible}
        title={t('Login.SyncBiliFavlist')}
        options={favLists}
        onSubmit={onSubmit}
        onClose={() => hideDialog()}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        renderOptionTitle={(val: any) => val.title}
      />
    </>
  );
}
