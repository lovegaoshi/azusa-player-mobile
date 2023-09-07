export default class VideoInfo {
  title: string;
  desc: string;
  videoCount: number;
  picSrc: string;
  uploader: { mid: number; name: string; face: string };
  pages: Array<{
    bvid: string;
    part: string;
    cid: number | string;
    duration: number;
  }>;
  bvid: string;
  duration: number;
  liveStatus?: number;

  constructor(
    title: string,
    desc: string,
    videoCount: number,
    picSrc: string,
    uploader: { mid: number; name: string; face: string },
    pages: Array<{
      bvid: string;
      part: string;
      cid: number | string;
      duration: number;
    }>,
    bvid: string,
    duration: number
  ) {
    this.title = title;
    this.desc = desc;
    this.videoCount = videoCount;
    this.picSrc = picSrc;
    this.uploader = uploader;
    this.pages = pages;
    this.bvid = bvid;
    this.duration = duration;
  }
}
