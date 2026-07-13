# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/rentify.spec.ts >> Rentify MVP Critical Paths >> should login, view dashboard, create expense, and settle up
- Location: tests/rentify.spec.ts:9:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/login", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Rentify MVP Critical Paths", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Navigate to Login Page
> 6  |     await page.goto("http://localhost:3000/login");
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  7  |   });
  8  | 
  9  |   test("should login, view dashboard, create expense, and settle up", async ({ page }) => {
  10 |     // 1. Authenticate with seeded credentials
  11 |     await page.fill('input[type="email"]', "alice@example.com");
  12 |     await page.fill('input[type="password"]', "password");
  13 |     await page.click('button[type="submit"]');
  14 | 
  15 |     // Verify dashboard navigation succeeds
  16 |     await expect(page).toHaveURL(/.*dashboard/);
  17 |     await expect(page.locator("h1")).toContainText("$");
  18 | 
  19 |     // 2. Add an Expense
  20 |     await page.goto("http://localhost:3000/expense/new");
  21 |     
  22 |     // Keypad input simulations (e.g., $15.00)
  23 |     await page.click('button:text-is("1")');
  24 |     await page.click('button:text-is("5")');
  25 |     await page.click('button:text-is("0")');
  26 |     await page.click('button:text-is("0")');
  27 |     await page.click("button:has-text('Continue')");
  28 | 
  29 |     // Enter description
  30 |     await page.fill('input[placeholder="e.g. Internet Bill"]', "Office Supplies");
  31 |     await page.click("button:has-text('Continue')");
  32 | 
  33 |     // Select Split Type
  34 |     await page.click("text=Equally");
  35 |     await page.click("button:has-text('Add Expense')");
  36 | 
  37 |     // Confirm redirected to dashboard
  38 |     await expect(page).toHaveURL(/.*dashboard/);
  39 |     await expect(page.locator("text=Office Supplies")).toBeVisible();
  40 | 
  41 |     // 3. Settle Up debts
  42 |     await page.goto("http://localhost:3000/settle");
  43 |     
  44 |     // Select first option in the list
  45 |     await page.locator("button[role='combobox']").click();
  46 |     await page.locator("[role='option']").first().click();
  47 | 
  48 |     // Record settlement
  49 |     await page.click("button:has-text('Record Manual Cash Payment')");
  50 |     await expect(page).toHaveURL(/.*dashboard/);
  51 |   });
  52 | });
  53 | 
```