/* eslint-disable @typescript-eslint/no-explicit-any */
import { wbiQuery } from '@stores/wbi';
import { fetchBiliBVIDs } from './bilivideo';
import {
  fetchPaginatedAPI,
  fetchAwaitPaginatedAPI,
  FetcherProps,
} from './paginatedfetch';
import { biliApiLimiter } from './throttle';
import bfetch from '@utils/BiliFetch';

export const fetchBiliPaginatedAPI = async ({
  url,
  getMediaCount,
  getPageSize,
  getItems,
  progressEmitter,
  favList = [],
  params = undefined,
  limiter = biliApiLimiter,
  resolveBiliBVID = async (bvobjs, progressEmitter2) =>
    await fetchBiliBVIDs(
      bvobjs.map((obj: any) => obj.bvid),
      progressEmitter2
    ),
  startPage = 1,
}: FetcherProps) => {
  return fetchPaginatedAPI({
    url,
    getMediaCount,
    getPageSize,
    getItems,
    progressEmitter,
    favList,
    params,
    limiter,
    resolveBiliBVID,
    fetcher: url.includes('/wbi/') ? wbiQuery : bfetch,
    startPage,
  });
};

export const fetchAwaitBiliPaginatedAPI = async ({
  url,
  getMediaCount,
  getPageSize,
  getItems,
  progressEmitter,
  favList = [],
  params = undefined,
  limiter = biliApiLimiter,
  resolveBiliBVID = async (bvobjs, progressEmitter2) =>
    await fetchBiliBVIDs(
      bvobjs.map((obj: any) => obj.bvid),
      progressEmitter2
    ),
}: FetcherProps) => {
  return fetchAwaitPaginatedAPI({
    url,
    getMediaCount,
    getPageSize,
    getItems,
    progressEmitter,
    favList,
    params,
    limiter,
    resolveBiliBVID,
    fetcher: url.includes('/wbi/') ? wbiQuery : bfetch,
  });
};
