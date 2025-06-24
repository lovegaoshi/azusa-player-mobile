// eslint-disable-next-line import/no-unresolved
import { RGAIN_URL } from '@env';

import { logger } from '@utils/Logger';
import { restoreR128Gain, restoreABRepeat } from '@utils/db/sqlStorage';
import { getSyncABRepeatR128 } from '@utils/db/sqlAPI';

interface R128GainDB {
  itemid: string;
  r128gain?: number;
  abrepeat?: string;
}

export const downloadUncompressedR128GainDB = async () => {
  const res = await fetch(
    'https://raw.githubusercontent.com/lovegaoshi/APM-r128gain/main/rules.json',
  );
  const json = (await res.json()) as R128GainDB[];
  return json;
};

export const downloadR128GainDB = async () => {
  const json = await downloadUncompressedR128GainDB();
  await restoreR128Gain(
    json.map(curr => {
      const numberedR128Gain = Number(curr.r128gain);
      return {
        songcid: curr.itemid,
        r128gain: Number.isNaN(numberedR128Gain) ? null : numberedR128Gain,
      };
    }),
  );
  await restoreABRepeat(
    json.map(curr => {
      try {
        const numberedABRepeat = JSON.parse(curr.abrepeat ?? '""') as [
          number,
          number,
        ];
        if (
          Array.isArray(numberedABRepeat) &&
          Number.isFinite(numberedABRepeat[0]) &&
          Number.isFinite(numberedABRepeat[1])
        ) {
          return {
            songcid: curr.itemid,
            a: numberedABRepeat[0],
            b: numberedABRepeat[1],
          };
        }
      } catch {
        logger.error(`[R128Sync] failed to parse ${curr.abrepeat}`);
      }
      return {
        songcid: curr.itemid,
        a: curr.abrepeat ? JSON.parse(curr.abrepeat)[0] : 0,
        b: curr.abrepeat ? JSON.parse(curr.abrepeat)[1] : 1,
      };
    }),
  );

  // this is the format: [{itemid, abrpeat?, r128gain? }]
  // {"itemid": "76311128", "abrepeat": "[0,0.8894230769230769]", "r128gain": -9.28}
  const uploadR128Dict = await getSyncABRepeatR128();
  logger.debug(
    `[R128Sync] now uploading ${uploadR128Dict.length} entries back to noxPlay`,
  );
  try {
    const uploadRes = await fetch(RGAIN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      // TODO: gzip this
      body: JSON.stringify(uploadR128Dict),
    });
    logger.debug(uploadRes);
  } catch {
    logger.warn(`[APMSync] failed to upload to ${RGAIN_URL}`);
  }
};
