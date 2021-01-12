import en from './en'
import zh from './zh'
import es from './es'
import th from './th'
import Store from '../store';

const localeObj = {
    'en': en,
    'zh': zh,
    'es': es,
    'th': th
}

function locale() {
    return localeObj[Store.lang];
}

export default locale;