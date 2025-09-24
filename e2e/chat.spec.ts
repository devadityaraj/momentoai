import { test, expect } from "@playwright/test"

test.describe("Chat Interface", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto("/")
    await page.evaluate(() => {
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
  })

  test("shows landing hero initially", async ({ page }) => {
    await expect(page.getByText("Try the Momento AI")).toBeVisible()
    await expect(page.getByPlaceholder("Ask MomentoAI")).toBeVisible()
  })

  test("transitions to chat mode on prompt submit", async ({ page }) => {
    // Fill and submit prompt
    await page.getByPlaceholder("Ask MomentoAI").fill("Hello, how are you?")
    await page.getByRole("button", { name: "Send" }).click()

    // Should transition to chat interface
    await expect(page.getByText("Hello, how are you?")).toBeVisible()
  })

  test("shows server status banner when server is down", async ({ page }) => {
    // Mock server down status
    await page.evaluate(() => {
      // Mock Firebase database response
      window.mockServerStatus = { status: "Down", message: "Maintenance" }
    })

    await page.reload()

    // Should show server status banner
    await expect(page.getByText("Server is currently down")).toBeVisible()
  })
})
