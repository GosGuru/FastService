import { normalizeSlugSegment, type Locale } from "@/lib/i18n";
import type { AdminContentSnapshot, AdminContentKey } from "@/lib/admin/snapshot";

export type AdminItem = AdminContentSnapshot["content"][AdminContentKey][number];

export interface TranslatableText {
  path: string;
  text: string;
  isHtml: boolean;
  isSlug: boolean;
}

// Comprueba si un objeto es un LocalizedText
function isLocalizedText(obj: any): boolean {
  return (
    typeof obj === "object" &&
    obj !== null &&
    !Array.isArray(obj) &&
    !("html" in obj) && // No es un RichTextContent
    (typeof obj.es === "string" || typeof obj.en === "string")
  );
}

// Comprueba si un objeto es un RichTextByLocale
function isRichTextByLocale(obj: any): boolean {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return false;
  const keys = Object.keys(obj);
  return keys.some(key => obj[key] && typeof obj[key] === "object" && typeof obj[key].html === "string");
}

// Extrae recursivamente los textos traducibles para un idioma dado que falten en el idioma destino
export function extractTranslatableTexts(obj: any, sourceLocale: Locale, targetLocale: Locale, path = ""): TranslatableText[] {
  if (obj === null || obj === undefined) return [];

  // Si es un array
  if (Array.isArray(obj)) {
    return obj.flatMap((item, index) => extractTranslatableTexts(item, sourceLocale, targetLocale, path ? `${path}.${index}` : `${index}`));
  }

  // Si es LocalizedText
  if (isLocalizedText(obj)) {
    const text = obj[sourceLocale];
    const targetText = obj[targetLocale];
    const hasSource = typeof text === "string" && text.trim() !== "";
    const hasTarget = typeof targetText === "string" && targetText.trim() !== "";

    if (hasSource && !hasTarget) {
      const isSlug = path.endsWith("slugsByLocale") || path.endsWith("categorySlugsByLocale");
      return [{
        path,
        text,
        isHtml: false,
        isSlug
      }];
    }
    return [];
  }

  // Si es RichTextByLocale
  if (isRichTextByLocale(obj)) {
    const richText = obj[sourceLocale];
    const targetRichText = obj[targetLocale];
    const hasSource = richText && typeof richText.html === "string" && richText.html.trim() !== "";
    const hasTarget = targetRichText && typeof targetRichText.html === "string" && targetRichText.html.trim() !== "";

    if (hasSource && !hasTarget) {
      return [{
        path: `${path}.${sourceLocale}.html`,
        text: richText.html,
        isHtml: true,
        isSlug: false
      }];
    }
    return [];
  }

  // Si es un objeto genérico, recorremos sus propiedades
  if (typeof obj === "object") {
    return Object.keys(obj).flatMap(key => {
      // Ignorar propiedades de control y lógicas que no deben ser traducidas
      const ignoredKeys = [
        "id", "status", "visibility", "publishedAt", "updatedAt", "source", 
        "collectionId", "serviceId", "kind", "countTarget", "robotsIndex", 
        "hiddenPage", "descriptionBold", "descriptionItalic", "hideWhatsappButton", 
        "width", "height", "dropboxPath", "storagePath", "mimeType"
      ];
      if (ignoredKeys.includes(key) && !path.includes("specs") && !path.includes("options")) {
        return [];
      }
      return extractTranslatableTexts(obj[key], sourceLocale, targetLocale, path ? `${path}.${key}` : key);
    });
  }

  return [];
}

// Reinserta un valor traducido en el path correspondiente
export function setNestedValue(obj: any, path: string, value: any) {
  const parts = path.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];
    const isNextNumber = !isNaN(Number(nextPart));

    if (current[part] === undefined) {
      current[part] = isNextNumber ? [] : {};
    }
    current = current[part];
  }
  const lastPart = parts[parts.length - 1];
  current[lastPart] = value;
}

