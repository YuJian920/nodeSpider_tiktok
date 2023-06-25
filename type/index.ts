export interface TiktokUserLike {
  status_code: number;
  aweme_list: TiktokUserLikeList[];
  max_cursor: number;
  has_more: boolean;
}

export interface TiktokUserLikeList {
  aweme_id: string;
  desc: string;
  video: TiktokUserLikeVideo;
}

export interface TiktokUserLikeVideo {
  play_addr: {
    url_list: string[];
  };
}

export interface SpiderQueue {
  id: string;
  desc: string;
  url: string;
  info: any;
}
