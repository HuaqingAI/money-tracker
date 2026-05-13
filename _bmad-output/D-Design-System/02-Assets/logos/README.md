# Brand Logos

了然品牌标志资产存放目录。此目录是设计系统内 logo 的 source of truth，替代旧的 `design-artifacts/D-Design-System/` 临时目录。

## Assets

| Asset | Format | Size | Purpose |
|-------|--------|------|---------|
| `app-logo-house-receipt.svg` | SVG | 1024x1024 | App logo primary source, onboarding brand mark, app icon export source |

## Usage Rules

- 优先使用 SVG 源文件生成 PNG/WebP 等运行时资产。
- App icon、启动页、Welcome/Onboarding 的品牌标志应从此源文件导出，避免多处手动维护。
- 小尺寸展示低于 40pt 时，应测试 receipt line、scan frame、AI sparkle 的可辨识度。
- 无障碍文本使用：`了然应用图标`。

