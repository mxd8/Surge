// AVJoy 页面重写：移除/隐藏广告位（桌面与手机版模板通用）
// 由模块 [Script] 的 http-response 引用：requires-body=1
// 域名级 REJECT 规则负责断网络，本脚本负责清 DOM（不留空盒子、不起 VAST 请求）

let body = $response.body;
if (!body) {
  $done({});
}

const ct = String($response.headers['Content-Type'] || $response.headers['content-type'] || '');
if (ct.indexOf('text/html') === -1 && body.indexOf('<html') === -1) {
  // AJAX/JSON 响应不处理
  $done({});
}

// 1) 关闭 VAST 贴片插件：adsEnabled=false 后 videojs-vast-vpaid 不再请求广告标签，
//    正片立即起播（比等网络层 REJECT 的 5 秒超时更快）
body = body
  .replace(/"adsEnabled"\s*:\s*true/g, '"adsEnabled": false')
  .replace(/"playAdAlways"\s*:\s*true/g, '"playAdAlways": false')
  .replace(/"adTagUrl"\s*:\s*"(https?:[^"]*)"/g, '"adTagUrl": ""');

// 2) 删除广告脚本与广告 iframe（ExoClick / JuicyAds / Tsyndicate / smartpop 系）
body = body
  .replace(/<script[^>]*src="[^"]*(?:magsrv\.com|jads\.co|tsyndicate\.com)[^"]*"[^>]*>\s*<\/script>/gi, '')
  .replace(/<iframe[^>]*src="[^"]*(?:mayzaent\.com|marzaent\.com|greentrafsa\.com|mavrtracktor\.com)[^"]*"[^>]*>\s*<\/iframe>/gi, '')
  .replace(/<ins[^>]*class="eas6a97888e[^"]*"[^>]*>[\s\S]{0,400}?<\/ins>/gi, '')
  .replace(/<ins[^>]*id="1025556"[^>]*>[\s\S]{0,400}?<\/ins>/gi, '');

// 3) 兜底：CSS 隐藏残留广告容器与占位符（含手机版布局的任何变体）
const css = '<style id="surge-avjoy-adblock">' +
  '.ad-content,.ad-content-bot,.ad-content-side,' +
  'ins[class^="eas6a97888e"],ins[id="1025556"],' +
  'iframe[src*="mayzaent"],iframe[src*="marzaent"],iframe[src*="greentrafsa"],' +
  'iframe[src*="mavrtracktor"],iframe[src*="kbnmnl"]' +
  '{display:none !important;height:0 !important;min-height:0 !important;}</style>';

if (body.indexOf('surge-avjoy-adblock') === -1) {
  if (body.indexOf('</head>') !== -1) {
    body = body.replace('</head>', css + '</head>');
  } else {
    body = body.replace(/(<html[^>]*>)/i, '$1' + css);
  }
}

$done({ body });
