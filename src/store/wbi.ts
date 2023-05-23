/**
 * wbi store of zustand serving playbackServices.
 * https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/misc/sign/wbi.md
 * given the nature of wbis that it needs to be refreshed sometimes,
 * its best to use a store. this means its time to use zustand in 
 * noxplayer too. given this is a standalone store it should be drop in 
 * functional.
 */

import { createStore } from 'zustand/vanilla';
import md5 from 'md5';
import bfetch from '../utils/BiliFetch';
import { logger } from '../utils/Logger';

interface wbiStore {
  img_key: string;
  sub_key: string;
}

const wbiStore = createStore<wbiStore>(() => ({
  img_key: '',
  sub_key: '',
}));

const mixinKeyEncTab = [
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
    33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
    61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
    36, 20, 34, 44, 52
]

// 对 imgKey 和 subKey 进行字符顺序打乱编码
const getMixinKey = (orig: string) => {
    let temp = ''
    mixinKeyEncTab.forEach((n) => {
        temp += orig[n]
    })
    return temp.slice(0, 32)
}

// 为请求参数进行 wbi 签名
export const encWbi = (params: {[key: string]: string}) => {
    const { img_key, sub_key } = wbiStore.getState();
    const mixin_key = getMixinKey(img_key + sub_key),
        curr_time = Math.round(Date.now() / 1000),
        chr_filter = /[!'\(\)*]/g
    const query: string[] = []
    params = Object.assign(params, {wts: curr_time})    // 添加 wts 字段
    // 按照 key 重排参数
    Object.keys(params).sort().forEach((key) => {
        query.push(
            encodeURIComponent(key) +
            '=' + 
            // 过滤 value 中的 "!'()*" 字符
            encodeURIComponent(('' + params[key]).replace(chr_filter, ''))
        )
    })
    const joinedQuery = query.join('&')
    const wbi_sign = md5(joinedQuery + mixin_key) // 计算 w_rid
    return joinedQuery + '&w_rid=' + wbi_sign
}

// 获取最新的 img_key 和 sub_key
export const getWbiKeys = async () => {
    const resp = await bfetch(
        'https://api.bilibili.com/x/web-interface/nav',
    ),
        json_content = await resp.json(),
        img_url = json_content.data.wbi_img.img_url,
        sub_url = json_content.data.wbi_img.sub_url
    logger.debug(json_content);
    wbiStore.setState({
        img_key: img_url.substring(img_url.lastIndexOf('/') + 1, img_url.length).split('.')[0],
        sub_key: sub_url.substring(sub_url.lastIndexOf('/') + 1, sub_url.length).split('.')[0]
    })
}

/** 
 * check if a query failed due to wbi expired.
 * seems like its either failing with code -799 or code -403. ill just 
 * do code === 0 is sucessful. 
*/
const wbiNeedRefresh = async (json: any) => {
  if (json.code === 0) {
    return true;
  }
  await getWbiKeys();
  return false;
}

/**
 * a wrapper for calling wbi APIs. 
 */

const wbiRefreshWrapper: any = async (
    queryFunc: () => Promise<Response>,
    refreshed = false) => {
    const res = await queryFunc(),
    json = await res.json();
    if (await wbiNeedRefresh(json) && !refreshed) {
        return wbiRefreshWrapper(queryFunc, true);
    } 
    return json;
} 

export const wbiQuery = async (url: string, URLParams: any, fetchParams?: any) => {
    return wbiRefreshWrapper(() => bfetch(`${url}?${encWbi(URLParams)}`, fetchParams));
}
getWbiKeys();