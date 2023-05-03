import { getXB } from "./X-Bogus";
import { HDDownloadUrl } from "./config";
import { stringify } from "qs";

/**
 * 从 URL 中拆出 Sec_id
 * @param userUrl
 * @returns
 */
export const getTiktokSecId = (userUrl: string) => {
  const reg = /(?<=user\/)[^?]+/g;
  const result = userUrl.match(reg);
  if (result) return result[0];
  return null;
};

/**
 * 随机生成 107 位字符串
 * @param length
 * @returns
 */
export const generateRandomString = (length = 107) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/**
 * 获取 Cookies
 * @param getTtwidFn
 * @returns
 */
export const getCookies = async (
  getTtwidFn,
  odin_tt: string,
  passport_csrf_token: string
) => {
  const ttwid = await getTtwidFn();
  const cookies = [
    `msToken=${generateRandomString()}`,
    ttwid,
    `odin_tt=${odin_tt}`,
    `passport_csrf_token=${passport_csrf_token}`,
  ].join(";");

  return cookies;
};

/**
 * 拼接请求参数
 * @param sec_user_id
 * @param max_cursor
 * @returns
 */
export const transformParams = (sec_user_id: string, max_cursor: number) => {
  const params = {
    sec_user_id,
    count: 35,
    max_cursor,
    aid: 1128,
    version_name: "23.5.0",
    device_platform: "android",
    os_version: "2333",
  };
  params["X-Bogus"] = getXB(stringify(params));

  return stringify(params);
};

/**
 * 获取 1080P 下载地址
 * @param video_id
 * @returns
 */
export const transformDownloadUrl = (video_id: string) => {
  return `${HDDownloadUrl}${stringify({ video_id, radio: "1080p", line: 0 })}`;
};

export const getFileSize = (contentLengthHeader: string) => {
  const contentLength = parseInt(contentLengthHeader, 10);
  const fileSize = contentLength / (1024 * 1024);
  return fileSize.toFixed(2);
};
