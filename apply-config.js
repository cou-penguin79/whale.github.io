/**
 * Butterfly 主题配置覆盖（只改叶子值，不整块替换）
 *
 * 为什么要写成脚本：主题的 _config.yml 有上百个嵌套键，模板里到处直接引用
 * （theme.search.path、theme.asset.* 等）。手动整块替换很容易连带删掉别的键，
 * 导致 pug 渲染抛错、页面输出 0 字节。所以这里做外科手术式的定点修改。
 */
const fs = require('fs');
const path = require('path');

const CFG = path.join(__dirname, 'themes', 'butterfly', '_config.yml');
let text = fs.readFileSync(CFG, 'utf8').replace(/\r\n/g, '\n');
const lines = text.split('\n');

/** 找到顶层键所在块的范围 [start, end)，注释行算块内 */
function findBlock(key) {
  const start = lines.findIndex(l => l.startsWith(key + ':'));
  if (start === -1) return null;
  const base = lines[start].length - lines[start].trimStart().length;
  let end = start + 1;
  while (end < lines.length) {
    const l = lines[end];
    if (l.trim() === '') { end++; continue; }
    if (l.trimStart().startsWith('#')) {
      const ind = l.length - l.trimStart().length;
      if (ind <= base) break;
      end++; continue;
    }
    const ind = l.length - l.trimStart().length;
    if (ind <= base) break;
    end++;
  }
  return [start, end];
}

/** 设置叶子值，path 形如 'aside.card_author.description' */
function setLeaf(p, value) {
  const parts = p.split('.');
  const top = parts[0];
  const range = findBlock(top);
  if (!range) { console.log('  · 跳过(无此块):', top); return; }

  if (parts.length === 1) {
    const m = lines[range[0]].match(/^(\s*[a-zA-Z_0-9\-]+:)(.*)$/);
    if (!m) { console.log('  · 跳过(格式异常):', p); return; }
    lines[range[0]] = `${m[1]} ${value}`;
    text = lines.join('\n');
    console.log('  ✓', p);
    return;
  }

  let curStart = range[0], curEnd = range[1];
  for (let i = 1; i < parts.length; i++) {
    const key = parts[i];
    let found = -1, foundIndent = Infinity;
    for (let j = curStart + 1; j < curEnd; j++) {
      const l = lines[j];
      if (l.trim() === '' || l.trimStart().startsWith('#')) continue;
      const ind = l.length - l.trimStart().length;
      const m = l.trimStart().match(/^([a-zA-Z_0-9\-]+):/);
      if (!m || m[1] !== key) continue;
      if (ind < foundIndent) { foundIndent = ind; found = j; }
    }
    if (found === -1) { console.log('  · 跳过(无此子键):', p); return; }

    const isLast = i === parts.length - 1;
    if (isLast) {
      const m = lines[found].match(/^(\s*[a-zA-Z_0-9\-]+:)(.*)$/);
      if (!m) { console.log('  · 跳过(格式异常):', p); return; }
      lines[found] = `${m[1]} ${value}`;
      text = lines.join('\n');
      console.log('  ✓', p);
    } else {
      let sub = found + 1;
      while (sub < curEnd) {
        const l = lines[sub];
        if (l.trim() === '') { sub++; continue; }
        const ind = l.length - l.trimStart().length;
        if (ind <= foundIndent) break;
        sub++;
      }
      curStart = found; curEnd = sub;
    }
  }
}

// ---------- 菜单 ----------
{
  const r = findBlock('menu');
  if (r) {
    lines.splice(r[0] + 1, r[1] - r[0] - 1,
      '  首页: / || fas fa-home',
      '  归档: /archives/ || fas fa-archive',
      '  分类: /categories/ || fas fa-folder',
      '  标签: /tags/ || fas fa-tags',
      '  友链: /link/ || fas fa-link',
      '  关于: /about/ || fas fa-info-circle',
    );
    text = lines.join('\n');
    console.log('  ✓ menu');
  }
}

// ---------- 品牌 ----------
setLeaf('favicon', '/img/favicon.svg');
// 头像：大肥鱼脸部特写（由 make-assets.py 从 deepseek-3.jpg 裁出）
setLeaf('avatar.img', '/img/avatar.jpg');
setLeaf('avatar.effect', 'true');
// 页面横幅：睡觉的大肥鱼（画面干净，不跟站名叠字）
setLeaf('default_top_img', '/img/banner.jpg');
setLeaf('index_img', '/img/banner.jpg');
setLeaf('archive_img', '/img/top_img/4.jpg');
setLeaf('tag_img', '/img/top_img/3.jpg');
setLeaf('category_img', '/img/top_img/1.jpg');
// 站点背景图（模糊压暗的大肥鱼，做内容区底纹）
setLeaf('background', '/img/background.jpg');
setLeaf('error_404.enable', 'true');
setLeaf('error_404.subtitle', "'这里没有鲸鱼'");

// ---------- 首页 ----------
setLeaf('index_site_info_top', "'45%'");
setLeaf('index_top_img_height', "'100vh'");
setLeaf('subtitle.enable', 'true');
setLeaf('subtitle.effect', 'true');
setLeaf('subtitle.source', 'false');
// 副标题内容（打字机效果需要 sub 列表非空）
{
  const r = findBlock('subtitle');
  if (r) {
    const idx = lines.findIndex((l, i) => i > r[0] && /^\s*sub:\s*$/.test(l));
    if (idx !== -1) {
      lines.splice(idx, 1,
        '  sub:',
        '    - "Smile DeepSeek！今天也要开心吐泡泡～"',
        '    - "A little smile, a little magic."',
        '    - "先吐个泡泡，再慢慢往前游。"',
        '    - "炉子上永远温着一锅米饭 🍚"',
      );
      text = lines.join('\n');
      console.log('  ✓ subtitle.sub');
    }
  }
}
setLeaf('index_layout', '3');
setLeaf('index_post_content.method', '1');
setLeaf('index_post_content.length', '300');

