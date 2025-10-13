import logger from '@utils/Logger';

/**
 * pings github to get the latest APM release, dev version and apk url
 * @returns
 */
export const getVersion = async () => {
  let noxCheckedVersion: string | undefined;
  let noxAPKUrl: string | undefined;
  let devVersion: string | undefined;
  try {
    const res = await fetch(
      'https://api.github.com/repos/lovegaoshi/azusa-player-mobile/releases/latest',
    );
    const json = await res.json();
    noxCheckedVersion = json.tag_name;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    noxAPKUrl = json.assets.find((f: any) => f.name.includes('arm64-v8a'))
      .browser_download_url;
    const devres = await fetch(
        'https://api.github.com/repos/lovegaoshi/azusa-player-mobile/releases',
      ),
      devjson = await devres.json();
    devVersion = devjson[0].tag_name;
  } catch (e) {
    logger.error(e);
  }
  return { noxCheckedVersion, devVersion, noxAPKUrl };
};
