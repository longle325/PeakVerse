from pathlib import Path
import tempfile
import unittest

from scripts.extract_pdfs_to_text import (
    TARGET_CHARACTER_DIRS,
    build_output_path,
    discover_pdf_files,
    normalize_text,
)


class ExtractPdfsToTextTests(unittest.TestCase):
    def test_discover_pdf_files_only_returns_target_character_pdfs(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            knowledge_base = Path(temp_dir) / "knowledge_base"
            for directory in [*TARGET_CHARACTER_DIRS, "Chi_Pheo"]:
                (knowledge_base / directory).mkdir(parents=True)

            expected_pdf = knowledge_base / "Thuy_Kieu" / "Truyen_Kieu.pdf"
            expected_pdf.write_bytes(b"%PDF test")
            ignored_pdf = knowledge_base / "Chi_Pheo" / "Chi_Pheo.pdf"
            ignored_pdf.write_bytes(b"%PDF ignored")
            ignored_txt = knowledge_base / "Luc_Van_Tien" / "notes.txt"
            ignored_txt.write_text("notes", encoding="utf-8")

            self.assertEqual(discover_pdf_files(knowledge_base), [expected_pdf])

    def test_build_output_path_keeps_txt_next_to_pdf_with_full_text_suffix(self):
        pdf_path = Path("knowledge_base/Xuan_red_hair/Số_Đỏ.pdf")

        self.assertEqual(
            build_output_path(pdf_path),
            Path("knowledge_base/Xuan_red_hair/Số_Đỏ_full_text.txt"),
        )

    def test_normalize_text_removes_blank_line_noise_and_page_markers(self):
        raw = "SỐ ĐỎ\n\n\n-- 1 of 120 --\n\nChương I\r\n\r\nNội dung"

        self.assertEqual(normalize_text(raw), "SỐ ĐỎ\n\nChương I\n\nNội dung")


if __name__ == "__main__":
    unittest.main()
