# nodespider_tiktok

一个用 Node.js 写的批量去水印下载抖音用户发布/喜欢列表视频的爬虫

## Features

1. 支持批量下载指定数量的用户发布/喜欢视频和图片
2. 支持自动重试下载失败的文件
3. 支持自动跳过已存在的文件
4. 支持流式下载，不会占用过多内存
5. 支持自动保存错误日志

## 使用方法

在使用之前请先修改 config/config.json 配置文件

```js
"userList": [                   // 可以下载多个用户的列表
  {
    "user": ""                  // 用户链接，支持长链和短链
    "type": "post" | "like"     // post-用户发布 | like-用户喜欢
    "limit": 0                  // 下载数限制 0 表示无限制 下载所有视频
    "username": ""              // 下载的文件夹名字，如果不填则默认为下标
  }
]
"odin_tt": ""                   // cookies 中的 odin_tt
"passport_csrf_token": ""       // cookies 中的 passport_csrf_token
"sessionid": "",                // cookies 中的 sessionid
"max_retry": 50                 // 获取内容的最大重试次数
"autoRetryDownload": true       // 是否自动重试下载失败的文件
"downloadDir": "download/",     // 下载目录
```

用户喜欢列表和发布作品只能下载公开状态的列表

```
// clone repo to your directory
git clone https://github.com/YuJian920/nodeSpider_tiktok.git

//go into the folder
cd nodeSpider_tiktok

// 安装依赖
pnpm install

// 启动爬虫
pnpm run start
```

如果获取列表频繁出现失败，请修改 `config.js` 下的 `odin_tt`、`passport_csrf_token` 和 `sessionid` 字段

抖音下载的图片默认为 webp 格式，在 `utils/fileHelper.tsx` 中有一些工具函数可以对图片格式进行转换，默认为无压缩转换，可以根据需要自行修改转换参数。你可以使用 `npm run helper` 来运行这些函数。

在之前的版本中，对于喜欢或者发布列表中的图片类型，下载后可能会出现格式错误的问题，`utils/fileHelper.tsx` 提供了一个检查文件是否为 mp4 格式的工具函数。

## 可能存在的一些问题

图片转换需要用到 sharp 库，package.json 中默认安装的是和平台绑定的版本，如果你使用 Linux Mac 或者其他操作系统，可能会出现安装依赖或者脚本运行错误的问题，请修改 package.json 中的 sharp 版本或者直接删除它。
脚本的主要功能：批量下载，是不需要 sharp 库的。

## 感谢

X-Bogus 的获取算法来自 Johnserf-Seed/TikTokDownload 项目，非常感谢

[Johnserf-Seed/TiktokDownload](https://github.com/Johnserf-Seed/TikTokDownload)

[ibrod83/nodejs-file-downloader](https://github.com/ibrod83/nodejs-file-downloader)
