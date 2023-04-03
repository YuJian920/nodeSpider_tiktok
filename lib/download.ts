import filenamify from "filenamify";
import { ensureDir } from "fs-extra";
import { resolve } from "node:path";
import download from "nodejs-file-downloader";
import { downloadDir } from "../config/config.json";
import { SpiderQueue } from "../type";
import { getFileSize, transformDownloadUrl } from "../utils";
import { headerOption as headers } from "../utils/config";
import progressBar from "../utils/progressBar";

export const saveVideo = async (videoQueue: SpiderQueue[], dir: string) => {
  console.log("开始下载 ===>", dir);
  const directory = resolve(process.cwd(), downloadDir, filenamify(dir));
  let _downloadCount = 0;

  try {
    await ensureDir(directory);
    for (const item of videoQueue) {
      let totalSize = "0"
      try {
        console.log(`正在下载 ===> ${++_downloadCount}项${_downloadCount === 1 ? "" : "\n"}`);
        const fileName = `${item.id}-${filenamify(item.desc)}.mp4`;
        let progress = null;
        let downloadHelper = new download({
          url: transformDownloadUrl(item.url),
          directory,
          fileName,
          headers,
          skipExistingFileName: true,
          onResponse: (response) => {
            totalSize = getFileSize(response.headers["content-length"]);
            return true;
          },
          onProgress: (percentage) => {
            progress = new progressBar("下载进度", 50, totalSize);
            progress.render({ completed: percentage, total: 100 });
          },
          // onBeforeSave: (deducedName) => {
          //   const fileExt = extname(deducedName);
          //   if (fileExt) return `${item.id}-${filenamify(item.desc)}${fileExt}`;
          //   return deducedName;
          // },
        });

        await downloadHelper.download();
        downloadHelper = null;
      } catch (error) {
        console.log("下载失败 ===>", item.id);
        continue;
      }
    }
    console.log("下载完成 任务结束");
  } catch (error) {
    console.log("saveVideo: 下载目录创建失败");
  }
};
