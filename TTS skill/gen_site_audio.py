"""
为 56 个民族站点批量生成语音素材（调用 tts_skill）。

输出: /Users/foxai/Desktop/56/site/audio/{id}_{name|kid|all}.mp3
音色: zh-CN-XiaoyiNeural（晓伊 · 活泼，适合儿童内容）
已存在的文件自动跳过（幂等，可断点重跑）。

用法:
    /usr/bin/python3 gen_site_audio.py [--force]
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from tts_skill import BatchConfig, BatchItem, OutputTarget, TTSClient  # noqa: E402

VOICE = "zh-CN-XiaoyiNeural"  # 晓伊（活泼）
SPEED = 0.95                   # 稍慢，方便小朋友跟上
PITCH = 1.0

DATA_JSON = Path("/tmp/ethnic_data.json")
AUDIO_DIR = Path("/Users/foxai/Desktop/56/site/audio")
REPORT_JSON = Path("/tmp/tts_report.json")


def clean_tail(s: str) -> str:
    """与前端一致：去掉句尾标点，再用「。」拼接。"""
    return re.sub(r"[。！!？?，,]+$", "", (s or "").strip())


def build_items() -> list[BatchItem]:
    data = json.loads(DATA_JSON.read_text(encoding="utf-8"))
    items: list[BatchItem] = []
    for d in data:
        did = d["id"]
        name = d.get("name", "")
        kid = d.get("kidFact", "")
        costume = d.get("costume", "")
        intro = d.get("intro", "")
        all_text = "。".join(
            clean_tail(x) for x in [name, kid, f"他们的传统服饰：{costume}", intro] if x
        ) + "。"
        for kind, text in (("name", name), ("kid", kid), ("all", all_text)):
            if not text.strip():
                continue
            items.append(
                BatchItem(
                    text=text,
                    voice=VOICE,
                    speed=SPEED,
                    pitch=PITCH,
                    output_basename=f"{did}_{kind}",
                )
            )
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
                f"  · [{r.index + 1}/{len(items)}] {'OK' if r.success else 'FAIL'} "
                f"{r.item.output_basename} ({r.elapsed_s:.1f}s) {r.error or ''}",
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
