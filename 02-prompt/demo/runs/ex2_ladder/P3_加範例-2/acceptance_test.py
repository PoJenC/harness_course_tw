"""講師的 7 個驗收測試。每次驗收都會重新複製進去，AI 改不到。"""
import unittest

from company_errors import BusinessError, ValidationError
from transfer import validate_transfer


class TransferAcceptanceTest(unittest.TestCase):

    def test_1_valid_request_passes(self):
        self.assertIsNone(validate_transfer("A001", "B002", 100, 500))

    def test_2_blank_from_account(self):
        with self.assertRaises(ValidationError) as e:
            validate_transfer("", "B002", 100, 500)
        self.assertEqual(e.exception.field, "from_account")

    def test_3_blank_to_account(self):
        with self.assertRaises(ValidationError) as e:
            validate_transfer("A001", "", 100, 500)
        self.assertEqual(e.exception.field, "to_account")

    def test_4_non_positive_amount(self):
        with self.assertRaises(ValidationError) as e:
            validate_transfer("A001", "B002", 0, 500)
        self.assertEqual(e.exception.field, "amount")

    def test_5_same_account(self):
        with self.assertRaises(BusinessError) as e:
            validate_transfer("A001", "A001", 100, 500)
        self.assertEqual(e.exception.code, "T00001")

    def test_6_insufficient_balance(self):
        with self.assertRaises(BusinessError) as e:
            validate_transfer("A001", "B002", 600, 500)
        self.assertEqual(e.exception.code, "T00002")

    def test_7_amount_equal_to_balance_passes(self):
        self.assertIsNone(validate_transfer("A001", "B002", 500, 500))
