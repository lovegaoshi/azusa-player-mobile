/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace NoxMediaInfo {
  /**
   * this interface serves
   * http://api.bilibili.com/x/web-interface/view?bvid=BV1bv4y1p7K4
   */
  export interface VideoInfoJsonData {
    bvid: string;
    aid: number;
    videos: number;
    tid: number;
    tname: string;
    pic: string;
    title: string;
    owner: {
      mid: number;
      name: string;
      face: string;
    };
    pages: {
      cid: number;
      page: number;
      part: string;
      duration: number;
      [key: string]: any;
    }[];
    duration: number;
    [key: string]: any;
  }

  /**
   * this interface serves
   * https://www.bilibili.com/audio/music-service-c/web/song/info?sid=13598
   */
  export interface AudioInfoJsonData {
    title: string;
    id: number;
    duration: number;
    cover: string;
    bvid: string;
    aid: number;
    lyric: string;
    uname: string;
    author: string;
    uid: number;
    [key: string]: any;
  }
}
