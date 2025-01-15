import Icons from '@components/playlist/BiliSearch/Icons';

export enum Site {
  Bilibili = 'bilibili',
  YTM = 'ytm',
  YTMChart = 'ytmchart',
}

export const Sites = [Site.Bilibili, Site.YTM, Site.YTMChart];

export const LoginSites = [Site.Bilibili, Site.YTM];

export const SiteIcon = (site: Site, iconSize: number) => {
  switch (site) {
    case Site.Bilibili:
      return () => Icons.BILIBILI(iconSize);
    case Site.YTM:
      return () => Icons.YOUTUBEM(iconSize);
    case Site.YTMChart:
      return 'chart-line';
  }
};
