import en from './en'
import zh from './zh'
import es from './es'
import th from './th'
import zh_tw from './zh_tw'
import Store from '../store';

const localeObj = { en, zh, es, th, zh_tw }

function locale() {
    return localeObj[Store.lang];
}

export default locale;