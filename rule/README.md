Surge 自定义广告域名清单（RULE-SET 格式）。

## 文件格式

每行一条 Surge 规则，`#` 开头为注释：

```
DOMAIN-SUFFIX,example-ads.com
DOMAIN,ads.some-cdn.net
DOMAIN-KEYWORD,popunder
```

清单默认搭配 `REJECT` 策略使用（引用时指定，文件里不写策略）。

## 如何生效

把清单地址加到 profile 或模块的 `[Rule]` 段（放在 FINAL 之前）：

```
RULE-SET,https://raw.githubusercontent.com/mxd8/Surge/main/rule/custom.list,REJECT
```

- Surge 会按 `update-interval` 自动拉取更新，改动本文件推送后各设备自动生效
- 也可以用 `surge-cli add-temp-rule "DOMAIN-SUFFIX,xxx,REJECT"` 先临时验证，再沉淀进清单

## 文件说明

- `custom.list` — 个人自定义广告域名（手工维护）
