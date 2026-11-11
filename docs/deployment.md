# 部署与分享

## 当前部署

已启用 GitHub Pages，发布源为 `main` 分支根目录，地址为 https://raddie-jean.github.io/MangoTV-AI-Assistant-/ 。后续提交到 main 自动更新。

## 重新配置 GitHub Pages

仓库为纯静态站点，不需要构建、API 密钥或后端。

1. 仓库所有者打开 [Settings → Pages](https://github.com/Raddie-Jean/MangoTV-AI-Assistant-/settings/pages)。
2. Source 选择 **Deploy from a branch**。
3. Branch 选择 **main**，目录选择 **/(root)**，保存。
4. 等待 Pages 部署完成，以设置页面显示的最新地址为准。

演示地址：`https://raddie-jean.github.io/MangoTV-AI-Assistant-/`。

- 主 Demo：站点根地址。
- 八状态入口与说明：`interaction-guide.html`。
- 已发送状态：`index.html?scene=sent`。
- 自动任务演示：`index.html?scene=outfit`。

未成功部署前，预计地址不代表已上线。若首次打开404，请检查 Pages 是否启用、分支是否为 main、目录是否为根目录，以及部署状态。

## 更新

修改源码后提交到 main，Pages 会重新部署。无需上传旧版压缩包、node_modules 或工作过程文件。保留文件名大小写和相对路径。

## 离线交付

下载仓库 ZIP，解压后打开 index.html；推荐启动 `node scripts/serve.cjs` 后访问本地地址。
