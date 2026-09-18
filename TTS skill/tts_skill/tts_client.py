"""
foxai TTS 客户端（基于 OpenAI 兼容接口）
=========================================

功能概述
--------
封装对 https://tts.qifei2035.eu.cc/ 的 TTS 调用，
该站点基于 Microsoft Edge TTS，并提供与 OpenAI `/v1/audio/speech` 兼容的接口。

支持的接口
----------
- GET  /v1/models         验证 API Key 与网络连通性
- POST /v1/audio/speech   合成语音，返回音频二进制

认证方式
--------
使用 `Authorization: Bearer <API_KEY>` Header 鉴权。
本技能内置的默认 API Key = `20200108`（与原始任务描述一致）。

设计要点
--------
1. **错误处理**：网络错误、HTTP 非 200、音频内容为空等都有明确错误信息。
2. **自动重试**：对可重试错误（连接超时、5xx 等）做有限次数的自动重试。
3. **路径探测**：默认保存到 `当前工作目录/test/`；若指定 `--desktop` 则保存到 `~/Desktop/test/`；
   都不存在则自动创建；在非桌面环境下（如 Linux 服务器）自动回退到 `cwd/test/`。
4. **文件名清洗**：移除路径分隔符、不可见字符与超长文件名。
5. **音色库**：内置中文普通话、方言、台湾、粤语、英文男女声等共 60+ 音色枚举。

使用示例
--------
    from tts_skill.tts_client import TTSClient, OutputTarget

    client = TTSClient()
    target = OutputTarget.default()  # 默认当前工作目录下的 test 文件夹
    out = client.synthesize(
        text="你好，欢迎使用 foxai 语音合成",
        voice="zh-CN-XiaoxiaoNeural",
        target=target,
        output_basename="hello",
    )
    print("已保存:", out)

TBD
---
- 该服务当前公开的音色列表来自站点前端代码，可能随 Edge TTS 升级而变动。
- 单次请求文本上限约 15000 字符；超出时会返回 4xx 错误，建议自行分段。
"""

from __future__ import annotations

import json
import os
import re
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Iterable, Optional, Sequence

import urllib.error
import urllib.request


# ---------- 默认配置 ----------

DEFAULT_BASE_URL = "https://tts.qifei2035.eu.cc"
DEFAULT_API_KEY = "20200108"            # 任务中提供的 API Key
DEFAULT_TIMEOUT = 60                    # 单次请求超时（秒）
DEFAULT_MAX_RETRIES = 4                 # 失败重试次数（服务端偶发返回空响应，提高重试可显著改善成功率）
DEFAULT_RETRY_BACKOFF = 1.6             # 退避基数（秒），指数递增
DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural"  # 默认音色：晓晓
DEFAULT_FORMAT = "mp3"                  # 默认音频格式
CHAR_WARN = 10_000                      # 提示阈值
CHAR_LIMIT = 15_000                     # 硬性上限

# ---------- 音色库 ----------
# 来源：站点前端 VOICE_GROUPS（与 Microsoft Edge TTS 保持一致）。
# 如需更新，可执行 `python -m tts_skill.print_voices` 重新打印。

