# foxai TTS 技能

> 一键调用 https://tts.qifei2035.eu.cc/ 的 TTS 接口，基于 Microsoft Edge TTS，OpenAI 兼容接口格式。

## 功能

- 自动登录/调用：通过 `Authorization: Bearer <API_KEY>` 鉴权，**无需登录 Cookie**
- 可选音色库（60+ 音色，中文普通话/方言/粤语/台湾、英文男女声等）
- 自动创建保存目录（`./test/` 或 `~/Desktop/test/`）
- 网络错误自动重试（默认 4 次，指数退避）
- 文件名自动清洗与重名去重
- 文本为空/过长、API Key 失效、参数错误均有明确报错
- 跨平台：在非桌面环境（Linux 服务器）下自动回退到 `cwd/test/`

## 接口信息

| 项目 | 值 |
| --- | --- |
| Base URL | `https://tts.qifei2035.eu.cc` |
| 鉴权 | `Authorization: Bearer 20200108` |
| 合成接口 | `POST /v1/audio/speech` |
| 连通性自检 | `GET  /v1/models` |
| 默认音频格式 | `mp3`（亦支持 `wav` / `opus` / `pcm`） |
| 单次文本上限 | 约 15000 字符（超出请自行分段） |

### 请求体示例

```json
{
  "voice": "zh-CN-XiaoxiaoNeural",
  "input": "你好，欢迎使用 foxai 语音合成",
  "speed": 1.0,
  "pitch": 1.0,
  "response_format": "mp3",
  "stream": false
}
```

> 接口形态与服务端页面 https://tts.qifei2035.eu.cc/ 完全一致（基于 OpenAI `/v1/audio/speech` 兼容协议）。

## 安装

无第三方依赖，仅需 Python ≥ 3.8 标准库：

```bash
# 把 tts_skill/ 目录拷贝到任意项目下即可使用
python -c "import sys; sys.path.insert(0, '.'); from tts_skill import TTSClient; print('OK')"
```

## 快速使用

### 命令行

```bash
# 最简调用：合成 "你好" 并保存到 ./test/tts-YYYYMMDD-HHMMSS-zh-CN-XiaoxiaoNeural.mp3
python -m tts_skill -t "你好，世界" -v zh-CN-XiaoxiaoNeural

# 指定输出文件名
python -m tts_skill -t "Hello world" -v en-US-JennyNeural -o hello_world

# 保存到桌面 test 文件夹（题目原始要求的位置）
python -m tts_skill -t "今天天气不错" -v zh-CN-YunxiNeural --desktop

# 列出所有可用音色
python -m tts_skill --list-voices

# 连通性自检
python -m tts_skill --ping
```

### Python API

```python
from tts_skill import TTSClient, OutputTarget

client = TTSClient()  # 使用内置默认 API Key

# 默认保存到当前工作目录下的 ./test/
out = client.synthesize(
    text="你好，欢迎使用 foxai 语音合成",
    voice="zh-CN-XiaoxiaoNeural",
)
print("已保存:", out)

# 保存到 ~/Desktop/test/
out = client.synthesize(
    text="Hello world",
    voice="en-US-JennyNeural",
    target=OutputTarget.desktop(),
    output_basename="hello",
)
print("已保存:", out)
```

### 自定义配置

```python
from tts_skill import TTSClient, TTSConfig

config = TTSConfig(
    base_url="https://tts.qifei2035.eu.cc",
    api_key="your-api-key",
    timeout=120,           # 单次请求超时
    max_retries=3,          # 失败重试次数
    retry_backoff=2.0,      # 退避基数
)
client = TTSClient(config)
```

### 批量合成（Python API）

```python
from tts_skill import (
    TTSClient, BatchItem, BatchConfig, OutputTarget,
)

client = TTSClient()

items = [
    BatchItem(text="早上好，欢迎收听 foxai 语音简报",
              voice="zh-CN-XiaoxiaoNeural",
              output_basename="morning_zh"),
    BatchItem(text="今日天气晴朗，适合户外活动",
              voice="zh-CN-YunxiNeural",
              output_basename="weather_zh"),
    BatchItem(text="Hello, this is a short English voice test.",
              voice="en-US-JennyNeural",
              output_basename="hello_en"),
]

report = client.synthesize_batch(
    items,
    target=OutputTarget.default(),
    config=BatchConfig(
        concurrency=3,       # 并发请求数（建议 ≤ 5，避免触发服务端限流）
        fail_fast=False,     # 是否首条失败立即中止
        on_progress=lambda r: print(f"#{r.index} {'OK' if r.success else 'FAIL'}"),
    ),
)

print(f"成功 {report.succeeded}/{report.total}，耗时 {report.elapsed_s:.2f}s")
for r in report.results:
    print(f"  [{r.index}] {'OK' if r.success else 'FAIL'} {r.item.voice} -> {r.path or r.error}")

# 报告可序列化为 JSON
import json
print(json.dumps(report.to_dict(), ensure_ascii=False, indent=2))
```

