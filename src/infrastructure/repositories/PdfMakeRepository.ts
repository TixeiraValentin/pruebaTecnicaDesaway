import { TDocumentDefinitions, createPdf } from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import ReactNativeBlobUtil from "react-native-blob-util";
import { FormDataEntity, GeneratedPdf } from "../../core/entities/FormData";
import { PdfRepository } from "../../core/repositories/PdfRepository";

export class PdfMakeRepository implements PdfRepository {
	async generatePdf(input: FormDataEntity, fileName = "DesawayForm.pdf"): Promise<GeneratedPdf> {
		const docDefinition: TDocumentDefinitions = {
			pageMargins: [40, 60, 40, 60],
			content: [
				{ text: "Desaway - Datos", style: "header" },
				{ text: `Texto: ${input.textValue}` },
				{ text: `Número: ${input.numericValue}` },
				{ text: "\n\n" },
				{ text: "Página 2", pageBreak: "before", style: "header" },
				{ text: `Opción: ${input.optionValue}` },
			],
			styles: {
				header: { fontSize: 18, bold: true, color: "#0F4471" },
			},
		};

		const pdfDocGenerator = createPdf(docDefinition);

		const pdfBase64: string = await new Promise((resolve, reject) => {
			pdfDocGenerator.getBase64((data: string) => resolve(data));
		});

		const downloads = ReactNativeBlobUtil.fs.dirs.DownloadDir ?? ReactNativeBlobUtil.fs.dirs.DocumentDir;
		const targetPath = `${downloads}/${fileName}`;
		await ReactNativeBlobUtil.fs.writeFile(targetPath, pdfBase64, "base64");

		return { filePath: targetPath, fileName };
	}
}


