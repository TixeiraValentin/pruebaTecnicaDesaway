import { FormDataEntity, GeneratedPdf } from "../entities/FormData";
import { PdfRepository } from "../repositories/PdfRepository";

export class GeneratePdfUseCase {
	private readonly pdfRepository: PdfRepository;

	constructor(pdfRepository: PdfRepository) {
		this.pdfRepository = pdfRepository;
	}

	async execute(input: FormDataEntity, fileName?: string): Promise<GeneratedPdf> {
		return this.pdfRepository.generatePdf(input, fileName);
	}
}


