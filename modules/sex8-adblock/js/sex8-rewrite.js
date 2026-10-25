// Sex8（Discuz）页面重写：删除站内广告容器（桌面版模板通用）
// 由模块 [Script] 的 http-response 引用：requires-body=1
// 网络层 [Rule] 已拦 api.php?mod=ad 与第三方弹窗域；本脚本处理创意图走内容 CDN
// （images.x5ewt.com，与附件同域不能拦）以及站内投放、只能删 DOM 的部分

let body = $response.body;
if (!body) {
  $done({});
}

const ct = String($response.headers['Content-Type'] || $response.headers['content-type'] || '');
if (ct.indexOf('text/html') === -1 && body.indexOf('<html') === -1 && body.toLowerCase().indexOf('<!doctype html') === -1) {
  // api.php JS / AJAX JSON 等非页面响应不处理
  $done({});
}

// 已注入过则跳过
if (body.indexOf('surge-sex8-adblock') !== -1) {
  $done({});
}

// 广告容器选择器（CSS 隐藏与 DOM 删除共用）：
//   modal_index/modal_radio 两套广告弹窗（内含 ad_first 弹窗外链、ad_second APP/VIP
//   推广浮窗、xb_ad_source_* 广告卡片）、楼层广告、固定底部横幅、导航 radiobar 广告位、
//   AdSense 位、右下角悬浮视频广告窗、帖子表格插入的广告行（b_sxp 创意图走内容 CDN）、
//   帖子内容区注入的返利推广挂件、会员订单通知弹窗
//   注意：.p_pop/.h_pop 是 Discuz 弹出菜单、#sign-ad 是签到弹窗、.qd-top/#location_list
//   是签到/地区工具条，都不是广告，不碰；帖子正文在 table.plhin，tr.ad 实测不含正文
const AD_SELECTOR =
  '#myModal_index,#myModal_radio,#ad_first,#ad_second,.xb_app_box,' +
  '[id^="xb_ad_source"],.floor-ad,#fixed-bottom-modal,' +
  'a#mn_plink_radiobar,ins.adsbygoogle,.adsbygoogle,' +
  '.V-video-float,tr.ad,.b_sxp,#v_e6_action,' +
  '.pct iframe[src*="plugin-e6-rebate"],' +
  '#member-order-notice-modal,#member-order-notice-loading';

const css = '<style id="surge-sex8-adblock-css">' +
  AD_SELECTOR + '{display:none !important;}' +
  '</style>';

const js = '<script id="surge-sex8-adblock-js">(function(){' +
  'var SEL=' + JSON.stringify(AD_SELECTOR) + ';' +
  'var pt=0;' +
  'function purge(){try{var els=document.querySelectorAll(SEL);for(var i=0;i<els.length;i++){els[i].remove();}}catch(e){}}' +
  'if(document.readyState!=="loading"){purge();}' +
  'document.addEventListener("DOMContentLoaded",purge);' +
  'window.addEventListener("load",purge);' +
  // api.php 广告脚本可能在 load 后回填，MutationObserver 兜底 15 秒
  'try{var mo=new MutationObserver(function(){clearTimeout(pt);pt=setTimeout(purge,200);});' +
  'mo.observe(document.documentElement,{childList:true,subtree:true});' +
  'setTimeout(function(){mo.disconnect();},15000);}catch(e){}' +
  '})();</script>';

const payload = css + js;

let injected = false;
const headIdx = body.search(/<\/head>/i);
if (headIdx !== -1) {
  body = body.slice(0, headIdx) + payload + body.slice(headIdx);
  injected = true;
}
if (!injected) {
  const bodyIdx = body.search(/<\/body>/i);
  if (bodyIdx !== -1) {
    body = body.slice(0, bodyIdx) + payload + body.slice(bodyIdx);
    injected = true;
  }
}
if (!injected) {
  body = payload + body;
}

// 响应头回传：强制 HTML 不被浏览器缓存——否则 MITM 关闭期间缓存的旧页面
// 会在 MITM 恢复后继续渲染出广告容器（无响应体可改写，重写无从生效）
const headers = {};
const rh = $response.headers || {};
for (const k in rh) {
  if (/^(cache-control|content-length|content-encoding|transfer-encoding)$/i.test(k)) continue;
  headers[k] = rh[k];
}
headers['cache-control'] = 'no-cache';

$done({ body, headers });
