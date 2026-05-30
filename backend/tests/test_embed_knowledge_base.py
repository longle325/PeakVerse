import unittest

from scripts.embed_knowledge_base import (
    batched,
    build_embedding_record,
    text_hash,
)


class EmbedKnowledgeBaseTests(unittest.TestCase):
    def test_text_hash_changes_when_text_changes(self):
        self.assertEqual(text_hash("abc"), text_hash("abc"))
        self.assertNotEqual(text_hash("abc"), text_hash("abcd"))

    def test_batched_splits_rows_by_size(self):
        self.assertEqual(
            list(batched([1, 2, 3, 4, 5], batch_size=2)),
            [[1, 2], [3, 4], [5]],
        )

    def test_build_embedding_record_keeps_chunk_metadata(self):
        chunk = {
            "chunk_id": "chi.chunk_0001",
            "document_id": "chi.doc",
            "character_slug": "chi_pheo",
            "character_name": "Chí Phèo",
            "work_title": "Chí Phèo",
            "author": "Nam Cao",
            "doc_type": "original",
            "source_path": "Chi_Pheo/source.txt",
            "text": "Bát cháo hành đánh thức phần người.",
        }

        record = build_embedding_record(
            chunk,
            embedding=[0.1, 0.2, 0.3],
            embedding_model="text-embedding-3-large",
        )

        self.assertEqual(record["chunk_id"], "chi.chunk_0001")
        self.assertEqual(record["character_slug"], "chi_pheo")
        self.assertEqual(record["embedding"], [0.1, 0.2, 0.3])
        self.assertEqual(record["text_hash"], text_hash(chunk["text"]))


if __name__ == "__main__":
    unittest.main()
