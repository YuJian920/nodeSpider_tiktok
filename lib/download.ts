import filenamify from "filenamify";
import { ensureDir } from "fs-extra";
import { resolve } from "node:path";
import download from "nodejs-file-downloader";
import { downloadDir } from "../config/config.json";
import { DownloadCoreOption, SpiderQueue } from "../type";
import { errQueueToJson, getDateTimeString, getFileSize, logError } from "../utils";
import { headerOption as headers } from "../utils/config";
import progressBar from "../utils/progressBar";

/**
 * 下载视频队列
 * @param videoQueue 下载队列
 * @param dir 下载目录
 */
export const downloadVideoQueue = async (videoQueue: SpiderQueue[], dir: string) => {
  let hasErr = false;

  for await (const [index, item] of videoQueue.entries()) {
    try {
      if (Array.isArray(item.url)) await downloadImageSingle(item, dir, index);
      else await downloadVideoSingle(item, dir, index);
    } catch (error) {
      hasErr = true;
      const errLogPath = resolve(process.cwd(), downloadDir, "logs");
      await logError(error, resolve(errLogPath, `${getDateTimeString()}.log`));
      await errQueueToJson(JSON.stringify(item.info), resolve(errLogPath, "errorQueue.json"));
      console.log("下载失败 ===>", item.id, "日志已保存");
      continue;
    }
  }
  console.log("下载完成 任务结束");

  return hasErr;
};

/**
 * 下载核心
 * @param url 下载地址
 * @param directory 下载目录
 * @param fileName 下载文件名
 * @param option 下载选项
 * @returns
 */
const downloadCore = (url: string, directory: string, fileName: string, option: DownloadCoreOption) => {
  let totalSize = "0";
  let progress = null;
  const { index, id } = option;

  return new download({
    url,
    directory,
    fileName,
    headers,
    maxAttempts: 3,
    skipExistingFileName: true,
    onResponse: (response) => {
      totalSize = getFileSize(response.headers["content-length"]);
      return true;
    },
    onProgress: (percentage) => {
      progress = new progressBar(`${index}: ${id} 下载进度`, 50, totalSize);
      progress.render({ completed: percentage, total: 100 });
    },
  });
};

/**
 * 下载单个视频
 * @param item 下载项
 * @param dir 下载目录
 */
export const downloadVideoSingle = async (item: SpiderQueue, dir: string, index: number) => {
  console.log(`开始下载 ===> ${item.id}\n`);
  const directory = resolve(process.cwd(), downloadDir, filenamify(dir));
  const fileName = `${item.id}-${filenamify(item.desc)}.mp4`;
  await ensureDir(directory).catch((error) => console.log("downloadVideoQueue: 下载目录创建失败"));

  let downloadHelper = downloadCore(item.url as string, directory, fileName, { index, id: item.id });
  await downloadHelper.download();
};

/**
 * 下载单个图片
 * @param item 下载项
 * @param dir 下载目录
 */
export const downloadImageSingle = async (item: SpiderQueue, dir: string, index: number) => {
  console.log(`开始下载 ===> ${item.id}\n`);
  const directory = resolve(process.cwd(), downloadDir, filenamify(dir), `${item.id}-${item.desc}`);
  const extNameRegex = /\jpg|jpeg|png|webp/i;
  await ensureDir(directory).catch(() => console.log("downloadVideoQueue: 下载目录创建失败"));

  for await (const [entriesIndex, urlItem] of (item.url as string[]).entries()) {
    const extName = extNameRegex.exec(urlItem)[0];
    const fileName = `${item.id}_${entriesIndex}.${extName}`;

    let downloadHelper = downloadCore(urlItem, directory, fileName, { index, id: item.id });
    await downloadHelper.download();
  }
};
