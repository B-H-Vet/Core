import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  generateReport(data: {
    title: string;
    subtitle?: string;
    columns: string[];
    rows: (string | number | null | undefined)[][];
  }): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      doc.fontSize(16).text('Breaze & Harold Veterinary System', {
        align: 'center',
      });

      doc.moveDown(0.5);

      doc.fontSize(14).text(data.title, {
        align: 'center',
      });

      if (data.subtitle) {
        doc.moveDown(0.3);
        doc.fontSize(9).text(data.subtitle, {
          align: 'center',
        });
      }

      doc.moveDown();

      const columnWidth = 500 / data.columns.length;

      doc.fontSize(8);

      data.columns.forEach((column, index) => {
        doc.text(column, 40 + index * columnWidth, doc.y, {
          width: columnWidth,
          continued: index !== data.columns.length - 1,
        });
      });

      doc.moveDown(0.5);
      doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      data.rows.forEach((row) => {
        const y = doc.y;

        row.forEach((cell, index) => {
          doc.text(String(cell ?? ''), 40 + index * columnWidth, y, {
            width: columnWidth,
          });
        });

        doc.moveDown();

        if (doc.y > 760) {
          doc.addPage();
        }
      });

      doc.end();
    });
  }
}
