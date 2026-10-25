// XVideos 页面重写：移除/隐藏广告位（桌面与手机版模板通用）
// 由模块 [Script] 的 http-response 引用：requires-body=1
// 域名级 REJECT 规则负责断广告服务域，本脚本负责：清空广告位注入配置 + 清 DOM

let body = $response.body;
if (!body) {
  $done({});
}

const ct = String($response.headers['Content-Type'] || $response.headers['content-type'] || '');
if (ct.indexOf('text/html') === -1 && body.indexOf('<html') === -1) {
  // AJAX/JSON 响应不处理
  $done({});
}

// 1) 源头关广告：页面 JS 按 ads.banners 计划注入广告位
//    （nativehome 原生广告进 .mozaique 网格、footer 横幅进 #ad-footer），
//    清空后既不注入 DOM 也不请求广告域，比等网络层 REJECT 超时更快
body = body.replace(/"banners"\s*:\s*\[[^\]]*\]/g, '"banners":[]');

// 2) 删除静态 HTML 里已存在的广告脚本标签（ExoClick 系）
body = body.replace(
  /<script[^>]*src="[^"]*(?:pemsrv\.com|magsrv\.com|exoclick\.com)[^"]*"[^>]*>\s*<\/script>/gi,
  ''
);

// 3) CSS 兜底：隐藏底部横幅容器、直播挂件区块与全部站内赞助外链
//    （挂件外层是每次刷新都变的 hash 类，用 :has 按结构匹配；a[href] 覆盖菜单全部变体）
const css = '<style id="surge-xvideos-adblock-css">' +
  '#ad-footer,.exo-ad-ins-container{display:none !important;height:0 !important;min-height:0 !important;}' +
  '#content > div:has(.live_model_thumb){display:none !important;}' +
  'a[href*="zline0.com"]{display:none !important;}</style>';

// 4) 客户端清理脚本：删除底部横幅与直播挂件区块（不留空盒子）
//    挂件区块 = #content 的直接子节点中包含 .live_model_thumb 的那个（外层 hash 类会轮换）
const js = '<script id="surge-xvideos-adblock">(function(){' +
  'var K=function(){' +
  'document.querySelectorAll("#ad-footer,.exo-ad-ins-container").forEach(function(e){e.remove();});' +
  'var t=document.querySelector(".live_model_thumb");' +
  'if(t){var b=t;while(b.parentElement&&b.parentElement.id!=="content"){b=b.parentElement;}' +
  'if(b&&b.parentElement&&b.parentElement.id==="content"){b.remove();}}' +
  '};' +
  'K();' +
  'new MutationObserver(K).observe(document.documentElement,{childList:true,subtree:true});' +
  '})();</script>';

if (body.indexOf('surge-xvideos-adblock') === -1) {
  if (body.indexOf('</head>') !== -1) {
    body = body.replace('</head>', css + '</head>');
  } else {
    body = body.replace(/(<html[^>]*>)/i, '$1' + css);
  }
  if (body.indexOf('</body>') !== -1) {
    body = body.replace('</body>', js + '</body>');
  }
}

$done({ body });
