// WZ888 (wz888.net) common.js 重写：清空站方自建广告引擎的配置数组，源头断种
// 由模块 [Script] 的 http-response 引用：requires-body=1
// common.js 是功能脚本（复制链接/回顶/懒加载/菜单），不能删标签，只能清配置。
// 配置块（2026-10 实测，行号供比对）：
//   L60-114 couplet/coupletData/couplet1/coupletData1、topData、btmData、midData、
//           centerData、topGGData、btmGGData（imgs+url 成对，图=s27ns/yhc339/m776/
//           xiongmao12/rgn78y/uj63t/7tyc3/yhwakgq3 等随机名家族）
//   L120    rollingad（滚动广告）
//   L125    danData（空数组，一并清）
// 消费点：L512-557 注入 #azwangye/#azwangye1 全宽悬浮层（topGGData/btmGGData）、
//         L435+ window.onload 处理 #rollingadBox 滚动。运行时实测当前未激活
//         （injCount=0），清配置防其按请求/按时段轮换启用。
// topData/btmData/midData/centerData 当前无消费点（死代码），一并清空作防轮换。

var body = $response.body;
if (!body) {
  $done({});
}

// 签名不符（不是目标 common.js，如版本切换/缓存错配）则跳过
if (body.indexOf('coupletData') === -1 && body.indexOf('rollingad') === -1 && body.indexOf('topGGData') === -1) {
  $done({});
}

// 数组内容为对象字面量（imgs/url/co/channelCode 等键），不含 "];" 字面量，
// 非贪婪到第一个 "];" 即为完整数组体
var CFG_RE = /\b(topGGData|btmGGData|coupletData\d?|topData|btmData|midData|centerData|rollingad|danData)\s*=\s*\[[\s\S]*?\]\s*;/g;

var purged = body.replace(CFG_RE, '$1 = [];');

// 已清空则原样返回（幂等）
if (purged === body) {
  $done({});
}

body = '/*surge-wz888-adblock*/\n' + purged;

var headers = {};
var rh = $response.headers || {};
for (var k in rh) {
  headers[k] = rh[k];
}
headers['cache-control'] = 'no-cache';

$done({ body: body, headers: headers });
