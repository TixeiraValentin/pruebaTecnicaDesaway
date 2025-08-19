import { FormDataEntity } from "../entities/FormData";

export interface StorageService {
	saveFormData(data: FormDataEntity): Promise<void>;
	loadFormData(): Promise<FormDataEntity | null>;
}


