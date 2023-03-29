import filenamify from "filenamify";
import { ensureDir } from "fs-extra";
import download from "nodejs-file-downloader";
import path from "path";
import { downloadDir } from "../config/config.json";
import { SpiderQueue } from "../type";
import progressBar from "../utils/progressBar";

export const saveVideo = async (videoQueue: SpiderQueue[], dir: string) => {
  console.log("开始下载 ===>", dir);
  const targetDir = path.resolve(process.cwd(), downloadDir, filenamify(dir));
  let _downloadCount = 0;

  try {
    await ensureDir(targetDir);
    for (const item of videoQueue) {
      try {
        console.log("正在下载 ===>", ++_downloadCount, "项", _downloadCount === 1 ? "" : "\n");
        const targetFileName = `${item.id}-${filenamify(item.desc)}.mp4`;
        let progress = null
        let downloadHelper = new download({
          url: item.url,
          directory: targetDir,
          fileName: targetFileName,
          skipExistingFileName: true,
          onProgress: (percentage) => {
            progress = new progressBar('下载进度', 50);
            progress.render({ completed: percentage, total: 100 });
          },
        });

        await downloadHelper.download();
        downloadHelper = null
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
