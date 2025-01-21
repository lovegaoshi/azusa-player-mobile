/**
     * 
        "sponsor": ["skip", "mute", "full"],
        "selfpromo": ["skip", "mute", "full"],
        "exclusive_access": ["full"],
        "interaction": ["skip", "mute"],
        "intro": ["skip", "mute"],
        "outro": ["skip", "mute"],
        "preview": ["skip", "mute"],
        "filler": ["skip", "mute"],
        "music_offtopic": ["skip"],
        "poi_highlight": ["poi"]
     */
export enum Category {
  Sponsor = 'sponsor',
  Selfpromo = 'selfpromo',
  ExclusiveAccess = 'exclusive_access',
  Interaction = 'interaction',
  Intro = 'intro',
  Outro = 'outro',
  Preview = 'preview',
  Filler = 'filler',
  MusicOfftopic = 'music_offtopic',
  PoiHighlight = 'poi_highlight',
}

export const CategoryList = [
  Category.Sponsor,
  Category.Selfpromo,
  Category.ExclusiveAccess,
  Category.Interaction,
  Category.Intro,
  Category.Outro,
  Category.Preview,
  Category.Filler,
  Category.MusicOfftopic,
  Category.PoiHighlight,
];

// I only care about skip. only will implement skip.
export enum ActionType {
  Skip = 'skip',
  Mute = 'mute',
  Full = 'full',
  Poi = 'poi',
}

/**
 * 
    {
        "cid": "27900117695",
        "category": "sponsor",
        "actionType": "skip",
        "segment": [
            420.314,
            459.445
        ],
        "UUID": "8b4a688a47d634da46b18807c8b3f6b60d93daa1900a4bc2105cbb5239b947e67",
        "videoDuration": 464.82,
        "locked": 0,
        "votes": 0,
        "description": ""
    }
 */

export interface SponsorBlockBili {
  cid: string;
  category: Category;
  actionType: ActionType;
  segment: [number, number];
  UUID: string;
  videoDuration: number;
  locked: number;
  votes: number;
  description: string;
}
