import { GeneratePdfUseCase } from "../core/useCases/GeneratePdfUseCase";
import { PdfMakeRepository } from "../infrastructure/repositories/PdfMakeRepository";
import { AsyncStorageService } from "../infrastructure/services/AsyncStorageService";

export const pdfRepository = new PdfMakeRepository();
export const storageService = new AsyncStorageService();

export const generatePdfUseCase = new GeneratePdfUseCase(pdfRepository);


