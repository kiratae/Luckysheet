import { DateTime } from 'luxon';

const weFormat = {
    parseDate(str) {
        return DateTime.fromFormat(str, "dd/MM/yyyy").toJSDate();
    },
    financial: function(x) {
        return Number.parseFloat(x).toFixed(2);
    },
    isdatetime: function(s) {
        // console.log('[TK] custom begin weFormat::isdatetime "s" is', s);
        if (s == null || s.toString().length < 5) {
            return false;
        } else if (checkDateTime(s)) {
            return true;
        } else {
            return false;
        }

        function checkDateTime(str) {
            // var reg1 = /^(\d{4})-(\d{1,2})-(\d{1,2})(\s(\d{1,2}):(\d{1,2})(:(\d{1,2}))?)?$/;
            // var reg2 = /^(\d{4})\/(\d{1,2})\/(\d{1,2})(\s(\d{1,2}):(\d{1,2})(:(\d{1,2}))?)?$/;
            var reg1 = /^(\d{1,2})-(\d{1,2})-(\d{4})(\s(\d{1,2}):(\d{1,2})(:(\d{1,2}))?)?$/;
            var reg2 = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(\s(\d{1,2}):(\d{1,2})(:(\d{1,2}))?)?$/;

            if (!reg1.test(str) && !reg2.test(str)) {
                return false;
            }

            var day = RegExp.$1,
                month = RegExp.$2,
                year = RegExp.$3;

            if (year < 1900) {
                return false;
            }

            if (month > 12) {
                return false;
            }

            if (day > 31) {
                return false;
            }

            if (month == 2) {
                if (new Date(year, 1, 29).getDate() == 29 && day > 29) {
                    return false;
                } else if (new Date(year, 1, 29).getDate() != 29 && day > 28) {
                    return false;
                }
            }

            return true;
        }
    }
}

export default weFormat;