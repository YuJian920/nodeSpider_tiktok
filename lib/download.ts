import download from "download";
import filenamify from "filenamify";
import { ensureDir, readdir } from "fs-extra";
import path from "path";
import { SpiderQueue } from "../type";

const downloadDir = "download/";

export const saveVideo = async (videoQueue: SpiderQueue[], dir: string) => {
  console.log("开始下载 ===>", dir);
  const targetDir = path.resolve(process.cwd(), downloadDir, filenamify(dir));
  let _downloadCount = 0;

  try {
    await ensureDir(targetDir);
    const alreadyPath = await readdir(targetDir);

    for (const item of videoQueue) {
      try {
        console.log("正在下载 ===>", ++_downloadCount, "项");
        const targetFileName = `${item.id}-${filenamify(item.desc)}.mp4`;
        // 跳过下载已存在文件
        if (alreadyPath.includes(targetFileName)) {
          console.log("跳过已存在 ===>", item.id);
          continue;
        }
        await download(item.url, targetDir, { filename: targetFileName });
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
