import fs from "fs-extra";
import path from "path";
import { stringify } from "qs";
import { odin_tt, passport_csrf_token } from "../config/config.json";
import { getXB } from "./X-Bogus";
import { HDDownloadUrl } from "./config";

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
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
export const getCookies = async (getTtwidFn) => {
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
    aid: 6383,
    cookie_enabled: true,
    platform: "PC",
    downlink: 10,
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

/**
 * 获取文件大小
 * @param contentLengthHeader Content-Length
 * @returns
 */
export const getFileSize = (contentLengthHeader: string) => {
  const contentLength = parseInt(contentLengthHeader, 10);
  const fileSize = contentLength / (1024 * 1024);
  return fileSize.toFixed(2);
};

/**
 * 记录错误日志
 * @param error 错误对象
 * @param logPath 日志文件路径
 */
export const logError = async (error: Error, logPath: string): Promise<void> => {
  const logDir = path.dirname(logPath);
  await fs.ensureDir(logDir); // 确保日志目录存在
  const logTime = new Date().toISOString();
  const logContent = `${logTime}: ${error.stack}\n`;
  await fs.appendFile(logPath, logContent); // 追加日志内容到日志文件
};

/**
 * 将错误信息写入 JSON 文件
 * @param data 错误 JSON
 * @param filePath JSON 文件路径
 */
export const errQueueToJson = async (data: string, filePath: string): Promise<void> => {
  const dirPath = path.dirname(filePath);
  await fs.ensureDir(dirPath);

  let json = [];
  try {
    json = await fs.readJSON(filePath);
  } catch (error) {
    json = [];
  }

  const newData = JSON.parse(data);
  if (Array.isArray(json)) json.push(newData);
  else Object.assign(json, newData);
  await fs.writeJSON(filePath, json, { spaces: 2 });
};

/**
 * 获取当前时间字符串
 * @returns {string} YYYY-MM-DD_HH-mm
 */
export const getDateTimeString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hour = now.getHours().toString().padStart(2, "0");
  const minute = now.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day}T${hour}${minute}`;
};
