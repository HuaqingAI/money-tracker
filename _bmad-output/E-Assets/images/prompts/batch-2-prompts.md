# 图像生成提示词库 (Image Generation Prompts)

**Batch 2: 品牌与角色 (Brand & Character)**
**风格定位**: 极简 3D 渲染 (Minimal 3D Render)
**主品牌色**: 了然绿 (#1A6B5A)

---

## 1. 锚点图 (Anchor): Splash Logo
**用途**: Welcome 页启动图标 (1:1)
**目标**: 确立整体 3D 材质风格（磨砂玻璃 + 金属质感），传递信任感。

**Midjourney / DALL-E Prompt:**
> A hyper-realistic 3D render of a minimalist finance app logo, an abstract smooth rounded shape representing clarity and growth, made of premium matte frosted glass and polished metal accents. The primary color is a deep trustworthy green (#1A6B5A). Studio lighting, soft shadows, clean white background, high-end product photography, soft global illumination, minimalist, clean, 8k resolution, octane render --ar 1:1 --stylize 250

**Negative Prompt:**
> text, letters, words, complex patterns, messy, dark background, low quality, noisy

---

## 2. AI 管家头像 (AI Avatar)
**用途**: AI Chat 聊天头像 (1:1)
**目标**: 采用与 Logo 一致的材质，但更拟人化、具有服务感，不能太像传统机器人。
**链式参考建议**: 若在 Midjourney 中使用，请加上图 1 的图片链接作为 reference (`--sref`)。

**Midjourney / DALL-E Prompt:**
> A hyper-realistic 3D render of a friendly, minimalist AI assistant avatar. An abstract, soft, glowing spherical shape with gentle curves, made of premium frosted glass emitting a soft trustworthy green (#1A6B5A) internal light. Hovering gracefully over a clean white pedestal. Studio lighting, soft shadows, high-end product photography style, clean, minimalist, no face, no eyes, purely abstract and elegant, 8k resolution, octane render --ar 1:1 --stylize 200

**Negative Prompt:**
> human face, robot eyes, mechanical, complex wiring, dark background, sharp edges, scary, uncanny valley

---

## 3. 高级订阅礼物 (Subscription Gift)
**用途**: Subscription 付费订阅页 (16:9)
**目标**: 将"付费功能"包装为一份精美的礼物，降低付费恐惧感。

**Midjourney / DALL-E Prompt:**
> A hyper-realistic 3D render of a luxurious, minimalist gift box. The box is made of premium matte paper in deep trustworthy green (#1A6B5A), wrapped with an elegant, subtly glowing silver ribbon. The box is slightly open, emitting a soft, warm, magical light from inside. Clean white background, studio lighting, soft shadows, premium product photography, luxurious, elegant, inviting, 8k resolution, octane render --ar 16:9 --stylize 300

**Negative Prompt:**
> messy, cheap, complex patterns, red ribbon, dark background, chaotic, text, realistic humans, realistic hands