VOICE_GROUPS: list[dict[str, list[dict[str, str]]]] = [
    {"label": "普通话 · 女声", "options": [
        {"value": "zh-CN-XiaoxiaoNeural", "label": "晓晓（多风格 · 最热门）"},
        {"value": "zh-CN-XiaoyiNeural", "label": "晓伊（活泼）"},
        {"value": "zh-CN-XiaochenNeural", "label": "晓辰（开朗）"},
        {"value": "zh-CN-XiaohanNeural", "label": "晓涵（轻松）"},
        {"value": "zh-CN-XiaorouNeural", "label": "晓柔（温柔）"},
        {"value": "zh-CN-XiaoyanNeural", "label": "晓颜（专业）"},
        {"value": "zh-CN-XiaoqiuNeural", "label": "晓秋（沉稳）"},
        {"value": "zh-CN-XiaozhenNeural", "label": "晓甄（激情）"},
        {"value": "zh-CN-XiaomengNeural", "label": "晓梦（甜美清新）"},
        {"value": "zh-CN-XiaomoNeural", "label": "晓墨（多变表现力）"},
        {"value": "zh-CN-XiaoruiNeural", "label": "晓睿（年长）"},
        {"value": "zh-CN-XiaoshuangNeural", "label": "晓双（儿童）"},
        {"value": "zh-CN-XiaoyouNeural", "label": "晓悠（儿童）"},
    ]},
    {"label": "普通话 · 男声", "options": [
        {"value": "zh-CN-YunyangNeural", "label": "云扬（专业 · 最热门）"},
        {"value": "zh-CN-YunxiNeural", "label": "云希（阳光）"},
        {"value": "zh-CN-YunjianNeural", "label": "云健（激情）"},
        {"value": "zh-CN-YunjieNeural", "label": "云杰（自然随性）"},
        {"value": "zh-CN-YunfengNeural", "label": "云枫（沉稳磁性）"},
        {"value": "zh-CN-YunhaoNeural", "label": "云皓（阳光活力）"},
        {"value": "zh-CN-YunzeNeural", "label": "云泽（浑厚）"},
        {"value": "zh-CN-YunyeNeural", "label": "云野（豪迈粗犷）"},
        {"value": "zh-CN-YunxiaNeural", "label": "云夏（儿童）"},
    ]},
    {"label": "地方方言", "options": [
        {"value": "zh-CN-liaoning-XiaobeiNeural", "label": "晓北（辽宁 · 女）"},
        {"value": "zh-CN-liaoning-YunbiaoNeural", "label": "云彪（辽宁 · 男）"},
        {"value": "zh-CN-shaanxi-XiaoniNeural", "label": "晓妮（陕西 · 女）"},
        {"value": "zh-CN-henan-YundengNeural", "label": "云登（河南 · 男）"},
        {"value": "zh-CN-shandong-YunxiangNeural", "label": "云翔（山东 · 男）"},
        {"value": "zh-CN-sichuan-YunxiNeural", "label": "云希（四川 · 男）"},
        {"value": "zh-CN-guangxi-YunqiNeural", "label": "云琦（广西 · 男）"},
    ]},
    {"label": "台湾普通话", "options": [
        {"value": "zh-TW-HsiaoChenNeural", "label": "曉臻（女）"},
        {"value": "zh-TW-HsiaoYuNeural", "label": "曉雨（女）"},
        {"value": "zh-TW-YunJheNeural", "label": "雲哲（男）"},
    ]},
    {"label": "粤语（香港）", "options": [
        {"value": "zh-HK-HiuMaanNeural", "label": "曉曼（女）"},
        {"value": "zh-HK-HiuGaaiNeural", "label": "曉佳（女）"},
        {"value": "zh-HK-WanLungNeural", "label": "雲龍（男）"},
    ]},
    {"label": "英文 · 女声 (en-US)", "options": [
        {"value": "en-US-JennyNeural", "label": "Jenny（最热门）"},
        {"value": "en-US-AriaNeural", "label": "Aria"},
        {"value": "en-US-MichelleNeural", "label": "Michelle"},
        {"value": "en-US-MonicaNeural", "label": "Monica"},
        {"value": "en-US-NancyNeural", "label": "Nancy"},
        {"value": "en-US-SaraNeural", "label": "Sara"},
        {"value": "en-US-AmberNeural", "label": "Amber"},
        {"value": "en-US-AshleyNeural", "label": "Ashley"},
        {"value": "en-US-CoraNeural", "label": "Cora"},
        {"value": "en-US-ElizabethNeural", "label": "Elizabeth"},
        {"value": "en-US-JaneNeural", "label": "Jane"},
        {"value": "en-US-AnaNeural", "label": "Ana（儿童）"},
    ]},
    {"label": "英文 · 男声 (en-US)", "options": [
        {"value": "en-US-GuyNeural", "label": "Guy（最热门）"},
        {"value": "en-US-DavisNeural", "label": "Davis"},
        {"value": "en-US-ChristopherNeural", "label": "Christopher"},
        {"value": "en-US-EricNeural", "label": "Eric"},
        {"value": "en-US-RogerNeural", "label": "Roger"},
        {"value": "en-US-SteffanNeural", "label": "Steffan"},
        {"value": "en-US-BrandonNeural", "label": "Brandon"},
        {"value": "en-US-JasonNeural", "label": "Jason"},
        {"value": "en-US-TonyNeural", "label": "Tony"},
        {"value": "en-US-JacobNeural", "label": "Jacob"},
    ]},
]

# 将所有合法 voice id 展平成集合，便于校验
VALID_VOICES: set[str] = {
    opt["value"] for group in VOICE_GROUPS for opt in group["options"]
}


