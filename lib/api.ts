import fetch from "node-fetch";
import qs from "qs";
import { TiktokUserInfo, TiktokUserLike } from "../type";
import { getTiktokSecId } from "../utils";
import { headerOption } from "../utils/config";

const baseUrl = "https://m.douyin.com/web/api/v2/";

/**
 * 基础请求封装
 * @param api
 * @param option
 * @returns
 */
const request = async (api: string, option: RequestInit = {}) => {
  return await fetch(baseUrl + api, { headers: headerOption, ...option });
};

/**
 * 获取 Sec_Id
 * @param userUrl
 */
export const getUserSecId = async (userUrl: string) => {
  const response = await fetch(userUrl, { headers: headerOption });
  const userSecId = getTiktokSecId(response.url);

  if (!userSecId) throw new Error("Sec_Id 获取失败");

  return userSecId;
};

/**
 * 获取用户信息
 * @param sec_uid
 */
export const getUserInfo = async (sec_uid: string) => {
  const userInfoApi = "user/info/?sec_uid=";

  const responsePending = await request(userInfoApi + sec_uid);
  const response = (await responsePending.json()) as TiktokUserInfo;

  return response.user_info;
};

/**
 * 获取用户喜欢
 * @param sec_uid
 * @param max_cursor
 */
export const getUserVideo = async (
  sec_uid: string,
  max_cursor: number,
  type: string
) => {
  const userLikeApi = `aweme/${type}?reflow_source=reflow_page&`;
  const params = { sec_uid, count: "31", max_cursor };

  const responsePending = await request(userLikeApi + qs.stringify(params));
  const response = (await responsePending.json()) as TiktokUserLike;

  if (response.status_code !== 0) throw new Error("列表获取失败");

  return {
    list: response.aweme_list,
    max_cursor: response.max_cursor,
    has_more: response.has_more,
  };
};
