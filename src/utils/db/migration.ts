import { getR128GainMapping, saveR128GainMapping } from '@utils/ChromeStorage';
import { restoreR128Gain } from './sqlStorage';

export default async () => {
  const r128gain = await getR128GainMapping();
  if ((r128gain.size ?? 0) > 0) {
    await saveR128GainMapping({});
    await restoreR128Gain(
      Object.entries(r128gain).map(([k, v]) => ({ songcid: k, r128gain: v })),
    );
  }
};
