import React from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { generatePdfUseCase } from "../../app/compositionRoot";
import { storageService } from "../../app/compositionRoot";
import { FormDataEntity } from "../../core/entities/FormData";

const schema = yup.object({
	textValue: yup.string().required("Requerido"),
	numericValue: yup
		.number()
		.typeError("Debe ser número")
		.required("Requerido"),
	optionValue: yup.string().required("Requerido"),
});

export const GeneratePdfScreen: React.FC = () => {
	const { control, handleSubmit, setValue } = useForm<FormDataEntity>({
		resolver: yupResolver(schema),
		defaultValues: { textValue: "", numericValue: 0, optionValue: "opcion1" },
	});

	React.useEffect(() => {
		storageService.loadFormData().then((saved) => {
			if (saved) {
				setValue("textValue", saved.textValue);
				setValue("numericValue", saved.numericValue);
				setValue("optionValue", saved.optionValue);
			}
		});
	}, [setValue]);

	const onSubmit = async (data: FormDataEntity) => {
		await storageService.saveFormData(data);
		const result = await generatePdfUseCase.execute(data);
		Alert.alert("PDF generado", `Guardado en: ${result.filePath}`);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Generar PDF</Text>
			<Text>Texto</Text>
			<Controller
				control={control}
				name="textValue"
				render={({ field: { onChange, value } }) => (
					<TextInput style={styles.input} value={value} onChangeText={onChange} />
				)}
			/>

			<Text>Número</Text>
			<Controller
				control={control}
				name="numericValue"
				render={({ field: { onChange, value } }) => (
					<TextInput
						style={styles.input}
						keyboardType="numeric"
						value={String(value)}
						onChangeText={(t) => onChange(Number(t))}
					/>
				)}
			/>

			<Text>Opción</Text>
			<Controller
				control={control}
				name="optionValue"
				render={({ field: { onChange, value } }) => (
					<View style={{ gap: 8 }}>
						<Button title="Opción 1" onPress={() => onChange("opcion1")} color={value === "opcion1" ? "#0F4471" : undefined} />
						<Button title="Opción 2" onPress={() => onChange("opcion2")} color={value === "opcion2" ? "#0F4471" : undefined} />
						<Button title="Opción 3" onPress={() => onChange("opcion3")} color={value === "opcion3" ? "#0F4471" : undefined} />
					</View>
				)}
			/>

			<View style={{ height: 16 }} />
			<Button title="Generar PDF" onPress={handleSubmit(onSubmit)} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16, gap: 8, backgroundColor: "#fff" },
	title: { fontSize: 20, fontWeight: "600", marginBottom: 12, color: "#0F4471" },
	input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8 },
});


