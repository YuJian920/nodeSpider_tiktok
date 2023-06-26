# nodespider_tiktok

一个用 Node.js 写的批量去水印下载抖音用户发布/喜欢列表视频的爬虫

## Features

1. 支持批量下载指定数量的用户发布/喜欢视频
2. 支持自动重试下载失败的文件
3. 支持自动跳过已存在的文件
4. 支持流式下载，不会占用过多内存
5. 支持自动保存错误日志

## 使用方法

在使用之前请先修改 config/config.json 配置文件

```js
"user": ""                  // 用户链接，支持长链和短链
"type": "post" | "like"     // post-用户发布 | like-用户喜欢
"limit": 0                  // 下载数限制 0 表示无限制 下载所有视频
"odin_tt": ""               // cookies 中的 odin_tt，如果工作正常则不需要修改
"passport_csrf_token": ""   // cookies 中的 passport_csrf_token，如果工作正常则不需要修改
"max_retry": 50             // 获取内容的最大重试次数
"autoRetryDownload": true   // 是否自动重试下载失败的文件
```

用户喜欢列表和发布作品只能下载公开状态的列表

```
// 安装依赖
pnpm install

// 启动爬虫
pnpm run start
```

如果获取列表频繁出现失败，请修改 config.js 下的 odin_tt 和 passport_csrf_token 字段

现阶段还没有实现自动用用户名字命名下载文件夹，如果你需要下载多个用户的喜欢列表并存在分类的需求，可能需要给已存在的文件夹手动重命名

目前仅支持视频内容的下载

## 感谢

默认的 odin_tt、passport_csrf_token 和 X-Bogus 的获取算法均来自 Johnserf-Seed/TikTokDownload 项目，非常感谢

[Johnserf-Seed/TiktokDownload](https://github.com/Johnserf-Seed/TikTokDownload)

[ibrod83/nodejs-file-downloader](https://github.com/ibrod83/nodejs-file-downloader)
