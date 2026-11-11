# 素材与隐私说明

视觉来自用户提供的 Figma，人物透明 GIF 由用户提供。此仓库用于交互原型演示，没有为图片、品牌、人物或字体另行授予版权许可；后续商业复用、分发请按原始来源授权处理。

- `assets/v5/`：当前设计版本的图像与 SVG。为保持图层对应关系保留导出命名。
- `assets/character/welcome-source.gif`：原始450×600透明动画，193帧、约8.04秒，无限循环；页面以固定上半身窗口显示。
- `assets/noto-*.woff2`：Noto Sans SC 的页面文字子集；Noto 字体遵循其 SIL Open Font License。参考 https://github.com/notofonts/noto-cjk 。

本地演示不采集用户信息；心情笔记与演示消息只写入当前浏览器 localStorage。仓库不包含原始桌面路径、账户密钥、私人录屏或求职资料。

## 网页加载版本

源 PNG 和 GIF 均保留不动。`assets/web/` 为相同图像的 WebP 网页版本，共约455KB；原PNG约17.5MB。`welcome-web.webm` 为原透明动画的网页传输版本，约864KB，时长8.042秒，保留450×600画布与透明通道。Chrome优先播放WebM，不支持的浏览器回退原GIF；页面仍采用同一裁切、亮度和层级。
