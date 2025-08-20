import { GeneratePdfUseCase } from "../core/useCases/GeneratePdfUseCase";
import { PdfLibRepository } from "../infrastructure/repositories/PdfLibRepository";
import { AsyncStorageService } from "../infrastructure/services/AsyncStorageService";

export const pdfRepository = new PdfLibRepository();
export const storageService = new AsyncStorageService();

export const generatePdfUseCase = new GeneratePdfUseCase(pdfRepository);