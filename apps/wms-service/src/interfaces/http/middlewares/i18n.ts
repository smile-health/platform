import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import path from 'path';

i18next
    .use(Backend)
    .use(middleware.LanguageDetector)
    .init({
        resources: {
            en: { translation: require('../../../translations/en/translation.json') },
            id: { translation: require('../../../translations/id/translation.json') },
        },
        fallbackLng: 'en',
        preload: ['en', 'id'], // bahasa yang aktif
        backend: {
            loadPath: path.resolve(process.cwd(), 'dist/translations/{{lng}}/translation.json'),
        },
        detection: {
            order: ['header'], // baca dari Accept-Language header
            lookupHeader: 'accept-language',
        },
        interpolation: {
            escapeValue: false, // express sudah handle XSS
        },
    });

// i18next-http-middleware doesn't declare i18next as a dependency, so its
// bundled types resolve against whichever copy pnpm happens to hoist,
// which can be a different (but structurally identical at runtime) major
// version than the one installed here.
export default middleware.handle(i18next as any);