// Aplica el valor traducido en el path de destino con su respectivo locale
export function applyTranslation(item: any, sourceText: TranslatableText, targetLocale: Locale, translatedValue: string) {
  let targetPath = "";
  let finalValue = translatedValue;

  if (sourceText.isSlug) {
    finalValue = normalizeSlugSegment(translatedValue);
  }

  if (sourceText.path.endsWith(".html")) {
    // Es un RichTextContent (e.g. richDescription.es.html -> richDescription.en.html)
    const regex = new RegExp(`\\.(${locales.join("|")})\\.html$`);
    targetPath = sourceText.path.replace(regex, `.${targetLocale}.html`);
  } else {
    // Es un LocalizedText, agregamos el locale al final del path original
    targetPath = `${sourceText.path}.${targetLocale}`;
  }

  setNestedValue(item, targetPath, finalValue);
}

// Llama a la API de DeepSeek para traducir un lote de textos
export async function translateTexts(
  texts: { id: string; text: string; isHtml: boolean }[],
  sourceLocale: Locale,
  targetLocale: Locale
): Promise<Record<string, string>> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY no está configurada en las variables de entorno.");
  }

  if (texts.length === 0) return {};

  const systemPrompt = `Eres un traductor profesional experto en traducción de contenidos para sitios web de turismo, charter de barcos de lujo y servicios de alta gama en Ibiza.
Traduce los textos proporcionados del idioma "${sourceLocale.toUpperCase()}" al idioma "${targetLocale.toUpperCase()}".
Instrucciones:
1. Mantén todas las etiquetas HTML intactas (como <p>, <strong>, <ul>, <li>, <br/>, etc.) para los elementos marcados como "isHtml": true. No traduzcas las etiquetas ni sus atributos, solo el texto dentro de ellas.
2. Traduce los textos de forma que suenen naturales, fluidos, elegantes y profesionales en el idioma de destino.
3. Devuelve los resultados en un array JSON plano, donde cada elemento tenga exactamente el mismo "id" que el original y el campo "translatedText" con la traducción.
4. Devuelve ÚNICAMENTE el objeto JSON en el formato requerido. No agregues introducciones, explicaciones, ni etiquetas de bloque de código de markdown.

Formato de salida esperado:
[
  { "id": "...", "translatedText": "..." }
]`;

  const userContent = JSON.stringify(texts.map(t => ({ id: t.id, text: t.text, isHtml: t.isHtml })));

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Error de API de DeepSeek (${response.status}): ${errText || response.statusText}`);
    }

    const result = await response.json();
    let responseText = result.choices?.[0]?.message?.content;
    if (!responseText) {
      throw new Error("Respuesta vacía o inválida de la API de DeepSeek.");
    }

    responseText = responseText.trim();
    if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const translationsArray = JSON.parse(responseText);
    const translationsMap: Record<string, string> = {};
    if (Array.isArray(translationsArray)) {
      translationsArray.forEach((item: any) => {
        if (item && typeof item.id === "string" && typeof item.translatedText === "string") {
          translationsMap[item.id] = item.translatedText;
        }
      });
    }

    return translationsMap;
  } catch (error) {
    console.error(`Error en la traducción a ${targetLocale}:`, error);
    throw error;
  }
}

// Traduce un item completo de un idioma de origen a uno de destino
export async function translateItem(
  item: AdminItem,
  sourceLocale: Locale,
  targetLocale: Locale
): Promise<AdminItem> {
  const clonedItem = JSON.parse(JSON.stringify(item)) as AdminItem;
  const translatableFields = extractTranslatableTexts(clonedItem, sourceLocale, targetLocale);

  if (translatableFields.length === 0) {
    return clonedItem;
  }

  const textsToTranslate = translatableFields.map((field, index) => ({
    id: String(index),
    text: field.text,
    isHtml: field.isHtml
  }));

  const translationsMap = await translateTexts(textsToTranslate, sourceLocale, targetLocale);

  translatableFields.forEach((field, index) => {
    const translatedValue = translationsMap[String(index)];
    if (translatedValue !== undefined) {
      applyTranslation(clonedItem, field, targetLocale, translatedValue);
    }
  });

  return clonedItem;
}
