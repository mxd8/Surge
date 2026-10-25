// WZ888 (wz888.net) 页面重写：删除站内广告容器（手机/桌面模板通用，tpl001）
// 由模块 [Script] 的 http-response 引用：requires-body=1
// 网络层 [Rule] 已拦推广落地域/裸 IP/纯广告创意 CDN；本脚本处理共享图床创意
// （go2yd/alicdn/mifile/z4a/cffpic 与内容封面同走图床，不能拦域名）以及服务端渲染的
// 广告结构。广告形态（2026-10 实测，桌面 UA 被 nginx 403，移动 UA 可过）：
//   1. div.mod 纯广告槽：内含 6 个 dl.gg_NNN 横幅（dl/dt/a/img 同类名，落地=裸 IP
//      jump.html/注册页，创意=cdn.khfed.com/*.js、go2yd）——整槽删除
//   2. div.appad：12 个 a.app-abk-item（APP 推广九宫格，落地=azure:8787/裸 IP:5001/
//      wmsxwd-3.men/qyhitzk/zloazdb/3879394.cc，创意=go2yd/lhggtc/cffpic/alicdn/mifile）
//   3. div.spreadimage ×4：菜单区推广图组（onclick=open_url(shangwu.netlify.app)）
//      + 页脚 <a href=shangwu.netlify.app style=color:red>
//   4. div#bottom_float：底部悬浮（z-index:2147483647，图=go2yd，落地=lfyc.cc?name=）
//   5. 导航 ul.btn-icon 里的 APP 下载推广 li（onclick=open_url('https://hscka.cc'/
//      'https://ddysx.cc')，icon-apple/icon-android）
//   6. 页脚 a.site_link ×3（dadiao.cc/diaomao.org/sexgps.net 第三方友链推广）
//      注意："最新网址"公告区的 bare <a>（dadiao.cc，onclick=open_url）是备用域功能，
//      不删；copyUrl onclick 是复制链接功能，不碰
// 运行时验证：common.js 的悬浮层注入（#azwangye/#azwangye1）当前未激活，由
// wz888-common.js 清空配置数组从源头断种，CSS 兜底隐藏

var body = $response.body;
if (!body) {
  $done({});
}

var ct = String($response.headers['Content-Type'] || $response.headers['content-type'] || '');
if (ct.indexOf('text/html') === -1 && body.indexOf('<html') === -1 && body.toLowerCase().indexOf('<!doctype html') === -1) {
  // AJAX/JSON 等非页面响应不处理
  $done({});
}

// 已注入过则跳过
if (body.indexOf('surge-wz888-adblock') !== -1) {
  $done({});
}

// 在 openTag 处截取一个平衡的 <tag>…</tag> 块并返回删除后的 html
// （div/dl/li 嵌套深度不定，不能用非贪婪正则到第一个闭标签）
function cutBalanced(html, openIdx, tag) {
  var openEnd = html.indexOf('>', openIdx);
  if (openEnd === -1) return html;
  var closeTag = '</' + tag + '>';
  var openPat = '<' + tag;
  var pos = openEnd + 1;
  var depth = 1;
  var guard = 0;
  while (depth > 0 && pos < html.length && guard < 5000) {
    guard++;
    var oc = html.indexOf(openPat, pos);
    var cc = html.indexOf(closeTag, pos);
    if (cc === -1) {
      // 无闭合（畸形 HTML）：截到文档尾，防残留
      return html.slice(0, openIdx);
    }
    if (oc !== -1 && oc < cc) {
      depth++;
      pos = html.indexOf('>', oc) + 1;
    } else {
      depth--;
      if (depth === 0) {
        return html.slice(0, openIdx) + html.slice(cc + closeTag.length);
      }
      pos = cc + closeTag.length;
    }
  }
  return html;
}

// 反复查找并删除匹配 re 的平衡块（每次切割后字符串变短，exec 前必须重置
// lastIndex，否则相邻同签名块会被跳过）
function removeAll(html, re, tag) {
  var guard = 0;
  var m = re.exec(html);
  while (m && guard < 200) {
    guard++;
    html = cutBalanced(html, m.index, tag);
    re.lastIndex = 0;
    m = re.exec(html);
  }
  return html;
}

