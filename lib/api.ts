import fetch from "node-fetch";
import qs from "qs";
import { TiktokUserLike } from "../type";
import { getCookies, getTiktokSecId, getXBogus } from "../utils";
import { headerOption } from "../utils/config";

const postBaseUrl = "https://www.douyin.com/aweme/v1/web/aweme/post/?";
const likeBaseUrl = "https://www.douyin.com/aweme/v1/web/aweme/favorite/?";

/**
 * 基础请求封装
 * @param api
 * @param option
 * @returns
 */
const request = async (url: string, option = {}) => {
  return await fetch(url, {
    headers: headerOption,
    ...option,
  });
};

/**
 * 获取 Sec_Id
 * @param userUrl
 */
export const getUserSecId = async (userUrl: string) => {
  const response = await request(userUrl);
  const userSecId = getTiktokSecId(response.url);

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
  const result = await request(
    "https://ttwid.bytedance.com/ttwid/union/register/",
    {
      method: "POST",
      body: JSON.stringify(postBody),
    }
  );
  const ttwid = result.headers.get("set-cookie");

  return ttwid.split(";").map((item) => item.trim())[0];
};

/**
 * 拼接请求参数
 * @param sec_user_id
 * @param max_cursor
 * @returns
 */
const transformParams = (sec_user_id: string, max_cursor: number) => {
  const params = {
    sec_user_id,
    count: 35,
    max_cursor,
    aid: 1128,
    version_name: "23.5.0",
    device_platform: "android",
    os_version: "2333",
  };
  params["X-Bogus"] = getXBogus(qs.stringify(params));

  return qs.stringify(params);
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

    while (loopCount <= 50 && responseText === "") {
      if (loopCount > 0) console.log(`第${loopCount}次请求...`);
      loopCount += 1;
      const responsePending = await request(requestUrl + requestParams, {
        headers: { ...headerOption, cookie: cookies },
      });
      responseText = await responsePending.text();

      // 每尝试 10 此等待 2s
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
