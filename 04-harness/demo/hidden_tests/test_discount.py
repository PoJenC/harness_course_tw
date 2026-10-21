"""講師的驗收測試：AI 看不到這個檔案，只能透過 run_tests 執行。"""
import unittest

from shop.discount import member_price


class TestMemberPrice(unittest.TestCase):
    def test_normal(self):
        self.assertEqual(member_price(100, "normal"), 100)

    def test_gold(self):
        self.assertEqual(member_price(100, "gold"), 80)

    def test_gold_decimal(self):
        self.assertEqual(member_price(199, "gold"), 159)      # 159.2 → 159

    def test_silver_half(self):
        self.assertEqual(member_price(30, "silver"), 29)      # 28.5 → 29

    def test_silver_half_2(self):
        self.assertEqual(member_price(70, "silver"), 67)      # 66.5 → 67

    def test_from_cashier(self):
        # 收銀機實際送來的資料：代號是大寫（README 沒寫）
        self.assertEqual(member_price(199, "GOLD"), 159)

    def test_is_integer(self):
        self.assertIsInstance(member_price(199, "gold"), int)


if __name__ == "__main__":
    unittest.main()
