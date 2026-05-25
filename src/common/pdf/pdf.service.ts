import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { chromium, type Browser, type BrowserContext } from 'playwright';

@Injectable()
export class PdfService implements OnModuleInit, OnModuleDestroy {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  async onModuleInit(): Promise<void> {
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext();
  }

  async onModuleDestroy(): Promise<void> {
    await this.context?.close();
    await this.browser?.close();
  }

  async renderFromHtml(html: string): Promise<Buffer> {
    if (!this.context) {
      throw new Error('Playwright context is not initialized');
    }

    const page = await this.context.newPage();
    try {
      await page.setContent(html, { waitUntil: 'networkidle' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
    }
  }
}
