import * as yup from "yup";
import type { GeneratePdfForm } from "@/presentation/interfaces/forms";

export const generatePdfFormSchema: yup.ObjectSchema<GeneratePdfForm> = yup
	.object({
		textValue: yup
			.string()
			.required("Requerido"),
		numericValue: yup.string().matches(/^\d*$/, "Solo números").nullable().optional(),
		optionValue: yup.string().required("Requerido"),
	})
	.required();