# ---------- 数据类型 ----------

@dataclass
class OutputTarget:
    """描述音频保存的目标目录与命名风格。"""
    directory: Path
    use_desktop: bool = False        # 是否显式要求写到桌面（题目原始要求）

    @classmethod
    def default(cls) -> "OutputTarget":
        """默认保存到当前工作目录下的 test 文件夹。"""
        return cls(directory=Path.cwd() / "test", use_desktop=False)

    @classmethod
    def desktop(cls) -> "OutputTarget":
        """保存到 ~/Desktop/test；若桌面不存在则回退到 cwd/test。"""
        home = Path.home()
        desktop = home / "Desktop"
        if (desktop / "test").exists() or desktop.exists():
            return cls(directory=desktop / "test", use_desktop=True)
        # 桌面不存在（Linux 服务器等）则回退
        return cls(directory=Path.cwd() / "test", use_desktop=False)

    def ensure(self) -> Path:
        """确保目录存在；若当前路径不可写则自动回退到 cwd/test/，并打印提示。"""
        try:
            self.directory.mkdir(parents=True, exist_ok=True)
            # 进一步确认可写（mkdir 在 sandbox 受限场景下可能成功但后续写文件失败）
            # 探测文件名带线程标识，避免并发时互相 unlink 对方的探测文件，
            # 导致 FileNotFoundError 被误判为「目录不可写」而错误回退（批量并发场景）。
            probe = self.directory / f".tts_write_probe_{os.getpid()}_{threading.get_ident()}"
            try:
                probe.write_text("ok")
            except OSError:
                raise PermissionError(f"目录 {self.directory} 不可写")
            finally:
                try:
                    probe.unlink()
                except OSError:
                    pass  # 已被清理或写入本身就失败
            return self.directory
        except (OSError, PermissionError) as e:
            # 自动回退到 cwd/test/
            fallback = Path.cwd() / "test"
            print(
                f"[提示] 无法使用目录 {self.directory}（{e}）。"
                f"已自动回退到 {fallback}。",
                file=sys.stderr,
            )
            self.directory = fallback
            fallback.mkdir(parents=True, exist_ok=True)
            self.use_desktop = False
            return self.directory


@dataclass
class TTSConfig:
    """TTS 请求所需配置。"""
    base_url: str = DEFAULT_BASE_URL
    api_key: str = DEFAULT_API_KEY
    timeout: float = DEFAULT_TIMEOUT
    max_retries: int = DEFAULT_MAX_RETRIES
    retry_backoff: float = DEFAULT_RETRY_BACKOFF
    user_agent: str = "foxai-tts-skill/1.0 (+https://tts.qifei2035.eu.cc/)"


# ---------- 异常类型 ----------

class TTSError(Exception):
    """所有 TTS 相关异常的基类。"""

class TTSAuthError(TTSError):
    """API Key 鉴权失败（401/403）。"""

class TTSServerError(TTSError):
    """服务端错误（5xx）。"""

class TTSBadRequest(TTSError):
    """请求参数错误（4xx 但非鉴权）。"""

class TTSEmptyAudio(TTSError):
    """返回内容为空。"""

class TTSNetworkError(TTSError):
    """网络层错误（DNS、连接超时等）。"""


# ---------- 批量类型 ----------

@dataclass
class BatchItem:
    """单条批量合成任务。"""
    text: str
    voice: str = DEFAULT_VOICE
    speed: float = 1.0
    pitch: float = 1.0
    response_format: str = DEFAULT_FORMAT
    cleaning_options: Optional[dict[str, Any]] = None
    output_basename: Optional[str] = None  # 为空则按 idx 自动生成


@dataclass
class BatchItemResult:
    """单条任务的执行结果。"""
    item: BatchItem
    index: int
    success: bool
    path: Optional[Path] = None
    error: Optional[str] = None
    elapsed_s: float = 0.0


@dataclass
class BatchConfig:
    """批量合成控制选项。"""
    concurrency: int = 3                # 并发请求数（建议 ≤ 5，避免触发限流）
    fail_fast: bool = False             # 是否遇到首条失败立即中止后续任务
    on_progress: Optional[Callable[[BatchItemResult], None]] = None  # 单条完成回调


