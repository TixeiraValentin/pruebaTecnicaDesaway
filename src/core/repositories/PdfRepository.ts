import { FormDataEntity, GeneratedPdf } from "../entities/FormData";

export interface PdfRepository {
	generatePdf(input: FormDataEntity, fileName?: string): Promise<GeneratedPdf>;
}