### 批量合成（CLI）

```bash
# 方式 A：命令行多次 -t（所有条目共用 -v 指定的音色）
python -m tts_skill \
  -t "第一条文本" -t "第二条文本" \
  -v zh-CN-XiaoxiaoNeural \
  --concurrency 3

# 方式 B：从 JSON 文件读取（推荐，每条可独立指定音色等参数）
python -m tts_skill \
  --batch-file batch_items.json \
  --concurrency 3 \
  --report batch_report.json   # 可选：写出 JSON 报告
```

JSON 文件结构（数组，每项一个对象）：

```json
[
  {
    "text": "早上好",
    "voice": "zh-CN-XiaoxiaoNeural",
    "speed": 1.0,
    "pitch": 1.0,
    "response_format": "mp3",
    "output_basename": "morning"
  },
  {
    "text": "Hello world",
    "voice": "en-US-JennyNeural",
    "output_basename": "hello"
  }
]
```

CLI 退出码（批量模式）：
- `0` 全部成功
- `4` 部分或全部失败（仍会写出报告，并打印每条错误）

## 默认音色（部分）

| Voice ID | 名称 |
| --- | --- |
| `zh-CN-XiaoxiaoNeural` | 晓晓（多风格 · 最热门） |
| `zh-CN-YunyangNeural`  | 云扬（专业 · 最热门） |
| `zh-CN-XiaoyiNeural`   | 晓伊（活泼） |
| `zh-CN-XiaochenNeural` | 晓辰（开朗） |
| `en-US-JennyNeural`    | Jenny（英文 · 最热门） |
| `en-US-GuyNeural`      | Guy（英文 · 男 · 最热门） |
| `zh-HK-HiuMaanNeural`  | 曉曼（粤语 · 女） |
| `zh-CN-liaoning-XiaobeiNeural` | 晓北（辽宁话） |

完整列表见 `python -m tts_skill --list-voices`。

> **TBD**：音色库来源于站点前端静态资源；如未来服务端新增音色，可手动追加 `tts_skill/tts_client.py` 中的 `VOICE_GROUPS`，未识别的 voice ID 透传给服务端时会得到明确报错。

## 输出位置

- **默认**：当前工作目录下的 `test/`（如 `~/Desktop/TTS skill/test/`）
- **`--desktop`**：`~/Desktop/test/`（若桌面不存在则自动回退到 `cwd/test/`，并打印提示）
- 目录不存在时会自动创建
- 文件名冲突时会自动加 `_1`, `_2` ... 后缀

## 错误处理

| 异常 | 触发条件 | 提示 |
| --- | --- | --- |
| `TTSAuthError` | API Key 无效 / 失效（HTTP 401/403） | 检查 Key 是否过期或被禁用 |
| `TTSBadRequest` | 文本为空 / 过长 / 参数错误（HTTP 4xx） | 检查输入参数 |
| `TTSServerError` | 服务端错误（HTTP 5xx） | 自动重试；持续失败则检查服务端状态 |
| `TTSEmptyAudio` | 接口返回 200 但内容为空 | 通常伴随上游故障，请稍后重试 |
| `TTSNetworkError` | DNS / 连接 / 超时错误 | 检查网络；自动重试 |

CLI 退出码：

- `0` 成功
- `1` 缺少必填参数
- `2` 连通性测试失败
- `3` 合成失败

## 验收清单

- ✅ 使用 API Key 调用接口生成有效音频
- ✅ 默认保存到 `./test/`，加 `--desktop` 保存到 `~/Desktop/test/`
- ✅ 目录不存在时自动创建
- ✅ 更换音色/文本仍可稳定运行
- ✅ 文本为空 → 拒绝执行并提示
- ✅ 未提供音色 → 拒绝执行并提示
- ✅ 鉴权失败 → 明确报错（`TTSAuthError`）
- ✅ 网络错误 → 自动重试（默认 4 次）
- ✅ **批量合成**：并发执行（默认并发 3）、失败容错、可生成 JSON 汇总报告

## 文件结构

```
tts_skill/
├── __init__.py        # 包导出
├── __main__.py        # 支持 python -m tts_skill
├── tts_client.py      # 核心客户端 + CLI
└── README.md          # 本说明
```

## 参考

- TTS 服务页：https://tts.qifei2035.eu.cc/
- OpenAI 兼容协议：[Text-to-Speech API](https://platform.openai.com/docs/api-reference/audio/createSpeech)
- Microsoft Edge TTS 音色文档：https://learn.microsoft.com/azure/ai-services/speech-service/language-support#prebuilt-neural-voices