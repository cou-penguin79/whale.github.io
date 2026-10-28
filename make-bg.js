/**
 * 生成站点背景图（参考 blog.g3ng4r.top 的 #web_bg 背景）
 *
 * 参考站用的是一张深色科技感纹理图。我们没有素材，
 * 就用大肥鱼的图片做一张深海蓝调、压暗、加网格纹理的背景，
 * 让内容区的文字仍然清晰可读。
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'source', 'img');
const OUT = path.join(SRC, 'background.jpg');

console.log('提示：背景图需要从原图裁剪 + 调色，这里生成 SVG 版本再转存。');

// 生成 SVG：深海蓝渐变 + 细网格 + 光斑
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#070c18"/>
      <stop offset="45%" stop-color="#0b1224"/>
      <stop offset="100%" stop-color="#0e1a33"/>
    </linearGradient>
    <radialGradient id="spot1" cx="20%" cy="25%" r="45%">
      <stop offset="0%" stop-color="#2f6ea8" stop-opacity=".30"/>
      <stop offset="100%" stop-color="#2f6ea8" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="spot2" cx="82%" cy="72%" r="48%">
      <stop offset="0%" stop-color="#1d5f7a" stop-opacity=".26"/>
      <stop offset="100%" stop-color="#1d5f7a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="spot3" cx="55%" cy="8%" r="38%">
      <stop offset="0%" stop-color="#4a3f7a" stop-opacity=".22"/>
      <stop offset="100%" stop-color="#4a3f7a" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M64 0 L0 0 0 64" fill="none" stroke="#4d8fd6" stroke-width="1" stroke-opacity=".07"/>
    </pattern>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.1" fill="#7fc4ff" fill-opacity=".10"/>
    </pattern>
  </defs>

  <rect width="1920" height="1080" fill="url(#base)"/>
  <rect width="1920" height="1080" fill="url(#grid)"/>
  <rect width="1920" height="1080" fill="url(#dots)"/>
  <rect width="1920" height="1080" fill="url(#spot1)"/>
  <rect width="1920" height="1080" fill="url(#spot2)"/>
  <rect width="1920" height="1080" fill="url(#spot3)"/>

  <!-- 几条流动的水波线，呼应"深海" -->
  <g fill="none" stroke="#4d8fd6" stroke-opacity=".10" stroke-width="2">
    <path d="M-100 300 C200 220 400 380 700 300 C1000 220 1200 380 1500 300 C1700 245 1850 330 2020 285"/>
    <path d="M-100 560 C220 480 420 640 720 560 C1020 480 1220 640 1520 560 C1720 505 1870 590 2020 545"/>
    <path d="M-100 820 C240 740 440 900 740 820 C1040 740 1240 900 1540 820 C1740 765 1890 850 2020 805"/>
  </g>

  <!-- 零星泡泡 -->
  <g fill="#8fd3f4" fill-opacity=".12">
    <circle cx="180" cy="180" r="9"/>
    <circle cx="320" cy="420" r="5"/>
    <circle cx="1640" cy="260" r="7"/>
    <circle cx="1760" cy="620" r="11"/>
    <circle cx="1480" cy="900" r="6"/>
    <circle cx="520" cy="960" r="8"/>
    <circle cx="240" cy="720" r="4"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(SRC, 'background.svg'), svg, 'utf8');
console.log('  ✓ source/img/background.svg 已生成');
