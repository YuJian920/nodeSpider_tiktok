import { move, readdir, remove, stat } from "fs-extra";
import { extname, join, resolve } from "node:path";
import { convert2JPEG, checkFileType } from ".";

/**
 * 将 webp 转换为 jpeg
 * @param directory
 */
async function traverseDirectories(directory: string) {
  const files = await readdir(directory);

  for (const file of files) {
    const filePath = join(directory, file);
    const stats = await stat(filePath);
    if (stats.isDirectory()) await traverseDirectories(filePath);
    else if (extname(filePath) === ".webp") convert2JPEG(filePath, filePath.replace(".webp", ".jpg"));
  }
}

/**
 * 删除所有 Webp 文件
 * @param directory
 */
const deleteWebp = async (directory: string) => {
  const files = await readdir(directory);

  for (const file of files) {
    const filePath = join(directory, file);
    const stats = await stat(filePath);
    if (stats.isDirectory()) await deleteWebp(filePath);
    else if (extname(filePath) === ".webp") {
      await remove(filePath);
      console.log(`delete ${filePath}`);
    }
  }
};

/**
 * 删除所有空文件夹
 * @param directory
 * @returns
 */
const deleteEmptyDirectories = async (directory: string) => {
  const files = await readdir(directory);

  if (files.length === 0) {
    remove(directory);
    console.log(`Deleted empty directory: '${directory}'`);
    return;
  }

  for (const file of files) {
    const filePath = join(directory, file);
    const stats = await stat(filePath);
    if (stats.isDirectory()) deleteEmptyDirectories(filePath);
  }

  const remainingFiles = await readdir(directory);
  if (remainingFiles.length === 0) {
    remove(directory);
    console.log(`Deleted empty directory: '${directory}'`);
  }
};

/**
 * 检查文件是否未 MP4 格式
 * @param directory
 */
const checkFileTypeisMp4 = async (directory: string) => {
  const files = await readdir(directory);

  for (const file of files) {
    const filePath = join(directory, file);
    const stats = await stat(filePath);
    if (stats.isDirectory()) continue;

    const type = await checkFileType(filePath);
    if (type !== "mp4") {
      await move(filePath, resolve(directory, "NotMPEG", file));
      console.log(`Moved ${file}`);
    }
  }
};

// 运行脚本之前请明白你在做什么，对目录的操作可能导致文件丢失！
(async () => {
  const directory = resolve(__dirname, "../download/like_user1");
  // await traverseDirectories(directory);
  // await deleteWebp(directory);
  // await deleteEmptyDirectories(directory);
  // await checkFileTypeisMp4(directory);
})();
