import { test, expect } from "@playwright/test";

test.describe("FairShare MVP Critical Paths", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Login Page
    await page.goto("http://localhost:3000/login");
  });

  test("should login, view dashboard, create expense, and settle up", async ({ page }) => {
    // 1. Authenticate with seeded credentials
    await page.fill('input[type="email"]', "alice@example.com");
    await page.fill('input[type="password"]', "password");
    await page.click('button[type="submit"]');

    // Verify dashboard navigation succeeds
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator("h1")).toContainText("$");

    // 2. Add an Expense
    await page.goto("http://localhost:3000/expense/new");
    
    // Keypad input simulations (e.g., $15.00)
    await page.click('button:text-is("1")');
    await page.click('button:text-is("5")');
    await page.click('button:text-is("0")');
    await page.click('button:text-is("0")');
    await page.click("button:has-text('Continue')");

    // Enter description
    await page.fill('input[placeholder="e.g. Internet Bill"]', "Office Supplies");
    await page.click("button:has-text('Continue')");

    // Select Split Type
    await page.click("text=Equally");
    await page.click("button:has-text('Add Expense')");

    // Confirm redirected to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator("text=Office Supplies")).toBeVisible();

    // 3. Settle Up debts
    await page.goto("http://localhost:3000/settle");
    
    // Select first option in the list
    await page.locator("button[role='combobox']").click();
    await page.locator("[role='option']").first().click();

    // Record settlement
    await page.click("button:has-text('Record Manual Cash Payment')");
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
