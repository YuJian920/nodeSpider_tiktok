import filenamify from "filenamify";
import { ensureDir } from "fs-extra";
import { resolve } from "node:path";
import download from "nodejs-file-downloader";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { downloadDir, workerNum } from "../config/config.json";
import { DownloadCoreOption, SpiderQueue } from "../type";
import { errQueueToJson, getDateTimeString, getFileSize, logError } from "../utils";
import { headerOption as headers } from "../utils/config";
import cliProgress from "cli-progress";

/**
 * 下载视频队列
 * @param videoQueue 下载队列
 * @param dir 下载目录
 */
export const downloadVideoQueue = async (videoQueue: SpiderQueue[], dir: string) => {
  if (isMainThread) {
    const progressBar = new cliProgress.MultiBar(
      {
        fps: 30,
        hideCursor: null,
        stopOnComplete: true,
        clearOnComplete: true,
        linewrap: true,
        forceRedraw: true,
        format: "{id}: 下载进度 {bar} {percentage}% | Size: {totalSize} | ETA: {eta}s",
      },
      cliProgress.Presets.shades_grey
    );
    const progressDict = {};
    const workerData = [];
    const len = Math.ceil(videoQueue.length / workerNum);
    for (let i = 0; i < workerNum; i++) workerData.push(videoQueue.slice(i * len, (i + 1) * len));

    const workers = workerData.map(
      (data, index) => new Worker(__filename, { workerData: { videoQueue: data, dir, index } })
    );

    const promises = workers.map(
      (worker) =>
        new Promise((resolve, reject) => {
          worker.on("message", (msg) => {
            if (msg.type === "progress") {
              const { id, percentage, totalSize } = msg.message;
              if (!progressDict[id]) progressDict[id] = progressBar.create(100, 0);
              progressDict[id].update(Number(percentage), { id, totalSize });
            } else if (msg.type === "done") resolve(msg.hasErr);
          });
          worker.on("error", reject);
          worker.on("exit", (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
          });
        })
    );

    const results = await Promise.all(promises);
    // console.log("下载完成 任务结束");
    return results.some((result) => result === true);
  } else {
    let hasErr = false;
    for await (const [index, item] of workerData.videoQueue.entries()) {
      try {
        if (Array.isArray(item.url)) await downloadImageSingle(item, workerData.dir);
        else await downloadVideoSingle(item, workerData.dir);
      } catch (error) {
        hasErr = true;
        const errLogPath = resolve(process.cwd(), downloadDir, "logs");
        await logError(error, resolve(errLogPath, `${getDateTimeString()}.log`));
        await errQueueToJson(JSON.stringify(item.info), resolve(errLogPath, "errorQueue.json"));
        console.log("下载失败 ===>", item.id, "日志已保存");
        continue;
      }
    }
    parentPort.postMessage({ type: "done", hasErr });
  }
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
      parentPort.postMessage({ type: "progress", message: { id: option.id, percentage, totalSize } });
    },
  });
};

/**
 * 下载单个视频
 * @param item 下载项
 * @param dir 下载目录
 */
export const downloadVideoSingle = async (item: SpiderQueue, dir: string) => {
  const directory = resolve(process.cwd(), downloadDir, filenamify(dir));
  const fileName = `${item.id}-${filenamify(item.desc)}.mp4`;
  await ensureDir(directory).catch((error) => console.log("downloadVideoQueue: 下载目录创建失败"));

  let downloadHelper = downloadCore(item.url as string, directory, fileName, { id: item.id });
  await downloadHelper.download();
};

/**
 * 下载单个图片
 * @param item 下载项
 * @param dir 下载目录
 */
export const downloadImageSingle = async (item: SpiderQueue, dir: string) => {
  const directory = resolve(process.cwd(), downloadDir, filenamify(dir), `${item.id}-${item.desc}`);
  const extNameRegex = /\jpg|jpeg|png|webp/i;
  await ensureDir(directory).catch(() => console.log("downloadVideoQueue: 下载目录创建失败"));

  for await (const [entriesIndex, urlItem] of (item.url as string[]).entries()) {
    const extName = extNameRegex.exec(urlItem)[0];
    const fileName = `${item.id}_${entriesIndex}.${extName}`;

    let downloadHelper = downloadCore(urlItem, directory, fileName, { id: item.id });
    await downloadHelper.download();
  }
};

if (!isMainThread) downloadVideoQueue([], "");
