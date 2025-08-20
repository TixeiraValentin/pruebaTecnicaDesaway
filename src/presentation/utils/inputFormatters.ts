export const onlyLettersAndNumbers = (text: string): string =>
	(text || '').replace(/[^a-zA-Z0-9áéíóúüñÑàèìòùÀÈÌÒÙâêîôûÂÊÎÔÛäëïöüÄËÏÖÜçÇ\s]/g, '');

export const onlyDigits = (text: string): string => (text || '').replace(/\D/g, '');


