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
  '.V-video-float,tr.ad,[class*="b_sx"],#v_e6_action,' +
  '.pct iframe[src*="plugin-e6-rebate"],' +
  '#member-order-notice-modal,#member-order-notice-loading,' +
  // v1.0.2：全站推广链接块（class 带混淆随机串 fnwehjnc12 会轮换，用结构与内容类删）
  'div.full:has(> .div-list),.div-list,[class*="fnwehjnc"],' +
  // v1.0.3：侧条里的单个广告按钮、滚动推广轮播与 gohome_* 推广链接（运行时由
  // peerclick.js/recommends.js 等同源脚本生成，脚本在下方源头摘除，这里清残留）
  '#qd-jdcf,[class*="gohome"],[class*="scroll-panel"],[class*="scroll-pitem"],' +
  // v1.0.4：滚动推广轮播的 swiper 空壳（UL 清掉后 35px 横条仍占位，连壳删）；
  //   分组间横幅块 div.bm.b_sxc 走 [class*="b_sx"] 通配（后缀 b_sxp/b_sxc 会轮换）
  '.swiper-slide:has(> .scroll-container-panel),' +
  '.swiper-wrapper:has(.scroll-container-panel),' +
  '.swiper-container:has(.scroll-container-panel),' +
  // v1.0.5：文字广告位（SW01-SW08 槽，无类名裸文本链直指落地域）——
  //   dasp.php 是广告专用跳转器，按 href 属性删链接并整行删除
  'a[href*="dasp.php"],tr:has(a[href*="dasp.php"])';

// 源头摘除同源广告生成器脚本（域名拦截对同源 JS 无效）：
//   static/js/peerclick.js——广告点击网络 gopeerclick.com 的客户端
//   recommends.js——广告 feed（pc-web.mnoas309.com）驱动的推广位生成器
//   保留 categories.js（637KB 分类数据，左侧 location_list 快捷条依赖）与 redirect.js（功能不明，保守不动）
const STRIP_SCRIPTS = /<script[^>]*src="[^"]*(?:peerclick|recommends)\.js[^"]*"[^>]*>\s*<\/script>/gi;

// 源头摘除同源广告生成器（静态 HTML 里的 script 标签，解析前删掉即断种）
body = body.replace(STRIP_SCRIPTS, '');

const css = '<style id="surge-sex8-adblock-css">' +
  AD_SELECTOR + '{display:none !important;}' +
  '</style>';

const js = '<script id="surge-sex8-adblock-js">(function(){' +
  'var SEL=' + JSON.stringify(AD_SELECTOR) + ';' +
  'var pt=0;' +
  'function purge(){try{var els=document.querySelectorAll(SEL);for(var i=0;i<els.length;i++){els[i].remove();}}catch(e){}}' +
  // 导航栏推广项过滤：Discuz #nv 里的 li 用随机 id（mn_N9660 这类），按落地域过滤而非枚举 id。
  // 随机 TLD 是广告落地页的批量轮换特征；站点自有外链（twitter/t.me/姊妹站 .com）不受影响
  'function navPass(){try{var re=new RegExp("[.](xyz|fyi|space|life|online|top|icu|buzz|bar|co)(:|/|$)|bxkfw458|glksr3|rkaflet|szefdrh|heiliao|yuelao|duoduomxm|quibids|weiixedbi|heisiyujie","i");' +
  'var as=document.querySelectorAll("#nv a[href]");' +
  'for(var i=0;i<as.length;i++){var h=as[i].getAttribute("href")||"";' +
  'var p=h.indexOf("//");if(p<0)continue;' +
  'var host=h.slice(p+2).split("/")[0].split(":")[0];' +
  'if(re.test(host)){var li=as[i].closest("li")||as[i];li.remove();}}' +
  '}catch(e){}}' +
  'function clean(){purge();navPass();}' +
  'if(document.readyState!=="loading"){clean();}' +
  'document.addEventListener("DOMContentLoaded",clean);' +
  'window.addEventListener("load",clean);' +
  // api.php 广告脚本可能在 load 后回填，MutationObserver 兜底 15 秒
  'try{var mo=new MutationObserver(function(){clearTimeout(pt);pt=setTimeout(clean,200);});' +
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
