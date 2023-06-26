import { limit, type, user } from "../config/config.json";
import { SpiderQueue } from "../type";
import { getUserLikeVideo, getUserPostVideo, getUserSecId, reptyErrorQueue } from "./api";
import { downloadVideoQueue } from "./download";

/**
 * 主函数
 * @param user 用户 url
 * @param type 类型 喜欢 - like 或者 发布 - post
 * @param limit 数量限制
 * @returns
 */
const loadQueue = async (user: string, type: string, limit: number) => {
  console.log(`开始获取 ===> ${type === "like" ? "喜欢" : "发布"}列表`);

  const userSecId = await getUserSecId(user);

  let spiderQueue: SpiderQueue[] = [];
  let _has_more = true;
  let _max_cursor = 0;
  let _pageCount = 0;
  let _max_retry = 0;

  let getUserVideo: any = () => ({});
  if (type === "like") getUserVideo = getUserLikeVideo;
  if (type === "post") getUserVideo = getUserPostVideo;

  // 循环分页
  while (_has_more) {
    console.log("获取内容 ===>", ++_pageCount, "页");
    const { list, max_cursor, has_more } = await getUserVideo(userSecId, _max_cursor);

    // 错误重试
    if (!list || list.length === 0) {
      if (_max_retry <= 3) {
        _max_retry++;
        _pageCount--;
        console.log("获取内容重试 ===> 重试次数", _max_retry);
        continue;
      }

      _has_more = false;
      console.log("获取内容结束 ===> 列表为空");
      break;
    }

    // 外部变量控制循环
    _has_more = has_more;
    _max_cursor = max_cursor;

    // 限制检查， 超出限制中断循环删除多余项
    if (limit !== 0 && limit <= spiderQueue.length) {
      _has_more = false;
      spiderQueue = spiderQueue.slice(0, limit);
      break;
    }

    for (let item of list) {
      const videoInfo = {
        id: item.aweme_id,
        desc: item.desc,
        url: item.video?.bit_rate?.[0]?.play_addr?.url_list?.[0] ?? item.video?.play_addr?.url_list?.[0],
        info: item,
      };
      spiderQueue.push(videoInfo);
    }
  }
  console.log("内容获取完成 有效列表项", spiderQueue.length, "项");

  return { spiderQueue };
};

(async () => {
  const { spiderQueue } = await loadQueue(user, type, limit);
  const hasErr = await downloadVideoQueue(spiderQueue, type);

  await reptyErrorQueue(hasErr, type);
})();
