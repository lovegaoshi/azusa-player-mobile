import { getR128GainMapping, saveR128GainMapping } from '@utils/ChromeStorage';
import { restoreR128Gain } from './sqlStorage';
import logger from '../Logger';

export default async () => {
  try {
    const r128gain = await getR128GainMapping();
    if ((Object.entries(r128gain).length ?? 0) > 0) {
      logger.debug(`[APMSQL] migrating r128gain. `);
      await saveR128GainMapping({});
      await restoreR128Gain(
        Object.entries(r128gain).map(([k, v]) => ({ songcid: k, r128gain: v })),
      );
    }
  } catch (e) {
    logger.error(`[APMSQL] failed to migrate r128gain. ${e}`);
  }
};