// ---------- 文章页 ----------
setLeaf('post_meta.page.categories', 'false');
setLeaf('post_meta.page.tags', 'true');
setLeaf('post_meta.post.position', 'center');
setLeaf('post_copyright.enable', 'true');
setLeaf('post_copyright.author_href', 'https://github.com/cou-penguin79');
setLeaf('related_post.enable', 'true');
setLeaf('related_post.limit', '6');
setLeaf('toc.post', 'true');
setLeaf('toc.number', 'true');
setLeaf('toc.scroll_percent', 'true');
setLeaf('post_pagination', '1');

// ---------- 页脚 ----------
setLeaf('footer.owner.enable', 'true');
setLeaf('footer.owner.since', '2026-10-28');
setLeaf('footer.copyright.enable', 'true');

// ---------- 侧边栏 ----------
setLeaf('aside.enable', 'true');
setLeaf('aside.hide', 'false');
setLeaf('aside.position', 'right');
setLeaf('aside.card_author.description', "'一只 DeepSeek 蓝、戴着女仆头饰的大肥鱼'");
setLeaf('aside.card_author.button.text', "'@10ve'");
setLeaf('aside.card_author.button.link', 'https://github.com/cou-penguin79');
setLeaf('aside.card_announcement.content', "'Smile DeepSeek～ 这里是一只大肥鱼的小小深海。'");
setLeaf('aside.card_tags.color', 'true');
setLeaf('aside.card_archives.format', "'YYYY年M月'");
setLeaf('aside.card_webinfo.post_count', 'true');
setLeaf('aside.card_webinfo.last_push_date', 'true');

// ---------- 深色模式 ----------
setLeaf('darkmode.enable', 'true');
setLeaf('darkmode.button', 'true');

// ---------- 搜索 / 分享 / 评论 ----------
setLeaf('search.use', 'local_search');
setLeaf('search.placeholder', "'搜索文章...'");
setLeaf('share.use', 'sharejs');
setLeaf('share.sharejs.sites', 'qq,weibo');
setLeaf('comments.use', '');

// ---------- 其它 ----------
setLeaf('code_blocks.theme', 'ocean');
setLeaf('wordcount.enable', 'true');
setLeaf('rounded_corners_ui', 'true');
setLeaf('rightside_scroll_percent', 'true');
// 加载动画（参考站有全屏 Loading）
setLeaf('preloader.enable', 'true');
setLeaf('preloader.source', '1');
setLeaf('mask.header', 'true');
setLeaf('mask.footer', 'true');
// 默认深色（参考站是深色主题）
setLeaf('display_mode', 'dark');
setLeaf('beautify.enable', 'true');
setLeaf('lightbox', 'fancybox');
setLeaf('note.style', 'flat');
setLeaf('note.icons', 'true');
setLeaf('click_heart.enable', 'true');
setLeaf('canvas_ribbon.enable', 'false');
setLeaf('pjax.enable', 'false');
setLeaf('structured_data.enable', 'true');
// 访问统计（参考站用了 busuanzi）
setLeaf('busuanzi.site_uv', 'true');
setLeaf('busuanzi.site_pv', 'true');
setLeaf('busuanzi.page_pv', 'true');
// 侧边栏网站信息卡片
setLeaf('aside.card_webinfo.enable', 'true');
setLeaf('aside.card_webinfo.post_count', 'true');
setLeaf('aside.card_webinfo.last_push_date', 'true');
// runtime_date 要填真实日期字符串，留空则不显示运行时长
setLeaf('aside.card_webinfo.runtime_date', '');

// ---------- 主题色 ----------
// 主题配置里 theme_color 整块是注释掉的（每行前缀 #），
// 这里把整块取消注释并写入大肥鱼配色。
{
  const idx = lines.findIndex(l => /^#?\s*theme_color:\s*$/.test(l));
  if (idx === -1) {
    console.log('  · 跳过(无 theme_color 块)');
  } else {
    // 找到该块的范围：注释行直到下一个顶层键为止
    let end = idx + 1;
    while (end < lines.length) {
      const l = lines[end];
      if (l.trim() === '') { end++; continue; }
      if (l.trimStart().startsWith('#')) { end++; continue; }   // 注释掉的子键
      const ind = l.length - l.trimStart().length;
      if (ind === 0) break;                                     // 下一个顶层键
      end++;
    }
    const colors = {
      enable: 'true',
      main: '"#49B1F5"',
      paginator: '"#00C4B6"',
      button_hover: '"#FF7242"',
      text_selection: '"#00C4B6"',
      link_color: '"#49B1F5"',
      meta_color: '"#858585"',
      hr_color: '"#49B1F5"',
      code_foreground: '"#F47466"',
      code_background: '"rgba(27, 31, 35, .05)"',
      toc_color: '"#00C4B6"',
      blockquote_padding_color: '"#49B1F5"',
      blockquote_background_color: '"#49B1F5"',
      scrollbar_color: '"#49B1F5"',
      meta_theme_color_light: '"#ffffff"',
      meta_theme_color_dark: '"#0d0d0d"',
    };
    const block = ['theme_color:'];
    for (const [k, v] of Object.entries(colors)) block.push(`  ${k}: ${v}`);
    lines.splice(idx, end - idx, ...block);
    text = lines.join('\n');
    console.log('  ✓ theme_color');
  }
}

fs.writeFileSync(CFG, text, 'utf8');
console.log('\n主题配置覆盖完成');
