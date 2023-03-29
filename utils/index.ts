import { getXB } from './X-Bogus';
import { odin_tt, passport_csrf_token } from "../config/config.json";

/**
 * 从 URL 中拆出 Sec_id
 * @param userUrl
 * @returns
 */
export const getTiktokSecId = (userUrl: string) => {
  const reg = /(?<=user\/).*(?=\?)/g;
  const result = userUrl.match(reg);
  if (result) return result[0];
  return null;
};

/**
 * 获取 X-Bogus
 * @param params 
 * @returns 
 */
export const getXBogus = (params: string) => {
  return getXB(params);
}

/**
 * 随机生成 107 位字符串
 * @param length 
 * @returns 
 */
export const generateRandomString = (length = 107) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * 获取 Cookies
 * @param getTtwidFn 
 * @returns 
 */
export const getCookies = async (getTtwidFn) => {
  const ttwid = await getTtwidFn()
  const cookies = [
    `msToken=${generateRandomString()}`,
    ttwid,
    `odin_tt=${odin_tt}`,
    `passport_csrf_token=${passport_csrf_token}`
  ].join(";")

  return cookies
}