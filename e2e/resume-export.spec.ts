import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Resume Export Flow', () => {
    test('homepage loads and navigates to editor', async ({ browser }) => {
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 },
        });
        const page = await context.newPage();

        // 1. Load homepage
        await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
        await expect(page).toHaveTitle(/Markdown Resume/);

        // 2. Click "Create Your Resume" button
        const createButton = page.getByRole('link', { name: /Create Your Resume/i });
        await expect(createButton).toBeVisible();
        await createButton.click();

        // 3. Verify navigation to editor
        await page.waitForURL('**/editor/**');

        // 4. Verify key elements exist on the page
        await expect(page.locator('.previewContainer')).toBeAttached();
        await expect(page.locator('.sidebar')).toBeAttached();

        // 5. Verify Export PDF button exists
        const exportButton = page.getByRole('button', { name: /Export PDF/i });
        await expect(exportButton).toBeAttached();

        await context.close();
    });

    test('PDF export API works directly', async ({ request }) => {
        // Test the PDF generation API endpoint directly
        const response = await request.post('http://localhost:3001/api/generate-pdf', {
            data: {
                html: '<h1>Test Resume</h1><p>This is a test.</p>',
                theme: 'tehran',
                styles: {
                    fontName: 'Inter',
                    fontScale: 1,
                    headingScale: 1,
                    lineHeightScale: 1.5,
                    xPaddingScale: 24,
                    yPaddingScale: 0,
                    headerColor: '#222',
                    textColor: '#444',
                    linkColor: '#1a73e8',
                },
            },
        });

        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toBe('application/pdf');

        const pdfBuffer = await response.body();
        expect(pdfBuffer.length).toBeGreaterThan(0);

        // Verify PDF magic bytes
        const pdfHeader = pdfBuffer.slice(0, 4).toString();
        expect(pdfHeader).toBe('%PDF');

        // Save and verify the file
        const downloadPath = path.join('/tmp', 'test-api-resume.pdf');
        fs.writeFileSync(downloadPath, pdfBuffer);

        const fileStats = fs.statSync(downloadPath);
        expect(fileStats.size).toBeGreaterThan(1000); // Should be at least 1KB

        // Clean up
        fs.unlinkSync(downloadPath);
    });
});
