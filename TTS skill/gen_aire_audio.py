"""
为「起飞航空」(airE) 站点批量生成语音素材（调用 tts_skill）。

数据源: ../src/stores/courseStore.ts（M1-M5 模块的词汇与句型，直接解析保持同步）
输出:   ../public/audio/{id}_{word|example|en|zh}.mp3
音色:   en-US-JennyNeural（英文 · 清晰女声，适合教学）
        zh-CN-XiaoyiNeural（晓伊 · 活泼，适合儿童内容）
已存在的文件自动跳过（幂等，可断点重跑）。

用法:
    /Library/Developer/CommandLineTools/usr/bin/python3 gen_aire_audio.py [--force]

说明:
    系统默认 /usr/bin/python3 受 Xcode 许可限制时，可用 CommandLineTools 自带的解释器。
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from tts_skill import BatchConfig, BatchItem, OutputTarget, TTSClient  # noqa: E402

EN_VOICE = "en-US-JennyNeural"   # Jenny（英文 · 最热门，清晰）
ZH_VOICE = "zh-CN-XiaoyiNeural"  # 晓伊（活泼）
SPEED = 0.9                      # 稍慢，方便小朋友跟上（与原 speech.ts rate=0.9 一致）

COURSE_STORE = Path(__file__).resolve().parent.parent / "src/stores/courseStore.ts"
AUDIO_DIR = Path(__file__).resolve().parent.parent / "public/audio"
REPORT_JSON = Path("/tmp/tts_aire_report.json")


def tts_text(text: str) -> str:
    """TTS 朗读文本规范化：航空读法中数字逐位朗读（如 090 -> zero nine zero）。"""
    return text.replace("090", "zero nine zero")


def parse_course_store() -> tuple[list[dict], list[dict]]:
    """从 courseStore.ts 解析词汇与句型（文件格式规整，正则提取即可）。"""
    src = COURSE_STORE.read_text(encoding="utf-8")
    vocab_re = re.compile(
        r"\{\s*id:\s*'(?P<id>[^']+)'.*?"
        r"word:\s*'(?P<word>[^']*)'.*?"
        r"exampleSentence:\s*'(?P<example>[^']*)'\s*,?\s*\}"
    )
    sent_re = re.compile(
        r"\{\s*id:\s*'(?P<id>[^']+)'.*?"
        r"english:\s*'(?P<en>[^']*)'.*?"
        r"chinese:\s*'(?P<zh>[^']*)'\s*,?\s*\}"
    )
    vocabs = [m.groupdict() for m in vocab_re.finditer(src)]
    sents = [m.groupdict() for m in sent_re.finditer(src)]
    return vocabs, sents


def build_items() -> list[BatchItem]:
    vocabs, sents = parse_course_store()
    items: list[BatchItem] = []
    for v in vocabs:
        if v["word"]:
            items.append(BatchItem(
                text=tts_text(v["word"]), voice=EN_VOICE, speed=SPEED,
                output_basename=f"{v['id']}_word",
            ))
        if v["example"]:
            items.append(BatchItem(
                text=tts_text(v["example"]), voice=EN_VOICE, speed=SPEED,
                output_basename=f"{v['id']}_example",
            ))
    for s in sents:
        if s["en"]:
            items.append(BatchItem(
                text=tts_text(s["en"]), voice=EN_VOICE, speed=SPEED,
                output_basename=f"{s['id']}_en",
            ))
        if s["zh"]:
            items.append(BatchItem(
                text=s["zh"], voice=ZH_VOICE, speed=SPEED,
                output_basename=f"{s['id']}_zh",
            ))
    return items


def main() -> int:
    force = "--force" in sys.argv
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    items = build_items()
    if not force:
        items = [i for i in items if not (AUDIO_DIR / f"{i.output_basename}.mp3").exists()]
    print(f"待合成: {len(items)} 条 -> {AUDIO_DIR}", file=sys.stderr)
    if not items:
        print("全部已存在，无需生成。", file=sys.stderr)
        return 0

    client = TTSClient()
    report = client.synthesize_batch(
        items,
        target=OutputTarget(directory=AUDIO_DIR),
        config=BatchConfig(
            concurrency=4,
            fail_fast=False,
            on_progress=lambda r: print(
                f"  · [{'OK' if r.success else 'FAIL'}] {r.item.output_basename} "
                f"({r.elapsed_s:.1f}s) {r.error or ''}",
                file=sys.stderr,
            ),
        ),
    )
    REPORT_JSON.write_text(
        json.dumps(report.to_dict(), ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(
        f"完成: 成功 {report.succeeded}/{report.total}，失败 {report.failed}，"
        f"耗时 {report.elapsed_s:.1f}s；报告: {REPORT_JSON}",
        file=sys.stderr,
    )
    return 0 if report.failed == 0 else 4


if __name__ == "__main__":
    sys.exit(main())