// 定位 openIdx 处 <div> 的平衡闭合位置（</div> 起始下标），畸形 HTML 返回 -1
function findDivClose(html, openIdx) {
  var openEnd = html.indexOf('>', openIdx);
  if (openEnd === -1) return -1;
  var pos = openEnd + 1;
  var depth = 1;
  var guard = 0;
  while (depth > 0 && pos < html.length && guard < 5000) {
    guard++;
    var oc = html.indexOf('<div', pos);
    var cc = html.indexOf('</div>', pos);
    if (cc === -1) return -1;
    if (oc !== -1 && oc < cc) {
      depth++;
      pos = html.indexOf('>', oc) + 1;
    } else {
      depth--;
      if (depth === 0) return cc;
      pos = cc + 6;
    }
  }
  return -1;
}

// 1. 纯广告槽：含 gg_NNN 类的 div.mod 整槽删除（正片 mod 无 gg_ 类，不会误伤）。
//    先在原文上收集全部广告槽区间，再从尾部倒序删除，规避正则 lastIndex
//    与区间位移问题；含嵌套跳过保护
function removeAdMods(html) {
  var re = /<div\s+class="mod[^"]*"/gi;
  var found = [];
  var m;
  while ((m = re.exec(html)) !== null) {
    var cc = findDivClose(html, m.index);
    if (cc === -1) break;
    if (/class="[^"]*gg_\d+/.test(html.slice(m.index, cc + 6))) {
      found.push([m.index, cc + 6]);
    }
  }
  var removed = null;
  for (var i = found.length - 1; i >= 0; i--) {
    if (removed && found[i][1] > removed[0]) continue;
    html = html.slice(0, found[i][0]) + html.slice(found[i][1]);
    removed = found[i];
  }
  return html;
}

body = removeAdMods(body);
// 2. 兜底：mod 之外的散置 gg_ 横幅（dl/dt 块）
body = removeAll(body, /<dl[^>]*class="[^"]*gg_\d+[^"]*"/i, 'dl');
body = removeAll(body, /<dt[^>]*class="[^"]*gg_\d+[^"]*"/i, 'dt');
// 3. APP 推广块整块
body = removeAll(body, /<div[^>]*class="[^"]*\bappad\b[^"]*"/i, 'div');
// 4. 菜单区推广图组
body = removeAll(body, /<div[^>]*class="[^"]*\bspreadimage\b[^"]*"/i, 'div');
// 5. 底部悬浮（固定定位 + 极限 z-index）
body = removeAll(body, /<div[^>]*id="bottom_float"[^>]*>/i, 'div');
// 6. 导航 APP 下载推广 li（按落地域精确删，公告区 dadiao.cc 不在 li 里不受影响）
body = removeAll(body, /<li[^>]*>(?:(?!<\/li>)[\s\S])*?open_url\('https:\/\/(?:hscka|ddysx)[^']*'\)/i, 'li');
// 7. 页脚友链推广锚点与推广页链接
body = body.replace(/<a\s[^>]*class="site_link"[^>]*>[\s\S]*?<\/a>/gi, '');
body = body.replace(/<a\s[^>]*href="https:\/\/shangwu\.netlify\.app\/"[^>]*>[\s\S]*?<\/a>/gi, '');

// 8. CSS 兜底：JS 引擎运行时注入（#azwangye/#azwangye1 顶部/底部 14% 悬浮层）、
//    未删净的服务端残留、变体页新形态；id=style 标记兼作注入确认指纹
var CSS = '#bottom_float,#azwangye,#azwangye1,.appad,.app-abk,.app-abk-item,' +
  '.spreadimage,.abk-image,.app-img,div.mod:has([class*="gg_"]),' +
  '[class*="gg_"],a.site_link{display:none!important;}';
var STYLE = '<style id="surge-wz888-adblock">' + CSS + '</style>';
if (/<\/head>/i.test(body)) {
  body = body.replace(/<\/head>/i, STYLE + '</head>');
} else {
  body = STYLE + body;
}

// no-cache：防站点/代理缓存旧版带广告页面
var headers = {};
var rh = $response.headers || {};
for (var k in rh) {
  headers[k] = rh[k];
}
headers['cache-control'] = 'no-cache';

$done({ body: body, headers: headers });
