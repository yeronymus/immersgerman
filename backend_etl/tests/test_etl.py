import unittest
from app.etl import calculate_wpm

class TestETLMethods(unittest.TestCase):
    def test_calculate_wpm_zero_duration(self):
        # WPM should be 0 if duration is 0
        transcript = [{"text": "Hello world", "start": 0.0, "duration": 1.0}]
        self.assertEqual(calculate_wpm(transcript, 0), 0)

    def test_calculate_wpm_standard(self):
        # 10 words in 5 seconds -> WPM = 10 / (5/60) = 120
        transcript = [
            {"text": "one two three four five", "start": 0.0, "duration": 2.5},
            {"text": "six seven eight nine ten", "start": 2.5, "duration": 2.5}
        ]
        self.assertEqual(calculate_wpm(transcript, 5), 120)

    def test_calculate_wpm_clean_bracketed_text(self):
        # Clean text should ignore [Music] or (laughter)
        # 4 clean words in 2 seconds -> WPM = 4 / (2/60) = 120
        transcript = [
            {"text": "[Music] one two three four (laughter)", "start": 0.0, "duration": 2.0}
        ]
        self.assertEqual(calculate_wpm(transcript, 2), 120)

if __name__ == '__main__':
    unittest.main()
