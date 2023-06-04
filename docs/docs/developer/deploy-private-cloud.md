---
sidebar_position: 4
---

# 部署私有云做歌单云备份

我提供了一个[简单的云文件服务器](https://github.com/lovegaoshi/fastapi-fileserv)供大家部署在云端，做歌单备份。需注意安卓禁止 http 明文传输，域名需要注册 SSL 安全证书使用 https 通信。有 flask 版本（可在华硕梅林路由器上安装），fastapi docker 版本，以及 vercel 版本。

## 用 vercel 部署

vercel 可以免费提供一个 https 认证的域名和数据库，非常方便。

1. 首先切换到[vercel 分支](https://github.com/lovegaoshi/fastapi-fileserv/tree/vercel)并 fork；

2. 在 vercel 下新建一个项目，并填入 fork 后的项目仓库；

3. 在 vercel 下申请一个 PostgreSQL 存储，并链接存储到第二步建立的 vercel 项目；

4. 在 postreSQL 存储内执行以下语句，建立表：

   `CREATE TABLE IF NOT EXISTS noxbackup (username TEXT PRIMARY KEY, data bytea);`

5. 在项目->设置->环境变量下，确保：

- `POSTGRES_URL` 等变量已经自动链接好；
- 新建 `POSTGRES_PORT` 为端口名；
- `USERID` 为你的私有 key（比如 lovegaoshi；可将多个 key 用逗号隔开，设置为多个 key）

6. 重新部署项目。

## 用 docker 部署

**这个方法需要有 SSL 证书的域名**

## 在路由器上部署
