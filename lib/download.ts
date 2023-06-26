import filenamify from "filenamify";
import { ensureDir } from "fs-extra";
import { resolve } from "node:path";
import download from "nodejs-file-downloader";
import { downloadDir } from "../config/config.json";
import { SpiderQueue } from "../type";
import { errQueueToJson, getDateTimeString, getFileSize, logError } from "../utils";
import { headerOption as headers } from "../utils/config";
import progressBar from "../utils/progressBar";

/**
 * 下载视频队列
 * @param videoQueue 下载队列
 * @param dir 下载目录
 */
export const downloadVideoQueue = async (videoQueue: SpiderQueue[], dir: string) => {
  let _downloadCount = 0;
  let hasErr = false;

  for (const item of videoQueue) {
    try {
      await downloadVideoSingle(item, dir, ++_downloadCount);
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
 * 下载单个视频
 * @param item 下载项
 * @param dir 下载目录
 */
export const downloadVideoSingle = async (item: SpiderQueue, dir: string, index?: number) => {
  console.log(`开始下载 ===> ${item.id}`);
  const directory = resolve(process.cwd(), downloadDir, filenamify(dir));
  const fileName = `${item.id}-${filenamify(item.desc)}.mp4`;
  await ensureDir(directory).catch((error) => console.log("downloadVideoQueue: 下载目录创建失败"));

  let totalSize = "0";
  let progress = null;

  let downloadHelper = new download({
    url: item.url,
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
      progress = new progressBar(`${index ? `${index}: ` : ""}${item.id} 下载进度`, 50, totalSize);
      progress.render({ completed: percentage, total: 100 });
    },
  });

  await downloadHelper.download();
  downloadHelper = null;
  progress = null;
};