@dataclass
class BatchReport:
    """批量合成结果汇总。"""
    total: int
    succeeded: int
    failed: int
    results: list[BatchItemResult]
    elapsed_s: float

    @property
    def success_results(self) -> list[BatchItemResult]:
        return [r for r in self.results if r.success]

    @property
    def failed_results(self) -> list[BatchItemResult]:
        return [r for r in self.results if not r.success]

    def to_dict(self) -> dict[str, Any]:
        """序列化为 JSON 友好的字典。"""
        return {
            "total": self.total,
            "succeeded": self.succeeded,
            "failed": self.failed,
            "elapsed_s": round(self.elapsed_s, 3),
            "results": [
                {
                    "index": r.index,
                    "success": r.success,
                    "voice": r.item.voice,
                    "text": r.item.text,
                    "path": str(r.path) if r.path else None,
                    "error": r.error,
                    "elapsed_s": round(r.elapsed_s, 3),
                }
                for r in self.results
            ],
        }


# ---------- 客户端 ----------

class TTSClient:
    """TTS 客户端。无第三方依赖，仅使用 Python 标准库 urllib。"""

    def __init__(self, config: Optional[TTSConfig] = None):
        self.config = config or TTSConfig()

    # ----- 公共方法 -----

    def list_models(self) -> list[dict[str, Any]]:
        """调用 /v1/models，返回原始模型列表，用于鉴权与连通性自检。"""
        url = self._url("/v1/models")
        req = self._build_request("GET", url)
        with urllib.request.urlopen(req, timeout=self.config.timeout) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
        return payload.get("data", [])

    def ping(self) -> bool:
        """快速连通性测试：成功返回 True，失败抛出 TTSError。"""
        try:
            models = self.list_models()
            return bool(models)
        except urllib.error.HTTPError as e:
            if e.code in (401, 403):
                raise TTSAuthError(
                    "API Key 鉴权失败（HTTP {}）。请检查 API Key 是否正确。".format(e.code)
                ) from e
            raise TTSError("连通性测试失败：HTTP {}".format(e.code)) from e
        except urllib.error.URLError as e:
            raise TTSNetworkError(
                "无法连接到 TTS 服务（{}）。请检查网络或站点状态。".format(e.reason)
            ) from e

    def synthesize(
        self,
        text: str,
        voice: str = DEFAULT_VOICE,
        *,
        speed: float = 1.0,
        pitch: float = 1.0,
        response_format: str = DEFAULT_FORMAT,
        cleaning_options: Optional[dict[str, Any]] = None,
        stream: bool = False,
        target: Optional[OutputTarget] = None,
        output_basename: Optional[str] = None,
    ) -> Path:
        """
        合成语音并保存到本地。

        Parameters
        ----------
        text : 待合成文本（必填）
        voice : 音色 ID（必填，可传入已知 ID 或任意服务端支持的字符串）
        speed : 语速倍率，默认 1.0
        pitch : 音调倍率，默认 1.0
        response_format : 输出格式（mp3 / wav / opus / pcm ...）
        cleaning_options : 文本清洗选项（可选）
        target : 输出目录，默认当前工作目录/test/
        output_basename : 自定义文件名（不含扩展名）；为空则按时间戳+音色生成

        Returns
        -------
        保存到的本地文件路径（Path）
        """
        # 1. 参数校验
        cleaned_text = (text or "").strip()
        if not cleaned_text:
            raise TTSBadRequest("文本为空或仅含空白，拒绝合成。")
        if len(cleaned_text) > CHAR_LIMIT:
            raise TTSBadRequest(
                f"文本长度 {len(cleaned_text)} 超过服务端上限 {CHAR_LIMIT}，请自行分段。"
            )
        if not voice:
            raise TTSBadRequest("未指定音色（voice/speaker）。")
        # 校验音色（仅提示，不强制）：未知音色依旧透传，由服务端决定
        if voice not in VALID_VOICES:
            print(
                f"[提示] 音色 '{voice}' 不在已知音色列表中（可能是新增或自定义），"
                "将继续尝试调用；如服务端返回错误请更换为已知音色。",
                file=sys.stderr,
            )

        # 2. 构造请求体（保持与前端一致的字段）
        body: dict[str, Any] = {
            "voice": voice,
            "input": cleaned_text,
            "speed": float(speed),
            "pitch": float(pitch),
            "response_format": response_format,
            "stream": bool(stream),
        }
        if cleaning_options:
            body["cleaning_options"] = cleaning_options

        # 3. 发送请求（带重试）
        audio_bytes = self._post_audio(body)

        if not audio_bytes:
            raise TTSEmptyAudio("服务端返回的音频内容为空。")

        # 4. 保存到目标目录
        target = target or OutputTarget.default()
        target.ensure()
        basename = self._make_basename(
            user_basename=output_basename,
            voice=voice,
            extension=response_format,
        )
        out_path = target.directory / basename
        # 防止重名覆盖：若已存在则加序号
        out_path = self._dedup_path(out_path)
        out_path.write_bytes(audio_bytes)
        return out_path

    def synthesize_batch(
        self,
        items: Sequence[BatchItem],
        *,
        target: Optional[OutputTarget] = None,
        config: Optional[BatchConfig] = None,
    ) -> BatchReport:
        """
        并发批量合成。

        Parameters
        ----------
        items : BatchItem 列表
        target : 输出目录（所有结果共用同一目标目录）
        config : 批量控制（并发度、失败策略、进度回调）

        Returns
        -------
        BatchReport : 包含每条任务的执行结果与汇总
        """
        if not items:
            return BatchReport(total=0, succeeded=0, failed=0, results=[], elapsed_s=0.0)

        cfg = config or BatchConfig()
        target = target or OutputTarget.default()
        target.ensure()

        started = time.monotonic()
        results: list[BatchItemResult] = []
        first_failure: Optional[BatchItemResult] = None

        # 顺序预占 results 槽位，便于按原顺序输出报告
        results = [None] * len(items)  # type: ignore[list-item]

        with ThreadPoolExecutor(max_workers=max(1, cfg.concurrency)) as ex:
            future_to_idx = {}
            for idx, item in enumerate(items):
                fut = ex.submit(
                    self._run_one_batch_item,
                    idx=idx,
                    item=item,
                    target=target,
                )
                future_to_idx[fut] = idx

            for fut in as_completed(future_to_idx):
                idx = future_to_idx[fut]
                result = fut.result()
                results[idx] = result
                if cfg.on_progress is not None:
                    try:
                        cfg.on_progress(result)
                    except Exception:  # 回调出错不应影响整体
                        pass
                if not result.success and first_failure is None:
                    first_failure = result
                    if cfg.fail_fast:
                        # 取消尚未开始的任务
                        ex.shutdown(wait=False, cancel_futures=True)
                        break

        # 清理：失败 fast 模式下未执行的槽位标记为 cancelled
        for i, r in enumerate(results):
            if r is None:
                cancelled_item = items[i]
                results[i] = BatchItemResult(
                    item=cancelled_item,
                    index=i,
                    success=False,
                    error="cancelled (fail_fast)",
                )

        elapsed = time.monotonic() - started
        succ = sum(1 for r in results if r.success)
        return BatchReport(
            total=len(items),
            succeeded=succ,
            failed=len(items) - succ,
            results=results,           # type: ignore[arg-type]
            elapsed_s=elapsed,
        )

    def _run_one_batch_item(
        self,
        *,
        idx: int,
        item: BatchItem,
        target: OutputTarget,
    ) -> BatchItemResult:
        """单条任务的执行包装：捕获异常，计时，产出 BatchItemResult。"""
        # 自动 basename：若用户未指定，则按 index+voice 生成
        basename = item.output_basename or f"batch_{idx:03d}_{TTSClient._safe_filename(item.voice)}"
        t0 = time.monotonic()
        try:
            path = self.synthesize(
                text=item.text,
                voice=item.voice,
                speed=item.speed,
                pitch=item.pitch,
                response_format=item.response_format,
                cleaning_options=item.cleaning_options,
                target=target,
                output_basename=basename,
            )
            return BatchItemResult(
                item=item,
                index=idx,
                success=True,
                path=path,
                elapsed_s=time.monotonic() - t0,
            )
        except TTSError as e:
            return BatchItemResult(
                item=item,
                index=idx,
                success=False,
                error=str(e),
                elapsed_s=time.monotonic() - t0,
            )
        except Exception as e:
            return BatchItemResult(
                item=item,
                index=idx,
                success=False,
                error=f"unexpected: {e!r}",
                elapsed_s=time.monotonic() - t0,
            )

    # ----- 内部方法 -----

    def _url(self, path: str) -> str:
        return self.config.base_url.rstrip("/") + path

    def _build_request(
        self,
        method: str,
        url: str,
        body: Optional[bytes] = None,
        extra_headers: Optional[dict[str, str]] = None,
    ) -> urllib.request.Request:
        headers = {
            "Authorization": "Bearer " + self.config.api_key,
            "User-Agent": self.config.user_agent,
        }
        if body is not None:
            headers["Content-Type"] = "application/json"
        if extra_headers:
            headers.update(extra_headers)
        req = urllib.request.Request(url, data=body, headers=headers, method=method)
        return req

    def _post_audio(self, body: dict[str, Any]) -> bytes:
        """POST 请求 /v1/audio/speech，含自动重试。"""
        url = self._url("/v1/audio/speech")
        payload = json.dumps(body).encode("utf-8")

        last_exc: Optional[Exception] = None
        for attempt in range(self.config.max_retries + 1):
            try:
                req = self._build_request("POST", url, body=payload)
                with urllib.request.urlopen(req, timeout=self.config.timeout) as resp:
                    return resp.read()
            except urllib.error.HTTPError as e:
                # 读取响应体，便于错误诊断
                err_body = ""
                try:
                    err_body = e.read().decode("utf-8", errors="replace")
                except Exception:
                    pass
                last_exc = self._classify_http_error(e, err_body)
                # 4xx 中只有 408/429 可重试；其他立即抛出
                if isinstance(last_exc, (TTSAuthError, TTSBadRequest)):
                    if e.code in (408, 429):
                        # 可重试的错误，继续走退避
                        pass
                    else:
                        raise last_exc from e
                # 5xx 抛 TTSServerError，继续重试
            except urllib.error.URLError as e:
                last_exc = TTSNetworkError(
                    "网络错误：{}".format(getattr(e, "reason", e))
                )
            except TimeoutError as e:
                last_exc = TTSNetworkError(f"请求超时（>{self.config.timeout}s）")
            except Exception as e:  # 兜底
                last_exc = TTSError(f"未知错误：{e!r}")

            # 退避后重试
            if attempt < self.config.max_retries:
                wait = self.config.retry_backoff ** attempt
                time.sleep(wait)

        # 重试耗尽
        assert last_exc is not None
        raise last_exc

    @staticmethod
    def _classify_http_error(e: urllib.error.HTTPError, err_body: str) -> TTSError:
        msg = err_body.strip() or e.reason
        try:
            parsed = json.loads(err_body)
            # OpenAI 风格错误体：{"error": {"message": "...", "type": "..."}}
            if isinstance(parsed, dict) and "error" in parsed:
                inner = parsed["error"]
                if isinstance(inner, dict) and "message" in inner:
                    msg = inner["message"]
                elif isinstance(inner, str):
                    msg = inner
        except (ValueError, TypeError):
            pass

        if e.code in (401, 403):
            return TTSAuthError(f"鉴权失败（HTTP {e.code}）：{msg}")
        if e.code == 429:
            return TTSBadRequest(f"请求过于频繁（HTTP 429）：{msg}")
        if 400 <= e.code < 500:
            return TTSBadRequest(f"请求参数错误（HTTP {e.code}）：{msg}")
        return TTSServerError(f"服务端错误（HTTP {e.code}）：{msg}")

    @staticmethod
    def _make_basename(
        user_basename: Optional[str],
        voice: str,
        extension: str,
    ) -> str:
        if user_basename:
            stem = TTSClient._safe_filename(user_basename)
        else:
            ts = time.strftime("%Y%m%d-%H%M%S")
            stem = f"tts-{ts}-{TTSClient._safe_filename(voice)}"
        return f"{stem}.{extension}"

    @staticmethod
    def _safe_filename(name: str) -> str:
        """清洗文件名：去除路径分隔符与控制字符，长度上限 80。"""
        name = name.strip() or "tts"
        # 去除路径分隔符
        name = re.sub(r"[\\/:*?\"<>|\x00-\x1f]", "_", name)
        # 多个空格/下划线折叠
        name = re.sub(r"[\s_]+", "_", name).strip("._")
        return (name or "tts")[:80]

    @staticmethod
    def _dedup_path(path: Path) -> Path:
        """若文件已存在，自动加 _1, _2... 后缀。"""
        if not path.exists():
            return path
        stem, suffix = path.stem, path.suffix
        i = 1
        while True:
            cand = path.with_name(f"{stem}_{i}{suffix}")
            if not cand.exists():
                return cand
            i += 1


