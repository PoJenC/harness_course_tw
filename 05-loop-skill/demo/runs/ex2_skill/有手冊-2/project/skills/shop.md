---
name: shop
description: 修改 shop/ 裡的價格計算前先讀，記錄了這個專案已知的坑
---

# 迷你商店：已知的坑

| 症狀 | 原因 | 正確做法 |
|---|---|---|
| 金額變成 159.20000000000002 | 用 float 乘折扣 | 用 `Decimal` 計算 |
| 28.5 被算成 28 | Python 的 `round()` 不是四捨五入 | 用 `Decimal` 的 `ROUND_HALF_UP` |
| 測試出現 `KeyError: 'GOLD'` | 收銀機送來的會員代號是**大寫** | 查 `RATES` 前先 `.lower()` |
