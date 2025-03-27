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

export const fetchBiliPaginatedAPI = ({
  url,
  getMediaCount,
  getPageSize,
  getItems,
  progressEmitter,
  favList = [],
  params = undefined,
  limiter = biliApiLimiter,
  resolveBiliBVID = (bvobjs, progressEmitter2) =>
    fetchBiliBVIDs(
      bvobjs.map((obj: any) => obj.bvid),
      progressEmitter2,
    ),
  startPage = 1,
  processMetadata,
  stopAtPage,
}: FetcherProps) =>
  fetchPaginatedAPI({
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
    processMetadata,
    stopAtPage,
  });

export const fetchAwaitBiliPaginatedAPI = ({
  url,
  getMediaCount,
  getPageSize,
  getItems,
  progressEmitter,
  favList = [],
  params = undefined,
  limiter = biliApiLimiter,
  resolveBiliBVID = (bvobjs, progressEmitter2) =>
    fetchBiliBVIDs(
      bvobjs.map((obj: any) => obj.bvid),
      progressEmitter2,
    ),
  stopAtPage,
}: FetcherProps) =>
  fetchAwaitPaginatedAPI({
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
    stopAtPage,
  });
