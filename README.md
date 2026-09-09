# dsh-pair-quick

在 dsh web 设置页增加「**快速配对**」页面：一键铸造远程访问配对链接并显示二维码。

依赖 [@linxin666/dsh-remote-web-ui](https://github.com/zhu1090093659/dsh-web) 的 `/api/pair/issue`（回环铸造端点）——需要该插件已安装并配置好隧道/LAN 访问。

## 安装

```sh
dsh plugin --profile web add dsh-pair-quick
```

重启 `dsh web`，打开 **设置 → 快速配对** → 点「获取配对链接」→ 手机扫码。

## 安全

- 铸造端点仅限回环（`127.0.0.1` / `::1`），局域网来源得到 403。
- 配对链接是一次性令牌（约 10 分钟有效）——同 remote-web-ui 的语义；不在此处持久化任何凭据。

## 结构

- `lib/index.js` — Host：注册 `POST /api/pair-quick/mint`（代调 pair issue + qrcode 出图）。
- `lib/client.js` — 浏览器端：设置页槽位 `settings.section`（id `pair-quick`）。
- `cordis.patch.yml` — 插入插件行。
