import fs from "fs";
import { test } from "@playwright/test";

test("Capture high-fidelity screenshots of all pages", async ({ page }) => {
  // Set test timeout to 90 seconds
  test.setTimeout(90000);
  
  // Ensure images directory exists in workspace root
  if (!fs.existsSync("images")) {
    fs.mkdirSync("images");
  }

  // Set viewport size to match iPhone mobile frame width
  await page.setViewportSize({ width: 420, height: 900 });

  // 1. Login Page
  await page.goto("http://localhost:3000/login");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "images/login.png" });

  // 2. Perform Authentication
  await page.fill('input[placeholder="Email Address"]', "alice@example.com");
  await page.fill('input[placeholder="Password"]', "password");
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL(/.*dashboard/);
  await page.waitForTimeout(2000); // allow lazy cron & animations to run
  await page.screenshot({ path: "images/dashboard.png" });

  // 3. Roommates Page
  await page.goto("http://localhost:3000/roommates");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "images/roommates.png" });

  // 4. Add Expense Page
  await page.goto("http://localhost:3000/expense/new");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "images/expense_new.png" });

  // 5. Settle Page
  await page.goto("http://localhost:3000/settle");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "images/settle.png" });

  // 6. Activity Page
  await page.goto("http://localhost:3000/activity");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "images/activity.png" });
});
