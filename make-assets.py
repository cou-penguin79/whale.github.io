"""
用大肥鱼的写真图生成站点所需的图片资源：
  - avatar.jpg     : 圆形头像（裁深蓝头发那张的脸部）
  - top_img/*.jpg  : 各文章的横幅封面（按 1920x1080 裁切/填充）
  - 压缩主图，减小体积
"""
import os
from PIL import Image, ImageEnhance

SRC = os.path.join('source', 'img')
OUT = os.path.join(SRC, 'top_img')
os.makedirs(OUT, exist_ok=True)


def fit_cover(img, size, focus=(0.5, 0.4)):
    """按 focus 位置裁切填充到 size（不拉伸）"""
    tw, th = size
    sw, sh = img.size
    scale = max(tw / sw, th / sh)
    nw, nh = int(sw * scale + 1), int(sh * scale + 1)
    img = img.resize((nw, nh), Image.LANCZOS)
    fx, fy = focus
    left = int((nw - tw) * fx)
    top = int((nh - th) * fy)
    left = max(0, min(left, nw - tw))
    top = max(0, min(top, nh - th))
    return img.crop((left, top, left + tw, top + th))


def darken(img, factor=0.72, sat=1.05):
    """压暗 + 轻微提饱和，让叠在上面的白字更清晰"""
    img = ImageEnhance.Brightness(img).enhance(factor)
    img = ImageEnhance.Color(img).enhance(sat)
    return img


def save_jpg(img, path, quality=86):
    img.convert('RGB').save(path, 'JPEG', quality=quality, optimize=True, progressive=True)
    kb = os.path.getsize(path) / 1024
    print(f'  + {os.path.relpath(path)}  ({kb:.0f} KB)')


# ---------- 1. 头像：deepseek-3 脸部区域 ----------
# deepseek-3.jpg 尺寸 1280x720，人物偏右，脸大约在 x=700..1010, y=40..320
src = Image.open(os.path.join(SRC, 'deepseek-3.jpg'))
w, h = src.size
face = src.crop((int(w * 0.48), int(h * 0.02), int(w * 0.80), int(h * 0.50)))
face = fit_cover(face, (400, 400), focus=(0.34, 0.30))
face = ImageEnhance.Brightness(face).enhance(1.05)
save_jpg(face, os.path.join(SRC, 'avatar.jpg'), 90)

# ---------- 2. 文章横幅 ----------
covers = {
    '1.jpg': ('deepseek-1.jpg', (0.5, 0.45), 0.62),   # 干饭中的大肥鱼
    '2.jpg': ('deepseek-3.jpg', (0.68, 0.45), 0.68),  # Smile DeepSeek 咖啡厅（偏右取人物）
    '3.jpg': ('deepseek-4.jpg', (0.62, 0.45), 0.80),  # 我的悲伤是 token 做的
    '4.jpg': ('deepseek-2.jpg', (0.5, 0.45), 0.62),   # 睡着的大肥鱼
}

for out_name, (src_name, focus, dark) in covers.items():
    img = Image.open(os.path.join(SRC, src_name))
    img = fit_cover(img, (1600, 900), focus=focus)
    img = darken(img, factor=dark)
    save_jpg(img, os.path.join(OUT, out_name))

# ---------- 3. 首页横幅：睡觉那张，人物在中间偏右 ----------
img = Image.open(os.path.join(SRC, 'deepseek-2.jpg'))
img = fit_cover(img, (1920, 1080), focus=(0.5, 0.4))
img = darken(img, factor=0.62)
save_jpg(img, os.path.join(SRC, 'banner.jpg'))

# ---------- 4. 背景图：基于睡觉那张，模糊 + 压暗做背景纹理 ----------
bg = Image.open(os.path.join(SRC, 'deepseek-2.jpg')).convert('RGB')
bg = fit_cover(bg, (1920, 1080), focus=(0.5, 0.4))
bg = bg.filter(__import__('PIL.ImageFilter', fromlist=['ImageFilter']).GaussianBlur(18))
bg = darken(bg, factor=0.30, sat=0.85)
save_jpg(bg, os.path.join(SRC, 'background.jpg'), 80)

print('\n图片资源生成完毕')