# ---------- CLI 入口 ----------

def _print_all_voices() -> None:
    for group in VOICE_GROUPS:
        print(f"\n## {group['label']}")
        for opt in group["options"]:
            print(f"  {opt['value']:<32}  {opt['label']}")


def _build_argparser():
    import argparse

    p = argparse.ArgumentParser(
        prog="tts",
        description="foxai TTS 客户端（OpenAI 兼容接口）",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "示例：\n"
            "  # 单条\n"
            "  python -m tts_skill.tts_client -t '你好，世界' -v zh-CN-XiaoxiaoNeural\n"
            "  python -m tts_skill.tts_client -t 'Hello' -v en-US-JennyNeural --desktop\n"
            "  # 批量（命令行多次 -t）\n"
            "  python -m tts_skill.tts_client -t '文本1' -v zh-CN-XiaoxiaoNeural \\\n"
            "                                    -t '文本2' -v en-US-JennyNeural --concurrency 3\n"
            "  # 批量（JSON 文件）\n"
            "  python -m tts_skill.tts_client --batch-file items.json --report report.json\n"
            "  # 其他\n"
            "  python -m tts_skill.tts_client --list-voices\n"
            "  python -m tts_skill.tts_client --ping\n"
        ),
    )
    p.add_argument(
        "-t", "--text", action="append", default=[],
        help="待合成文本，可重复指定以批量合成。批量模式下，-v/--speed/--pitch 仅作为默认音色与参数覆盖。",
    )
    p.add_argument("-v", "--voice", default=DEFAULT_VOICE, help="音色 ID，默认 zh-CN-XiaoxiaoNeural")
    p.add_argument("--speed", type=float, default=1.0, help="语速倍率，默认 1.0")
    p.add_argument("--pitch", type=float, default=1.0, help="音调倍率，默认 1.0")
    p.add_argument("--format", default=DEFAULT_FORMAT, help="音频格式：mp3/wav/opus/pcm，默认 mp3")
    p.add_argument("-o", "--output", help="自定义文件名（不含扩展名），仅单条模式生效")
    p.add_argument("--desktop", action="store_true", help="保存到 ~/Desktop/test/（若桌面不存在则回退到 cwd/test/）")
    p.add_argument("--list-voices", action="store_true", help="打印所有支持的音色并退出")
    p.add_argument("--ping", action="store_true", help="仅做连通性测试并退出")
    p.add_argument("--retries", type=int, default=DEFAULT_MAX_RETRIES, help=f"失败重试次数，默认 {DEFAULT_MAX_RETRIES}")
    # 批量相关
    p.add_argument(
        "--batch-file", type=str, default=None,
        help="批量任务 JSON 文件路径。文件结构: [{\"text\":..., \"voice\":..., \"speed\":..., \"pitch\":..., \"output_basename\":...}, ...]",
    )
    p.add_argument(
        "--concurrency", type=int, default=3,
        help="批量模式下的并发数（默认 3，建议 ≤ 5 避免触发限流）",
    )
    p.add_argument(
        "--fail-fast", action="store_true",
        help="批量模式下，首条失败立即中止后续任务",
    )
    p.add_argument(
        "--report", type=str, default=None,
        help="批量模式：把结果汇总写入 JSON 报告文件",
    )
    return p


