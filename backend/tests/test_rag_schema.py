import unittest

from core.config import settings
from models.db_models import KnowledgeChunk


class RagSchemaTests(unittest.TestCase):
    def test_embedding_defaults_use_openai_large_model(self):
        self.assertEqual(settings.EMBEDDING_MODEL, "text-embedding-3-large")
        self.assertEqual(settings.EMBEDDING_DIMENSIONS, 3072)
        self.assertEqual(settings.RAG_TOP_K, 5)

    def test_knowledge_chunk_has_stable_unique_chunk_id(self):
        constraints = {
            constraint.name
            for constraint in KnowledgeChunk.__table__.constraints
        }

        self.assertIn("uq_knowledge_chunk_id", constraints)
        self.assertEqual(KnowledgeChunk.__tablename__, "knowledge_chunks")


if __name__ == "__main__":
    unittest.main()
