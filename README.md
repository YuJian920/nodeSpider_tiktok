# nodespider_tiktok

一个用 Node.js 写的抖音用户发布/喜欢列表爬虫

批量下载去水印的用户发布作品或喜欢列表

## 使用方法

在使用之前请先修改 config/config.json 配置文件

```JSON
  "user": ""               # 用户链接，目前只支持短链
  "type": "post" | "like", # post-用户发布 & like-用户喜欢
  "limit": 0               # 下载数限制 0 表现无限制 下载所有视频
```

用户喜欢列表和发布作品只能下载公开状态的列表

```
// 安装依赖
pnpm install

// 启动爬虫
pnpm run start
```
