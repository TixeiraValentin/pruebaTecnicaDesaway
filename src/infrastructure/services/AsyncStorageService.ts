import AsyncStorage from "@react-native-async-storage/async-storage";
import { FormDataEntity } from "../../core/entities/FormData";
import { StorageService } from "../../core/services/StorageService";

const STORAGE_KEY = "@desaway/form-data";

export class AsyncStorageService implements StorageService {
	async saveFormData(data: FormDataEntity): Promise<void> {
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	}

	async loadFormData(): Promise<FormDataEntity | null> {
		const raw = await AsyncStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as FormDataEntity) : null;
	}
}