def _load_batch_items(args) -> list[BatchItem]:
    """根据命令行参数解析出 BatchItem 列表。

    规则：
    1. 若 --batch-file 存在，从 JSON 读取；其它 CLI 参数仅作为默认填充。
    2. 否则若多次 -t：每条 -t 合成一条任务，音色为 -v（每条也可用 --voice-N 单独覆盖，见下）。
       为保持简单，命令行模式所有条目共用同一 voice/speed/pitch/format。
    3. 否则返回空列表（CLI 应进入单条模式）。
    """
    # --- 1. 从 JSON 文件 ---
    if args.batch_file:
        path = Path(args.batch_file)
        if not path.exists():
            raise TTSBadRequest(f"批量文件不存在：{path}")
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            raise TTSBadRequest(f"批量文件 JSON 解析失败：{e}") from e
        if not isinstance(data, list):
            raise TTSBadRequest("批量文件必须是 JSON 数组")
        items: list[BatchItem] = []
        for i, raw in enumerate(data):
            if not isinstance(raw, dict):
                raise TTSBadRequest(f"第 {i} 项不是对象：{raw!r}")
            items.append(BatchItem(
                text=str(raw.get("text", "")),
                voice=str(raw.get("voice", args.voice)),
                speed=float(raw.get("speed", args.speed)),
                pitch=float(raw.get("pitch", args.pitch)),
                response_format=str(raw.get("response_format", args.format)),
                cleaning_options=raw.get("cleaning_options"),
                output_basename=raw.get("output_basename"),
            ))
        return items

    # --- 2. 从命令行重复 -t ---
    if args.text:
        return [
            BatchItem(
                text=t,
                voice=args.voice,
                speed=args.speed,
                pitch=args.pitch,
                response_format=args.format,
            )
            for t in args.text
        ]

    return []


