import unittest

from models.db_models import ChallengeAttempt


class ChallengeAttemptModelTests(unittest.TestCase):
    def test_attempts_are_unique_per_user_and_character(self):
        constraints = {
            constraint.name
            for constraint in ChallengeAttempt.__table__.constraints
        }

        self.assertIn("uq_user_character_attempt", constraints)


if __name__ == "__main__":
    unittest.main()
