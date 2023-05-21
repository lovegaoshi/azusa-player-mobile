import Bottleneck from 'bottleneck';

/**
 * limits to bilibili API call to 200ms/call using bottleneck.
 * 100ms/call seems to brick IP after ~ 400 requests.
 */
const biliApiLimiter = new Bottleneck({
  minTime: 200,
  maxConcurrent: 5,
});

/**
 * limits to bilibili.tag API call to 100ms/call using bottleneck
 * through experiment bilibili.tag seems to be more tolerable
 * than other APIs such as getvideoinfo
 */
const biliTagApiLimiter = new Bottleneck({
  minTime: 100,
  maxConcurrent: 5,
});

const awaitLimiter = new Bottleneck({
  minTime: 2000,
  maxConcurrent: 1,
});

export const throttler = { biliApiLimiter, biliTagApiLimiter, awaitLimiter };
