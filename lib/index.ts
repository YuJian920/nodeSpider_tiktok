import { limit, type, user } from "../config/config.json";
import { SpiderQueue } from "../type";
import { getUserInfo, getUserSecId, getUserVideo } from "./api";
import { saveVideo } from "./download";

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
  const userInfo = await getUserInfo(userSecId);

  let spiderQueue: SpiderQueue[] = [];
  let _has_more = true;
  let _max_cursor = 0;
  let _pageCount = 0;

  // 循环分页
  while (_has_more) {
    console.log("获取内容 ===>", ++_pageCount, "页");
    const { list, max_cursor, has_more } = await getUserVideo(
      userSecId,
      _max_cursor,
      type
    );
    // 外部变量控制循环
    _has_more = has_more;
    _max_cursor = max_cursor;

    if (!list || list.length === 0) {
      _has_more = false;
      console.log("结束 ===> 列表为空");
      break;
    }

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
        url: item.video.play_addr.url_list[0],
      };
      spiderQueue.push(videoInfo);
    }
  }

  return { spiderQueue, userInfo };
};

(async () => {
  const { spiderQueue, userInfo } = await loadQueue(user, type, limit);
  await saveVideo(spiderQueue, userInfo.nickname + "_" + type);
})();
