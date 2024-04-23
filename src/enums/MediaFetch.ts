export enum Source {
  biliaudio = 'biliaudio',
  bilivideo = 'bilivideo',
  steriatk = 'steriatk',
  ytbvideo = 'ytbvideo',
  biliBangumi = 'biliBangumi',
  biliLive = 'bililive',
  local = 'local',
  rawhttp = 'rawhttp',
}

// https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/video/video_zone.md#%E8%A7%86%E9%A2%91%E5%88%86%E5%8C%BA%E4%B8%80%E8%A7%88
/** 
音乐(主分区)	music	3		/v/music
原创音乐	original	28	原创歌曲及纯音乐，包括改编、重编曲及remix	/v/music/original
翻唱	cover	31	对曲目的人声再演绎视频	/v/music/cover
VOCALOID·UTAU	vocaloid	30	以VOCALOID等歌声合成引擎为基础，运用各类音源进行的创作	/v/music/vocaloid
演奏	perform	59	乐器和非传统乐器器材的演奏作品。	/v/music/perform
MV	mv	193	为音乐作品配合拍摄或制作的音乐录影带（Music Video），以及自制拍摄、剪辑、翻拍MV	/v/music/mv
音乐现场	live	29	音乐表演的实况视频，包括官方/个人拍摄的综艺节目、音乐剧、音乐节、演唱会等	/v/music/live
音乐综合	other	130	所有无法被收纳到其他音乐二级分区的音乐类视频	/v/music/other
乐评盘点	commentary	243	音乐类新闻、盘点、点评、reaction、榜单、采访、幕后故事、唱片开箱等	/v/music/commentary
音乐教学	tutorial	244	以音乐教学为目的的内容	/v/music/tutorial
电音(已下线)	electronic	194	以电子合成器、音乐软体等产生的电子声响制作的音乐	/v/music/electronic
*/
export const BiliMusicTid = [28, 31, 59, 193]; // , 29
