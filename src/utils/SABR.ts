import {
  RequestFilter,
  ResponseFilter,
  SabrPlayerAdapter,
} from 'googlevideo/dist/src/types/sabrStreamingAdapterTypes';
import { SabrFormat } from 'googlevideo/dist/src/types/shared';
import { buildSabrFormat } from 'googlevideo/dist/src/utils';
import { VideoInfo } from 'youtubei.js/dist/src/parser/youtube';
import { SabrStreamingAdapter } from 'googlevideo/dist/src/core/SabrStreamingAdapter';
import { Innertube, Constants } from 'youtubei.js';

import ytClient, { ytwebClient } from '@utils/mediafetch/ytbi';
import { getPoT } from '@utils/mediafetch/ytpot';

class DummyPlayerAdapter implements SabrPlayerAdapter {
  videoId: string | undefined;

  constructor(videoId: string) {
    this.videoId = videoId;
  }

  initialize(): void {}
  getPlayerTime() {
    return 0;
  }
  getPlaybackRate() {
    return 1;
  }
  getBandwidthEstimate() {
    return 1;
  }
  getActiveTrackFormats(activeFormat: SabrFormat, sabrFormats: SabrFormat[]) {
    return {
      audioFormat: undefined,
      videoFormat: undefined,
    };
  }
  registerRequestInterceptor(interceptor: RequestFilter) {}
  registerResponseInterceptor(interceptor: ResponseFilter) {}
  dispose() {}
}

let APMSABRAdapter: SabrStreamingAdapter | undefined;

const loadSABR = async (
  videoId: string,
  videoInfo: VideoInfo,
  innertube: Innertube,
) => {
  APMSABRAdapter = new SabrStreamingAdapter({
    playerAdapter: new DummyPlayerAdapter(videoId),
    clientInfo: {
      osName: innertube.session.context.client.osName,
      osVersion: innertube.session.context.client.osVersion,
      clientName: parseInt(
        Constants.CLIENT_NAME_IDS[
          innertube.session.context.client
            .clientName as keyof typeof Constants.CLIENT_NAME_IDS
        ],
      ),
      clientVersion: innertube.session.context.client.clientVersion,
    },
  });
  APMSABRAdapter.onMintPoToken(async () => innertube.session.player!.po_token!);
  APMSABRAdapter.setStreamingURL(
    await innertube.session.player!.decipher(
      videoInfo.streaming_data?.server_abr_streaming_url,
    ),
  );
  APMSABRAdapter.setUstreamerConfig(
    videoInfo.player_config?.media_common_config.media_ustreamer_request_config
      ?.video_playback_ustreamer_config,
  );
  APMSABRAdapter.setServerAbrFormats(
    videoInfo.streaming_data!.adaptive_formats.map(buildSabrFormat),
  );
};

(global as any).testFunction = async (data: string) => {
  const yt = await ytClient();
  const bvid = 'K04WmBtVsOs';
  yt.session.player!.po_token = await getPoT(bvid);
  const extractedVideoInfo = await yt.getBasicInfo(bvid, {
    client: yt.session.player!.po_token === undefined ? 'WEB_EMBEDDED' : 'MWEB',
  });
  await loadSABR(bvid, extractedVideoInfo, yt);
  // @ts-expect-error HACK: call private function to bypass the adapter nonsense
  const res = await APMSABRAdapter?.handleRequest({
    method: 'GET',
    segment: { getStartTime: () => 0, isInit: () => true },
    url: 'sabr://audio?key=140:',
    headers: {},
  });
  console.log('sabr', res);
  return res;
};

export default () => {};
