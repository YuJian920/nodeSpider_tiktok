import download from "download";
import filenamify from "filenamify";
import { createWriteStream, ensureDir } from "fs-extra";
import path from "path";
import { SpiderQueue } from "../type";

const downloadDir = "download/";

export const saveVideo = async (videoQueue: SpiderQueue[], dir: string) => {
  console.log("开始下载 ===>", dir);
  const targetDir = path.resolve(process.cwd(), downloadDir, filenamify(dir));

  try {
    await ensureDir(targetDir);
    for (const item of videoQueue) {
      const targetFileName = `${item.id}-${filenamify(item.desc)}.mp4`;
      download(item.url).pipe(
        createWriteStream(path.resolve(targetDir, targetFileName))
      );
    }
    console.log("下载完成 任务结束");
  } catch (error) {
    console.log("saveVideo: 出现错误");
  }
};
