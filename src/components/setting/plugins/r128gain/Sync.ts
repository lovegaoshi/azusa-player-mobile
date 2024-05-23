import axios from "axios";
import { strFromU8, decompressSync } from "fflate";
// eslint-disable-next-line import/no-unresolved
import { RGAIN_URL } from "@env";

import { logger } from "@utils/Logger";
import {
  saveABMapping,
  saveR128GainMapping,
  getABMapping,
  getR128GainMapping,
} from "@utils/ChromeStorage";

interface R128GainDB {
  itemid: string;
  r128gain?: number;
  abrepeat?: string;
}

// TODO: marks my stupidity bc github already gzips, you dum
export const downloadGZippedR128GainDB = async () => {
  const res = await axios.get(
    "https://raw.githubusercontent.com/lovegaoshi/APM-r128gain/main/rules.gzip",
    {
      responseType: "arraybuffer",
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    },
  );
  if (res.status === 200) {
    const content = new Uint8Array(await res.data);
    return JSON.parse(
      strFromU8(decompressSync(decompressSync(content))),
    ) as R128GainDB[];
  }
  throw new Error("rules.gzip is not resolved as a Uint8Array:(");
};

export const downloadUncompressedR128GainDB = async () => {
  const res = await fetch(
    "https://raw.githubusercontent.com/lovegaoshi/APM-r128gain/main/rules.json",
  );
  const json = (await res.json()) as R128GainDB[];
  return json;
};

export const downloadR128GainDB = async () => {
  const json = await downloadUncompressedR128GainDB();

  // const json = await downloadGZippedR128GainDB();
  const currentR128Gain = await getR128GainMapping();
  const currentABRepeat = await getABMapping();
  const parsedR128Gain = json.reduce((acc, curr) => {
    const numberedR128Gain = Number(curr.r128gain);
    if (Number.isNaN(numberedR128Gain)) {
      return acc;
    }
    return { ...acc, [curr.itemid]: numberedR128Gain };
  }, {} as NoxStorage.R128Dict);
  saveR128GainMapping({
    ...currentR128Gain,
    ...parsedR128Gain,
  });
  const parsedABRepeat = json.reduce((acc, curr) => {
    try {
      const numberedABRepeat = JSON.parse(curr.abrepeat || "") as [
        number,
        number,
      ];
      if (
        Array.isArray(numberedABRepeat) &&
        Number.isFinite(numberedABRepeat[0]) &&
        Number.isFinite(numberedABRepeat[1])
      ) {
        const newABRepeat: [number, number] = [
          numberedABRepeat[0],
          numberedABRepeat[1],
        ];
        return {
          ...acc,
          [curr.itemid]: newABRepeat,
        };
      }
      return acc;
    } catch {
      return acc;
    }
  }, {} as NoxStorage.ABDict);
  saveABMapping({
    ...currentABRepeat,
    ...parsedABRepeat,
  });

  const oldR128gainKeys = Object.keys(parsedR128Gain).map((val) => val);
  const oldABgainKeys = Object.keys(parsedABRepeat).map((val) => val);
  const newR128GainDB: { [key: string]: R128GainDB } = {};
  Object.entries(currentR128Gain).forEach(([key, value]) => {
    if (oldR128gainKeys.includes(key)) return;
    if (newR128GainDB[key] === undefined) {
      newR128GainDB[key] = {
        itemid: key,
      };
    }
    newR128GainDB[key].r128gain = value === null ? undefined : value;
  });
  Object.entries(currentABRepeat).forEach(([key, value]) => {
    if (oldABgainKeys.includes(key)) return;
    if (newR128GainDB[key] === undefined) {
      newR128GainDB[key] = {
        itemid: key,
      };
    }
    newR128GainDB[key].abrepeat = JSON.stringify(value);
  });
  const uploadR128Dict = Array.from(Object.values(newR128GainDB));
  logger.debug(
    `[R128Sync] now uploading ${uploadR128Dict.length} entries back to noxPlay`,
  );
  const uploadRes = await fetch(RGAIN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    // TODO: gzip this
    body: JSON.stringify(uploadR128Dict),
  });
  logger.debug(uploadRes);
};
