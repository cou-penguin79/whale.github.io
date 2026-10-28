/* ------------------------------------------------------------------
 *  Whale Station · BGM 常驻播放器 (fixed 悬浮 APlayer)
 *  通过主题 inject.bottom 引入，全站常驻背景音乐
 *  音乐文件放到 source/music/ 下，用本地路径播放（最稳、不依赖外网）
 * ------------------------------------------------------------------ */
(function () {
  // APlayer 资源（本地优先，避免外网 CDN 被墙拉不到）
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  function loadCss(href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }

  loadCss('/music/aplayer.min.css');
  loadScript('/music/aplayer.min.js').then(function () {
    if (!window.APlayer) return;
    // fixed 模式需要容器元素：动态创建并挂到 body
    var box = document.createElement('div');
    box.id = 'whale-bgm';
    document.body.appendChild(box);
    new APlayer({
      container: box,
      fixed: true,          // 固定悬浮迷你播放器 → BGM 效果
      autoplay: false,      // 不自动播放（浏览器限制 + 友好）
      loop: 'all',
      order: 'list',
      mutex: true,
      lrcType: 0,
      theme: '#49b1f5',
      audio: [
        {
          name: '心跳的证明',
          artist: '刘人语',
          url: '/music/刘人语 - 心跳的证明_H.ogg',
          cover: '/img/favicon.svg'
        },
        {
          name: '不遗憾',
          artist: '李荣浩',
          url: '/music/李荣浩 - 不遗憾_H.ogg',
          cover: '/img/favicon.svg'
        },
        {
          name: '爱，存在',
          artist: '魏奇奇',
          url: '/music/魏奇奇 - 爱，存在_H.ogg',
          cover: '/img/favicon.svg'
        }
      ]
    });
  })();
})();
