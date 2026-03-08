#!/usr/bin/env python3
"""
정보보안기사 기출문제 PDF 파서
data/parsed/security-engineer/ 에 JSON 저장
"""

import os
import re
import json
import sys
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    print("pdfplumber 필요: pip3 install pdfplumber")
    sys.exit(1)

ROOT = Path(__file__).parent.parent
FILES_DIR = ROOT / "files"
OUT_DIR = ROOT / "data" / "parsed" / "security-engineer"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# 파일명에서 날짜 파싱
DATE_RE = re.compile(r'(\d{8})')

# 과목명 매핑
SUBJECTS = [
    "시스템 보안",
    "네트워크 보안",
    "애플리케이션 보안",
    "정보보안 일반",
    "정보보안 관리 및 법규",
]


def extract_column_text(page, col_split=285) -> tuple[str, str]:
    """페이지를 두 컬럼으로 분리해 텍스트 추출 (y 순서 유지)"""
    words = page.extract_words(keep_blank_chars=False, x_tolerance=3, y_tolerance=3)
    # 각 단어를 좌/우 컬럼으로 분류
    left_words = [(w['top'], w['x0'], w['text']) for w in words if w['x0'] < col_split]
    right_words = [(w['top'], w['x0'], w['text']) for w in words if w['x0'] >= col_split]

    def words_to_lines(word_list):
        if not word_list:
            return ""
        word_list.sort(key=lambda x: (round(x[0] / 5) * 5, x[1]))
        lines = []
        cur_y, cur_line = None, []
        for top, x, text in word_list:
            bucketed = round(top / 5) * 5
            if cur_y is None or abs(bucketed - cur_y) > 5:
                if cur_line:
                    lines.append(" ".join(cur_line))
                cur_y = bucketed
                cur_line = [text]
            else:
                cur_line.append(text)
        if cur_line:
            lines.append(" ".join(cur_line))
        return "\n".join(lines)

    return words_to_lines(left_words), words_to_lines(right_words)


def parse_questions_from_text(text: str, start_num: int = 1) -> list[dict]:
    """텍스트에서 문제 파싱"""
    questions = []

    # 문제 번호 패턴: "1.", "10.", 등
    q_pattern = re.compile(
        r'(?:^|\n)\s*(\d+)\.\s+'
        r'(.*?)(?=\n\s*\d+\.\s+|\Z)',
        re.DOTALL
    )

    option_map = {
        '①': 1, '②': 2, '③': 3, '④': 4,
        '⓵': 1, '⓶': 2, '⓷': 3, '⓸': 4,
    }

    for m in q_pattern.finditer(text):
        num = int(m.group(1))
        body = m.group(2).strip()

        if num < 1 or num > 200:
            continue

        # 보기 분리
        option_pattern = re.compile(r'[①②③④]')
        parts = option_pattern.split(body)
        option_markers = option_pattern.findall(body)

        question_text = parts[0].strip()
        options = []
        for i, marker in enumerate(option_markers):
            opt_text = parts[i + 1].strip() if i + 1 < len(parts) else ""
            # 줄바꿈 정리
            opt_text = re.sub(r'\s+', ' ', opt_text)
            options.append({
                "no": option_map.get(marker, i + 1),
                "text": opt_text
            })

        question_text = re.sub(r'\s+', ' ', question_text)

        if question_text and len(options) >= 2:
            questions.append({
                "no": num,
                "question": question_text,
                "options": options,
                "answer": None,  # 학생용엔 정답 없음
                "explanation": None,
            })

    return questions


def guess_subject(q_no: int, total_per_subject=20) -> str:
    """문제 번호로 과목 추정 (각 과목 20문제)"""
    idx = (q_no - 1) // total_per_subject
    return SUBJECTS[idx] if idx < len(SUBJECTS) else "기타"


def parse_pdf(filepath: Path) -> dict | None:
    """PDF 파일 파싱"""
    m = DATE_RE.search(filepath.name)
    if not m:
        return None

    date_str = m.group(1)
    exam_date = f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:]}"

    print(f"  파싱 중: {filepath.name}")
    all_text = ""
    try:
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                left, right = extract_column_text(page)
                all_text += left + "\n" + right + "\n"
    except Exception as e:
        print(f"    ⚠️ PDF 오류: {e}")
        return None

    questions = parse_questions_from_text(all_text)
    if not questions:
        print(f"    ⚠️ 문제 파싱 실패")
        return None

    # 과목 배정
    for q in questions:
        q["subject"] = guess_subject(q["no"])

    print(f"    ✅ {len(questions)}문제 파싱 완료")
    return {
        "examId": f"security-engineer-{date_str}",
        "category": "security-engineer",
        "categoryName": "정보보안기사",
        "examDate": exam_date,
        "examType": "필기",
        "source": "files/" + filepath.name,
        "totalQuestions": len(questions),
        "subjects": SUBJECTS,
        "questions": questions,
    }


def update_registry(exam_ids: list[str]):
    """registry.json에 security-engineer 카테고리 추가"""
    reg_path = ROOT / "data" / "registry.json"
    with open(reg_path) as f:
        registry = json.load(f)

    if "security-engineer" not in registry["categories"]:
        registry["categories"]["security-engineer"] = {
            "name": "정보보안기사",
            "source": "local-files",
            "exams": []
        }

    cat = registry["categories"]["security-engineer"]
    existing_ids = {e["examId"] for e in cat.get("exams", [])}
    for eid in exam_ids:
        if eid not in existing_ids:
            date_part = eid.replace("security-engineer-", "")
            cat["exams"].append({
                "examId": eid,
                "date": f"{date_part[:4]}-{date_part[4:6]}-{date_part[6:]}",
                "file": f"data/parsed/security-engineer/{eid}.json"
            })

    registry["lastSync"] = "2026-03-08"
    with open(reg_path, "w", encoding="utf-8") as f:
        json.dump(registry, f, ensure_ascii=False, indent=2)
    print(f"\n✅ registry.json 업데이트 완료 ({len(cat['exams'])}개 시험)")


def main():
    pdf_files = sorted(FILES_DIR.glob("정보보안기사*.pdf"))
    print(f"PDF 파일 {len(pdf_files)}개 발견\n")

    saved_ids = []
    for filepath in pdf_files:
        # 해설집/answer 제외 (학생용만)
        if "해설" in filepath.name or "answer" in filepath.name.lower():
            continue

        result = parse_pdf(filepath)
        if not result:
            continue

        out_file = OUT_DIR / f"{result['examId']}.json"
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        saved_ids.append(result["examId"])
        print(f"    → 저장: {out_file.relative_to(ROOT)}")

    print(f"\n총 {len(saved_ids)}개 시험 저장 완료")
    if saved_ids:
        update_registry(saved_ids)

    # HWP 파일 안내
    hwp_files = sorted(FILES_DIR.glob("*.hwp"))
    if hwp_files:
        print(f"\n⚠️  HWP 파일 {len(hwp_files)}개는 LibreOffice 없이 파싱 불가:")
        for f in hwp_files:
            print(f"   - {f.name}")
        print("  → LibreOffice 설치 후 재실행 필요")


if __name__ == "__main__":
    main()
