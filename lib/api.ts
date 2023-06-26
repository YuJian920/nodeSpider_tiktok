import { readJSON } from "fs-extra";
import fetch from "node-fetch";
import { resolve } from "path";
import { autoRetryDownload, downloadDir, max_retry } from "../config/config.json";
import { downloadVideoSingle } from "../lib/download";
import { TiktokUserLike } from "../type";
import { deleteErrQueue, getCookies, getTiktokSecId, transformDownloadUrl, transformParams } from "../utils";
import { headerOption, likeBaseUrl, postBaseUrl } from "../utils/config";

/**
 * 基础请求封装
 * @param api
 * @param option
 * @returns
 */
const request = async (url: string, option = {}) => {
  return await fetch(url, { headers: headerOption, ...option });
};

/**
 * 获取 Sec_Id
 * @param userUrl
 */
export const getUserSecId = async (userUrl: string) => {
  let userSecId = "";
  const urlRegex = /www\.iesdouyin\.com\/share\/user\//;

  if (urlRegex.test(userUrl)) {
    // 表示长链
    userSecId = userUrl;
  } else {
    // 表示短链
    const response = await request(userUrl);
    userSecId = response.url;
  }

  userSecId = getTiktokSecId(userSecId);

  if (!userSecId) throw new Error("Sec_Id 获取失败");
  return userSecId;
};

/**
 * 获取 ttwid
 * @returns
 */
const getTTWid = async () => {
  const postBody = {
    region: "cn",
    aid: 1768,
    needFid: false,
    service: "www.ixigua.com",
    migrate_info: { ticket: "", source: "node" },
    cbUrlProtocol: "https",
    union: true,
  };
  const result = await request("https://ttwid.bytedance.com/ttwid/union/register/", {
    method: "POST",
    body: JSON.stringify(postBody),
  });
  const ttwid = result.headers.get("set-cookie");

  return ttwid.split(";").map((item) => item.trim())[0];
};

/**
 * 生成获取函数
 * @param type
 * @returns
 */
const getUserVideo = (type: string) => {
  let requestUrl = "";
  if (type === "post") requestUrl = postBaseUrl;
  if (type === "like") requestUrl = likeBaseUrl;

  return async (sec_uid: string, max_cursor: number) => {
    let requestParams = transformParams(sec_uid, max_cursor);
    let cookies = await getCookies(getTTWid);
    let loopCount = 0;
    let responseText = "";

    while (loopCount <= max_retry && !responseText) {
      if (loopCount > 0) console.log(`第 ${loopCount}/${max_retry} 次重复请求...`);
      loopCount += 1;
      const responsePending = await request(requestUrl + requestParams, {
        headers: { ...headerOption, cookie: cookies },
      });
      responseText = await responsePending.text();

      // 每尝试 10 次等待 2s
      if (loopCount % 10 === 0 && !responseText) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        requestParams = transformParams(sec_uid, max_cursor);
        cookies = await getCookies(getTTWid);
      }
    }

    if (!responseText) {
      console.log("超出最大请求次数，停止请求，下载已获取内容...");
      return { list: [], max_cursor: 0, has_more: false };
    }
    const response = JSON.parse(responseText) as TiktokUserLike;

    return {
      list: response.aweme_list,
      max_cursor: response.max_cursor,
      has_more: response.has_more,
    };
  };
};

export const getUserLikeVideo = getUserVideo("like");
export const getUserPostVideo = getUserVideo("post");

/**
 * 重试失败任务队列
 * @param repty 是否重试
 * @param downloadType 下载类型
 */
export const reptyErrorQueue = async (repty: boolean, downloadType: string) => {
  if (repty && autoRetryDownload) {
    console.log(`开始处理 ===> 失败任务队列`);
    const queueJSONPath = resolve(process.cwd(), downloadDir, "logs", "errorQueue.json");

    const errorQueue = await readJSON(queueJSONPath);
    for await (const queue of errorQueue) {
      const { play_addr: { url_list = [], uri = "" } = {}, bit_rate = [{}] } = queue.video || {};
      const downlinkList = [...(bit_rate[0]?.play_addr?.url_list || []), ...url_list, transformDownloadUrl(uri)];

      for (let index = 0; index < downlinkList.length; index++) {
        console.log(`正在尝试 ${queue.aweme_id} ===> 第${index + 1}次`);
        const downItem = { id: queue.aweme_id, desc: queue.desc, url: downlinkList[index], info: {} };

        try {
          await downloadVideoSingle(downItem, downloadType);
          console.log(`尝试 ${queue.aweme_id} ===> 第${index + 1}次成功`);
          break;
        } catch (error) {
          if (index === downlinkList.length - 1) {
            console.log(`尝试 ${queue.aweme_id} ===> 第${index + 1}次失败，已达最大尝试次数，放弃下载`);
          } else console.log(`尝试 ${queue.aweme_id} ===> 第${index + 1}次失败`);
          continue;
        }
      }
    }

    await deleteErrQueue(queueJSONPath);
  }
};
