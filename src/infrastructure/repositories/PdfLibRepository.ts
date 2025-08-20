import { FormDataEntity, GeneratedPdf } from '@/core/entities/FormData';
import { PdfRepository } from '@/core/repositories/PdfRepository';

export class PdfLibRepository implements PdfRepository {
  async generatePdf(input: FormDataEntity, fileName = 'DesawayPDF.pdf'): Promise<GeneratedPdf> {
    console.log('[PdfLibRepository] generatePdf called with', { input, fileName });
    const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @page { size: A4; margin: 0; }
          body { font-family: Arial, sans-serif; color: #4D406E; margin: 0; padding: 0; }
          .page { width: 100%; height: 100%; padding: 40px 50px; box-sizing: border-box; position: relative; height: 100vh;}
          h1 { font-size: 70px; font-weight: 600; text-align: center; margin-bottom: 8px; color: #4D406E; padding-top: 100px; }
          .divider { width: 85%; height: 2px; background-color: #4D406E; margin: 0 auto 20px auto; }
          .report-info { display: flex; align-items: flex-start; gap: 20px; padding-left: 30px; }
          .report-info img { width: 150px;   height: 150px; }
          .report-info-text { display: flex; flex-direction: column; }
          .report-info-text h2 { font-size: 40px; font-weight: bold; margin: 0; color: #4D406E; margin-top: 20px; }
          .report-info-text-container { display: flex; flex-direction: column; row-gap: 50px; margin-top: 50px; }
          .report-info-text p { margin: 0; }
          .label { font-weight: bold; font-size: 30px; color: #4D406E; }
          .value { font-size: 25px; color: #444; font-weight: 400; }
          .footer { position: absolute; bottom: 40px; left: 0; right: 0; display: flex; flex-direction: column; align-items: center; gap: 100px; }
          .footer img { width: 300px; }
          .page-number { font-size: 20px; color: #444; }
          .pb { page-break-before: always; }
        </style>
      </head>
      <body>
        <div class="page">
          <h1>Reporte de Datos</h1>
          <div class="divider"></div>
          <div class="report-info">
            <img src="file:///android_asset/sticky-note.svg" alt="icon" />
            <div class="report-info-text">
              <h2>Información del Reporte</h2>
              <div class="report-info-text-container">
                <p class="label">Dato 1: <span class="value">${input.textValue}</span></p>
                <p class="label">Dato 2: <span class="value">${input.optionValue}</span></p>
              </div>
            </div>
          </div>
          <div class="footer">
            <img src="file:///android_asset/desaway_blue.svg" alt="logo" />
            <div class="page-number">1/2</div>
          </div>
        </div>
        <div class="page pb">
          <h1>Reporte de Datos</h1>
          <div class="divider"></div>
          <div class="report-info">
            <img src="file:///android_asset/sticky-note.svg" alt="icon" />
            <div class="report-info-text">
              <h2>Información del Reporte</h2>
              <div class="report-info-text-container">
              <p class="label">Dato 3: <span class="value">${input.numericValue}</span></p>
              </div>
            </div>
          </div>
          <div class="footer">
            <img src="file:///android_asset/desaway_blue.svg" alt="logo" />
            <div class="page-number">2/2</div>
          </div>
        </div>
      </body>
    </html>`;
    try {
      const RNHTMLtoPDF = require('react-native-html-to-pdf').default as any;
      const date = new Date();
      const stamp = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}_${String(date.getHours()).padStart(2,'0')}${String(date.getMinutes()).padStart(2,'0')}${String(date.getSeconds()).padStart(2,'0')}`;
      const baseName = fileName.replace(/\.pdf$/i, '') || 'DesawayReporte';
      const options = { html, fileName: `${baseName}_${stamp}`, directory: 'Documents' };
      console.log('[PdfLibRepository] Converting HTML to PDF with options', options);
      const res = await RNHTMLtoPDF.convert(options);
      console.log('[PdfLibRepository] Conversion result', res);
      if (!res.filePath) throw new Error('No se pudo generar el PDF HTML');
      const output = { filePath: res.filePath, fileName: `${options.fileName}.pdf` } as const;
      console.log('[PdfLibRepository] Output', output);
      return output;
    } catch (e) {
      console.error('[PdfLibRepository] Error while generating PDF', e);
      throw e;
    }
  }
}


