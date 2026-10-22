# 后续单元内容接口

当前默认主线为 Starter—Unit 3、原表动词、两种完成时判断。正式 unit3-jobs 包已启用，所有关联内容统一标记 `unit3`。示例包不会自动启用。

支持两种扩展方式：

1. 在「资料与设置 → 新增单元」下载 unit-template.json，按资料编写题目，导入预检，通过后点击「启用这个单元」。题包仅保存于当前浏览器；导出完整学习备份时会包含题包。
2. 将核验完成的包对象加入 catalog.js 的 REVIEW_MODULES 数组，重新发布 GitHub Pages。所有设备会加载新题包，原题和已有学习记录不受影响。适合正式发布新增单元。

JSON 顶层字段：schemaVersion 固定为 1；id 为英文数字或连字符，不能与已有单元包重复；title 为展示名；unit 为 U3、U4 等单元标签；sourceName 为原资料及页码；questions 为题目数组。

题目字段：id 在本包中唯一，发布后不要改变；skill 支持 verbs、vocab、grammar、tenses、reading、listening；type 支持 choice、judge、fill、spell、translate、dictation、reading；prompt、explain 必填；level 为 1—3；hint 为可选提示。

- choice / judge：options 为2—6个不重复字符串，answer 为从0开始的正确选项索引。
- fill / spell / translate / dictation：answer 为可接受答案的字符串数组；dictation 另提供 audio（合成语音文本）和 clue（中文提示）。
- reading：另提供 title、sentences（句子数组）、evidence（证据索引）、relations（关联思路数组）、relation（正确关联索引）、gloss（中文词汇提示），同时包含 options 和 answer。
- 情境语法题可使用 passage 字符串数组。不要仅将长阅读全篇复制后换题干。
- 阅读配套题可提供 parentId，填写同包阅读题的原始 id；加载器自动加命名空间，阅读训练时会带出配套题。
- 顶层可提供 points（知识清单文本数组）和 vocab（词汇卡片数组，每项含 word、meaning、sentence、zh）；加载后自动标记该包的 unit。sentence 中用 ___ 表示目标词位置。

系统会为题目加上 `单元包id:题目id` 命名空间，防止与原题ID冲突。导入前会检验题型、能力标签、答案索引、阅读证据和关联字段，拒绝损坏或重复题包。

导入不等于内容审核。每题仍需核对：单元范围、唯一答案、可接受拼写、原文证据、解析和来源。正式发布前运行 `node verify.cjs` 并实际检查手机布局。

静态应用不含远程写入接口或密钥。后续若接服务端，可在此模块层用请求返回同样的题包结构；学习记录以稳定qid对应，保持向后兼容。
