import filenamify from "filenamify";
import { ensureDir } from "fs-extra";
import { resolve } from "node:path";
import download from "nodejs-file-downloader";
import { downloadDir } from "../config/config.json";
import { SpiderQueue } from "../type";
import { getDateTimeString, logError, errQueueToJson, getFileSize } from "../utils";
import { headerOption as headers } from "../utils/config";
import progressBar from "../utils/progressBar";

/**
 * 下载视频队列
 * @param videoQueue 下载队列
 * @param dir 下载目录
 */
export const downloadVideoQueue = async (videoQueue: SpiderQueue[], dir: string) => {
  console.log("开始下载 ===>", dir);
  const directory = resolve(process.cwd(), downloadDir, filenamify(dir));
  let _downloadCount = 0;

  await ensureDir(directory).catch((error) => console.log("downloadVideoQueue: 下载目录创建失败"));
  for (const item of videoQueue) {
    let totalSize = "0";
    try {
      console.log(`正在下载 ===> ${++_downloadCount}项${_downloadCount === 1 ? "" : "\n"}`);
      const fileName = `${item.id}-${filenamify(item.desc)}.mp4`;
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
          progress = new progressBar("下载进度", 50, totalSize);
          progress.render({ completed: percentage, total: 100 });
        },
      });

      await downloadHelper.download();
      downloadHelper = null;
    } catch (error) {
      const errLogPath = resolve(process.cwd(), downloadDir, "logs");
      await logError(error, resolve(errLogPath, `${getDateTimeString()}.log`));
      await errQueueToJson(JSON.stringify(item.info), resolve(errLogPath, `errorQueue.json`));
      console.log("下载失败 ===>", item.id, "日志已保存");
      continue;
    }
  }
  console.log("下载完成 任务结束");
};
