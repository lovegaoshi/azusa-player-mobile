---
sidebar_position: 5
---

# Add New Fetchers

APM uses a modularized approach to organize media fetchers, similar to [muisicfree](https://github.com/maotoumao/MusicFree). While there are potentials to make APM supporting extra fetchers via user-defined plugins, I don't have time or interest to maintain any plain string evaled into commonjs functions and am currently sticking with hardcoded fetchers. However if you would like to add your own fetchers in your compiled APM, read along!

## APM's Fetcher Structure

All of APM's fetchers are in the `src/utils/mediafetch` directory. Each site's fetcher is a single ts file, and exports a dict with fields: `regexSearchMatch`, `regexFetch`, `regexResolveURLMatch`, `resolveURL`, `refreshSong`. The fetcher itself is loaded at `searchBiliURLs` in `src/utils/BiliSearch.ts` (where search via the top search bar happens, using `regexSearchMatch`, `regexFetch`), and `fetchPlayUrlPromise` in `src/utils/Data.js` (where resolving the song's streamable URL happens, using `regexResolveURLMatch`, `resolveURL`).

In `searchBiliURLs`, user input is regexed against `regexSearchMatch`. If there is a match, `regexFetch` is called with the extracted match to return songs.

In `fetchPlayUrlPromise`, song id is regexed against `regexResolveURLMatch`. If there is a match, `resolveURL` is called with the song object to return the resolved streamable URL.

`refreshSong` is a function work in progress.

### `regexSearchMatch`

Based on needs, this regexp may include extracted portions, such as extracting a single field using `/(BV[^/?]+)/`, extracting two fields using `/space.bilibili\.com\/(\d+)\/channel\/collectiondetail\?sid=(\d+)/`, or not extracting anything at all, merely matching a string using `/steria.vplayer.tk/`.

It accepts up to four parameters:

`reExtracted,` the regexp extracted object;

`progressEmitter,` emits the current progress. input is a number from 0 - 100.

`favList,` a list of `Song.bvid`s to prevent duplicates getting re-parsed by regexFetch.

`useBiliTag,` a special tag for bilibili fetches.

### `regexFetch`

`regexFetch` is simply a wrapper of two functions: `songFetch` and `paginatedFetch`. `paginatedFetch` takes the user input and uses API to return `VideoInfo` objects, and `songFetch` turns the `VideoInfo` objects into `Song` objects. The seemlying redundant `VideoInfo` object is specifically due to Bilibili having video inside of video disguising as a video list, and is redundant anywhere else. Using Bilibili channel (`bilichannel.ts`) as an example:

`regexFetch` parses user input and returns the channel's `mid`;

`paginatedFetch` uses the bilibili channel API and `mid` to loop through all pages of the user's bilibili channel, and return a list of `VideoInfo`s, one for each BVID;

Because one BVID may have multiple sub videos, each `VideoInfo` is extracted by `songFetch` to return `Song`s.

Alternatively one may simply ignore these two fetch functions, as long as regexFetch returns an array of NoxMedia.Song would be fine.

#### `paginatedFetch`

There are two common functions written for `paginatedFetch` in `paginatedfetch.ts`, `fetchPaginatedAPI` and `fetchAwaitPaginatedAPI`. `fetchAwaitPaginatedAPI` stops the first time a duplicate is found in `favList`, while `fetchPaginatedAPI` resolves all pages regardless. Both have the same props, where:

`url,` the API url. this must have a `pn` to be replaced by a page number, starting from 1.

`getMediaCount,` the total number of songs to be fetched from the API. this can be a hardcoded number to limit the total number of fetched songs, or more commonly a field from the response.

`getPageSize,` the total number of songs in a single page of API. this together with `getMediaCount,` determines how many pages to be fetched.

`getItems,` parses the response json to get each item from the response.

`resolveBiliBVID = async () => [],` parses the item from `getItems,` into `VideoInfo`.

`progressEmitter = () => undefined,` emits the current progress. input is a number from 0 - 100.

`favList = [],` a list of `Song.bvid`s to prevent duplicates getting re-parsed by regexFetch.

`limiter = biliApiLimiter,` Bottleneck throttler for each page request. biliApiLimiter is a min 200ms, max concurrent 5 throttler.

`params = undefined,` : custom headers for `fetch`.

`jsonify = res => res.json(),` a custom command to parse response json.

`getBVID = (val: any) => val.bvid,` parses an item from `getItems,` to a `bvid` to be compared in `favList` for duplicates.

`fetcher = bfetch,` the fetch method to be used. typically is just `fetch`, or your wrapper of `fetch` that adds extra headers like UA and referrer, as in my `bfetch`.

#### `songFetch`

For most sites this is simply a re-cast of `VideoInfo` into `Song`. see `steriatk.ts`'s `songFetch`.

Note when casting to a `Song` object, `cid` must be always unique; `bvid` is used for de-duplication purposes. `regexResolveURLMatch` will match for `cid`. My way of managing this is use a special prefix for `cid`. eg. in `steriatk.ts` all `cid` has a `steriatk-` prefix, and `regexResolveURLMatch` is `/^steriatk-/`.

### `regexResolveURLMatch`

see above.

### `resolveURL`

resolves the streamable URL when `regexResolveURLMatch` is matched. For personal websites like `steria.vplayer.tk` its a static URL, and one can either put that URL in bvid or cid for simple parsing; for bigger streaming platforms like bilibili or youtube this needs to be a customized resolver that uses other APIs, similar to `fetchVideoPlayUrlPromise` in `Data.js`.
