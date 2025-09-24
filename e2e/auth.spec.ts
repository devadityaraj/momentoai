import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("shows login modal on first visit", async ({ page }) => {
    await page.goto("/")

    // Should show login modal
    await expect(page.getByText("Welcome to Momento AI")).toBeVisible()
    await expect(page.getByText("Continue with Google")).toBeVisible()
  })

  test("displays limitations modal", async ({ page }) => {
    await page.goto("/")

    // Mock authentication state
    await page.evaluate(() => {
      // Mock Firebase auth state
      window.localStorage.setItem(
        "firebase:authUser:test",
        JSON.stringify({
          uid: "test-user",
          email: "test@example.com",
          displayName: "Test User",
        }),
      )
    })

    await page.reload()

    // Click limitations link
    await page.getByText("Limitations").click()

    // Should show limitations modal
    await expect(page.getByText("Momento AI Limitations")).toBeVisible()
    await expect(page.getByText("Rate Limiting")).toBeVisible()
    await expect(page.getByText("Maximum 5 prompts per 12-hour period")).toBeVisible()
  })
})
