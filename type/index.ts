export interface TiktokUserLike {
  status_code: number;
  aweme_list: TiktokUserLikeList[];
  max_cursor: number;
  has_more: boolean;
}

export interface TiktokUserLikeList {
  aweme_type: number;
  aweme_id: string;
  desc: string;
  video: TiktokUserLikeVideo;
  images: TiktokUserLikeImage[];
}

export interface TiktokUserLikeVideo extends TiktokUserLikeVideoAddr {
  bit_rate?: TiktokUserLikeVideoAddr;
}

interface TiktokUserLikeVideoAddr {
  play_addr?: { url_list?: string[] };
}

interface TiktokUserLikeImage {
  url_list: string[];
  download_url_list: string[];
}

export interface SpiderQueue {
  id: string;
  desc: string;
  url: string | string[];
  info: any;
}

export interface DownloadCoreOption {
  id: string;
}
