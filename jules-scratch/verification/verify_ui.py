from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    try:
        page.goto("http://localhost:5173/admin/login")
        page.fill("input[name=email]", "admin@digiproplat.com")
        page.fill("input[name=password]", "password")
        page.screenshot(path="jules-scratch/verification/login_page.png")
        page.click("button[type=submit]")
        page.wait_for_selector("h1:has-text('Admin Dashboard')")
        page.screenshot(path="jules-scratch/verification/admin_dashboard.png")
        page.click("text=System Health")
        page.wait_for_url("http://localhost:5173/admin/system-logs")
        page.screenshot(path="jules-scratch/verification/system_logs.png")
    except Exception as e:
        print(e)
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
