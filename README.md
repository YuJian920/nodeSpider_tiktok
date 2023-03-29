# nodespider_tiktok

一个用 Node.js 写的抖音用户发布/喜欢列表爬虫

批量下载去水印的用户发布作品或喜欢列表

## 使用方法

在使用之前请先修改 config/config.json 配置文件

```js
"user": ""                  // 用户链接，目前只支持短链
"type": "post" | "like"     // post-用户发布 & like-用户喜欢
"limit": 0                  // 下载数限制 0 表示无限制 下载所有视频
"odin_tt": ""               // cookies 中的 odin_tt，如果工作正常则不需要修改
"passport_csrf_token": ""   // cookies 中的 passport_csrf_token，如果工作正常则不需要修改
```

用户喜欢列表和发布作品只能下载公开状态的列表

```
// 安装依赖
pnpm install

// 启动爬虫
pnpm run start
```

现阶段还没有实现自动用用户名字命名下载文件夹，如果你需要下载多个用户的喜欢列表并存在分类的需求，可能需要给已存在的文件夹手动重命名

## 感谢
默认的 odin_tt、passport_csrf_token 和 X-Bogus 的获取算法均来自 Johnserf-Seed/TikTokDownload 项目，非常感谢

[TiktokDownload](https://github.com/Johnserf-Seed/TikTokDownload)