def _print_batch_report(report: BatchReport, stream=sys.stdout) -> None:
    """把批量报告以人类友好的表格形式输出到给定流。"""
    print("", file=stream)
    print(f"=== 批量合成报告 ===", file=stream)
    print(f"  总数:   {report.total}", file=stream)
    print(f"  成功:   {report.succeeded}", file=stream)
    print(f"  失败:   {report.failed}", file=stream)
    print(f"  总耗时: {report.elapsed_s:.2f}s", file=stream)
    print("", file=stream)
    for r in report.results:
        status = "OK " if r.success else "FAIL"
        idx = f"#{r.index:03d}"
        voice = r.item.voice
        text_preview = r.item.text[:40] + ("..." if len(r.item.text) > 40 else "")
        if r.success:
            print(f"  [{status}] {idx} {voice:<32}  -> {r.path}  ({r.elapsed_s:.2f}s)  | {text_preview}", file=stream)
        else:
            print(f"  [{status}] {idx} {voice:<32}  -> ERROR: {r.error}  ({r.elapsed_s:.2f}s)  | {text_preview}", file=stream)


def main(argv: Optional[Iterable[str]] = None) -> int:
    parser = _build_argparser()
    args = parser.parse_args(list(argv) if argv is not None else None)

    if args.list_voices:
        _print_all_voices()
        return 0

    client = TTSClient(TTSConfig(max_retries=max(0, args.retries)))

    if args.ping:
        try:
            models = client.list_models()
            print(f"连通性 OK，共 {len(models)} 个模型。")
            return 0
        except TTSError as e:
            print(f"连通性失败：{e}", file=sys.stderr)
            return 2

    # 解析批量任务
    try:
        items = _load_batch_items(args)
    except TTSError as e:
        print(f"批量配置错误：{e}", file=sys.stderr)
        return 1

    target = OutputTarget.desktop() if args.desktop else OutputTarget.default()

    # ----- 单条模式 -----
    if not items and not args.batch_file:
        if not args.text:
            parser.print_help()
            print("\n错误：缺少 -t/--text 或 --batch-file。", file=sys.stderr)
            return 1
        # 理论上 args.text 此时为 [] 但走到这里说明没有 -t，进入打印帮助
        parser.print_help()
        print("\n错误：缺少 -t/--text 或 --batch-file。", file=sys.stderr)
        return 1

    # ----- 单条（兼容旧行为：只有一条且非 --batch-file） -----
    if len(items) == 1 and not args.batch_file:
        item = items[0]
        try:
            out = client.synthesize(
                text=item.text,
                voice=item.voice,
                speed=item.speed,
                pitch=item.pitch,
                response_format=item.response_format,
                target=target,
                output_basename=args.output or item.output_basename,
            )
        except TTSError as e:
            print(f"合成失败：{e}", file=sys.stderr)
            return 3
        print(str(out))
        return 0

    # ----- 批量模式 -----
    batch_cfg = BatchConfig(
        concurrency=max(1, args.concurrency),
        fail_fast=args.fail_fast,
        on_progress=lambda r: print(
            f"  · [{r.index + 1}/{len(items)}] "
            f"{'OK' if r.success else 'FAIL'} "
            f"{r.item.voice} "
            f"({r.elapsed_s:.1f}s)",
            file=sys.stderr,
        ),
    )

    print(
        f"开始批量合成：{len(items)} 条任务，并发={batch_cfg.concurrency}，"
        f"fail_fast={batch_cfg.fail_fast}",
        file=sys.stderr,
    )

    try:
        report = client.synthesize_batch(items, target=target, config=batch_cfg)
    except TTSError as e:
        print(f"批量合成失败：{e}", file=sys.stderr)
        return 3

    _print_batch_report(report, stream=sys.stderr)
    if args.report:
        Path(args.report).write_text(
            json.dumps(report.to_dict(), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"\n报告已写入：{args.report}", file=sys.stderr)

    return 0 if report.failed == 0 else 4


if __name__ == "__main__":
    sys.exit(main())