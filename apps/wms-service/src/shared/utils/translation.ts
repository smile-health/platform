import { exec } from 'child_process';
import util from 'util';
import { getWasteManagementTranslation } from './dictionary';

const execPromise = util.promisify(exec);

// Cache untuk menghindari installasi berulang
let languagesInstalled = false;

/**
 * Install bahasa yang diperlukan untuk Argos Translate
 */
export async function installRequiredLanguages(): Promise<void> {
    if (languagesInstalled) return;

    try {
        console.log('Menginstall bahasa yang diperlukan untuk Argos Translate...');

        // Install package English to Indonesian
        await execPromise(
            'python3 -c "' +
                'import argostranslate.package;' +
                'argostranslate.package.update_package_index();' +
                'available_packages = argostranslate.package.get_available_packages();' +
                'package_to_install = next((p for p in available_packages if p.from_code == \"en\" and p.to_code == \"id\"), None);' +
                'if package_to_install:' +
                '    argostranslate.package.install_from_path(package_to_install.download());' +
                '    print(\"Package English to Indonesian installed successfully\");' +
                'else:' +
                '    print(\"English to Indonesian package not found, using fallback\");' +
                '"',
        );

        languagesInstalled = true;
        console.log('Bahasa berhasil diinstall');
    } catch (error) {
        console.warn('Tidak bisa menginstall bahasa, menggunakan fallback:', error);
    }
}

/**
 * Cek apakah bahasa sudah terinstall
 */
async function checkLanguageInstalled(from: string, to: string): Promise<boolean> {
    try {
        await execPromise(`python3 -c "
import argostranslate.translate
from_code = '${from}'
to_code = '${to}'
installed_languages = argostranslate.translate.get_installed_languages()
from_lang = next((lang for lang in installed_languages if lang.code == from_code), None)
to_lang = next((lang for lang in installed_languages if lang.code == to_code), None)
print('Installed' if from_lang and to_lang else 'Not installed')
"`);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Fungsi terjemahan yang diperbaiki
 */
export async function translateText(text: string, from: string, to: string): Promise<string> {
    if (!text || typeof text !== 'string' || text.trim() === '') {
        return text;
    }

    const wasteTranslation = getWasteManagementTranslation(text);

    if (wasteTranslation) {
        return wasteTranslation;
    }

    try {
        // Pastikan bahasa terinstall
        const isInstalled = await checkLanguageInstalled(from, to);
        if (!isInstalled) {
            await installRequiredLanguages();
        }

        // Escape karakter khusus
        const escapedText = text.replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/`/g, '\\`');

        // Build command
        const command = `argos-translate --from ${from} --to ${to} "${escapedText}"`;

        // Eksekusi command
        const { stdout, stderr } = await execPromise(command);

        if (stderr) {
            console.warn('Argos Translate stderr:', stderr);
        }

        return stdout.trim();
    } catch (error) {
        console.error('Error executing Argos Translate:', error);
        return text; // Fallback ke teks asli
    }
}

/**
 * Batch translation untuk performa lebih baik
 */
export async function translateMultiple(
    texts: string[],
    from: string,
    to: string,
): Promise<string[]> {
    if (texts.length === 0) return [];

    try {
        // Pastikan bahasa terinstall
        const isInstalled = await checkLanguageInstalled(from, to);
        if (!isInstalled) {
            await installRequiredLanguages();
        }

        const results: string[] = [];

        // Process texts in smaller batches to avoid command line length limits
        const batchSize = 10;

        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);

            // Terjemahkan setiap teks secara individual dalam batch
            const batchResults = await Promise.all(
                batch.map((text) => translateSingleText(text, from, to)),
            );

            results.push(...batchResults);
        }

        return results;
    } catch (error) {
        console.error('Error in batch translation:', error);
        return texts; // Fallback ke teks asli
    }
}

/**
 * Terjemahkan teks tunggal dengan error handling yang lebih baik
 */
export async function translateSingleText(text: string, from: string, to: string): Promise<string> {
    if (!text || typeof text !== 'string' || text.trim() === '') {
        return text;
    }

    const wasteTranslation = getWasteManagementTranslation(text);
    if (wasteTranslation) {
        return wasteTranslation;
    }

    try {
        // Handle khusus untuk teks dengan underscore
        if (text.includes('_')) {
            return handleUnderscoreText(text, from, to);
        }

        // Escape karakter khusus dengan benar
        const escapedText = properlyEscapeText(text);

        const command = `argos-translate --from ${from} --to ${to} "${escapedText}"`;
        const { stdout } = await execPromise(command);

        return cleanTranslationResult(stdout.trim());
    } catch (error) {
        console.error(`Error translating text: "${text}"`, error);
        return text; // Fallback ke teks asli
    }
}

/**
 * Handle khusus untuk teks yang mengandung underscore
 */
async function handleUnderscoreText(text: string, from: string, to: string): Promise<string> {
    // Untuk teks dengan underscore, kita punya beberapa strategi:

    // 1. Coba terjemahkan sebagai satu kesatuan
    try {
        const escapedText = properlyEscapeText(text);
        const command = `argos-translate --from ${from} --to ${to} "${escapedText}"`;
        const { stdout } = await execPromise(command);
        const result = cleanTranslationResult(stdout.trim());

        // Jika hasil tidak mengandung spasi yang tidak diinginkan, gunakan
        if (!result.includes(' _ ') && !result.includes('  ')) {
            return result;
        }
    } catch (error) {
        console.warn('Direct translation failed, trying word by word');
    }

    // 2. Terjemahkan per kata (dipisah underscore)
    const parts = text.split('_');
    const translatedParts = await Promise.all(
        parts.map((part) => translateSingleText(part, from, to)),
    );

    // 3. Gabungkan kembali dengan underscore
    return translatedParts.join('_');
}

/**
 * Escape karakter khusus dengan benar
 */
function properlyEscapeText(text: string): string {
    return text
        .replace(/\\/g, '\\\\') // Escape backslash pertama
        .replace(/"/g, '\\"') // Escape double quotes
        .replace(/\$/g, '\\$') // Escape dollar signs
        .replace(/`/g, '\\`') // Escape backticks
        .replace(/\n/g, ' ') // Ganti newline dengan spasi
        .trim();
}

/**
 * Bersihkan hasil terjemahan dari spasi yang tidak diinginkan
 */
function cleanTranslationResult(text: string): string {
    return text
        .replace(/\s+_/g, '_') // Hapus spasi sebelum underscore
        .replace(/_\s+/g, '_') // Hapus spasi setelah underscore
        .replace(/\s+/g, ' ') // Normalisasi multiple spaces
        .trim();
}

export function getLanguageConfig(lang: string) {
    const defaultConfig = { source: 'id', target: 'en' };

    if (lang === 'id') {
        return { source: 'en', target: 'id' };
    }

    return defaultConfig;
}
