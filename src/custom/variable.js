import { getObjType } from '../utils/util';
import { isInlineStringCell } from '../controllers/inlineString';
import { getcellvalue, getcellFormula, getInlineStringNoStyle, getOrigincell } from '../global/getdata';
import { genarate, valueShowEs } from '../global/format';
import Store from '../store';
import { getSheetIndex, getRangetxt } from '../methods/get';
import luckysheetformula from '../global/formula';
import weConfigsetting from './configsetting';
import sheetmanage from '../controllers/sheetmanage';
import { luckysheetrefreshgrid, jfrefreshgrid } from '../global/refresh';
import luckysheetConfigsetting from '../controllers/luckysheetConfigsetting';
import { luckysheetlodingHTML } from '../controllers/constant';
import { Log } from './utils';

const weVariable = {
    variablePrefix: '#',
    log: new Log("weVariable", weConfigsetting.isLog),
    resolvedVariables: [],
    regex: /(?:([a-zA-Z0-9ก-ํ๐-๙_.]+)\!(\#[a-zA-Z0-9ก-ํ๐-๙_.]+|[A-Z]+[0-9]+)|(\#[a-zA-Z0-9ก-ํ๐-๙_.]+))/g,
    regexIsVar: /[^!](\#[a-zA-Z0-9ก-ํ๐-๙_.]+)/,
    regexTest: /\#([a-zA-Z0-9ก-ํ๐-๙_.]+)/,
    regexTestIsGlobal: /([a-zA-Zก-ฮ0-9_.']+)\!(\#[a-zA-Z0-9ก-ํ๐-๙_.]+|[A-Z]+[0-9]+)/,
    error: {
        c: "#CIRCULAR!",
        ce: "#CLIENT!",
        se: "#SERVER!",
        v: "#VAR!",
    },
    init: function(vPrefix) {
        console.log('weVariable::init');
        this.variablePrefix = vPrefix ? vPrefix : this.variablePrefix;
    },
    functionboxshow: function(r, c, d, cell) {
        if (weConfigsetting.formEditor) {
            if (isInlineStringCell(cell)) {
                return getInlineStringNoStyle(r, c);
            } else if (cell.df != null) {
                return getcellvalue(r, c, d, "df");
            } else {
                return valueShowEs(r, c, d);
            }
        } else {
            if (isInlineStringCell(cell)) {
                return getInlineStringNoStyle(r, c);
            } else if (cell.f != null) {
                return getcellvalue(r, c, d, "f");
            } else {
                return valueShowEs(r, c, d);
            }
        }

    },
    luckysheetupdateCell: function(r, c, d, cell) {
        if (weConfigsetting.formEditor) {
            if (isInlineStringCell(cell)) {
                return getInlineStringStyle(r, c, d);
            } else if (cell.df != null) {
                return getcellvalue(r, c, d, "df");
            } else {
                let v = valueShowEs(r, c, d);
                if (cell.qp == "1") {
                    v = "'" + v;
                }
                return v;
            }
        } else {
            if (isInlineStringCell(cell)) {
                return getInlineStringStyle(r, c, d);
            } else if (cell.f != null) {
                return getcellvalue(r, c, d, "f");
            } else {
                let v = valueShowEs(r, c, d);
                if (cell.qp == "1") {
                    v = "'" + v;
                }
                return v;
            }
        }
    },
    transformFormula: function(value) {
        const self = this;
        console.log('transformFormula', value);
        self.resolvedVariables.splice(0, self.resolvedVariables.length);
        if (getObjType(value) == "string") {
            let resolved = self.resolveFormula(value);
            console.log('transformFormula resolved', resolved);
            if (typeof resolved === 'string') {
                resolved = this.execFormula(resolved);
            }
            return [resolved[1], resolved[2], value];
        } else if (getObjType(value) == "object" && value.df != null) {
            let resolved = self.resolveFormula(value.df);
            console.log('transformFormula resolved', resolved);
            if (typeof resolved === 'string') {
                resolved = this.execFormula(resolved);
            }
            value.v = resolved[1];
            value.f = resolved[2];
            return value;
        }
    },
    resolveFormula: function(fx, isSub = false) {
        const func = 'resolveFormula';
        this.log.info(func, `with fx is "${fx}", isSub is "${isSub}".`);
        if (this.regex.test(fx) && !isSub) {
            this.log.debug(func, `"${fx}" is first variable not inside variable formula field.`);
            return this.resolveMultiVariable(fx);
        } else if (this.isGlobalFX(fx) && !this.regexIsVar.test(fx)) {
            if (!weConfigsetting.formApi)
                throw this.error.ce;
            let matched = fx.match(this.regexTestIsGlobal);
            let sheetName = matched[1].replace(/'/g, '');
            let afterSheetFx = matched[2];

            if (!sheetmanage.getSheetByName(sheetName)) {
                this.addRemoteSheet(sheetName);
            }

            this.log.debug(func, `in sheet "${sheetName}" with "${afterSheetFx}" is cross-sheet fx.`);
            if (this.regexTest.test(afterSheetFx)) {
                return this.resolveVariable(afterSheetFx, isSub, sheetName);
            } else {
                return `=${sheetName}!${afterSheetFx}`;
            }
        } else if (this.regexTest.test(fx)) {
            this.log.debug(func, `"${fx}" is sub variable inside variable formula field.`);
            return this.resolveVariable(fx, isSub);
        } else {
            this.log.debug(func, `"${fx}" is not variable so give it back to luckysheet formula execute.`);
            return fx;
        }
    },
    getVariableByName: function(name, isLocal, sheetName) {
        let variables = null;
        if (isLocal)
            variables = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["variable"];
        else
            variables = sheetmanage.getSheetByName(sheetName)["variable"];

        if (variables)
            return variables.find(item => item.name == name);
        else
            throw this.error.v;
    },
    detectCircular: function(varName) {
        if (this.resolvedVariables.includes(varName))
            throw this.error.c; // circular error string
        this.resolvedVariables.push(varName);
    },
    resolveMultiVariable: function(fx) {
        const func = 'resolveMultiVariable';
        this.log.info(func, `with fx is "${fx}".`);
        let variables = fx.match(this.regex);
        this.log.debug(func, `extract fx and got variables "${variables.toString()}".`);
        if (variables) {
            let tempFx = fx;
            for (let varName of variables) {
                let resolved = this.resolveFormula(varName, true);
                this.log.debug(func, `resolved variable "${varName}" and got result is "${resolved.toString()}".`);
                if (resolved == this.error.v) {
                    return tempFx.replace(varName, resolved);
                }
                if (typeof resolved === 'string' && resolved.substr(0, 1) == '=') {
                    resolved = resolved.replace('=', '');
                }
                tempFx = tempFx.replace(varName, resolved);
            }
            this.log.debug(func, `to retrun fx is "${tempFx}".`);
            return tempFx;
        } else {
            return fx;
        }
    },
    resolveVariable: function(fx, isSub, sheetName) {
        const func = 'resolveVariable';
        this.log.info(func, `with fx is "${fx}", isSub is "${isSub}", and sheetName "${sheetName}".`);
        let varName = fx.match(this.regexTest)[1];

        this.detectCircular(typeof sheetName == 'undefined' ? varName : `${sheetName}!${varName}`);

        let v = this.getVariableByName(varName, (typeof sheetName == 'undefined'), sheetName);
        if (!v) {
            this.log.warn(func, `variable "${varName}" is missing!`);
            throw this.error.v;
        }

        if (this.regex.test(v.formula)) {
            let resolved = this.execFormula(v.formula);
            this.log.debug(func, `resolved formula "${v.formula}" result is "${resolved.toString()}".`);
            if (!resolved)
                return '=' + v.formula;
            if (resolved[1] != '#NAME?') { // if fx is not variable
                v.value = resolved[1];
                v.formula = resolved[2];
                return isSub ? v.value : v.formula;
                // return resolved;
            } else { // if fx is variable
                return this.resolveMultiVariable(v.formula);
            }
        } else {
            return v.formula;
        }
    },
    addRemoteSheet: function(name) {
        let sheetName = name.replace('_', '-')
        let removeLoading = function(ex) {
            setTimeout(function() {
                $("#luckysheetloadingdata").fadeOut().remove();
            }, 500);
            if (ex)
                throw ex;
        }
        const self = this;
        let postData = { rptFormCode: sheetName };
        if (!weConfigsetting.formEditor) {
            postData['formReportSetId'] = weConfigsetting.formReportSetId;
        }
        $.ajax({
            url: weConfigsetting.formApi,
            type: 'post',
            dataType: 'json',
            data: postData,
            beforeSend: function() {
                console.log(`calling: "${weConfigsetting.formApi}" with code "${sheetName}".`);
                $("#" + luckysheetConfigsetting.container).append(luckysheetlodingHTML(false));
            },
            success: function(res, textStatus, jqXHR) {
                if (res.data) {
                    if (res.statusCode == "0") {
                        let formData = JSON.parse(res.data.data)[0];

                        formData.order = Store.luckysheetfile.length;
                        formData.index = name;
                        formData.status = 0;
                        formData.hide = 1;
                        formData.allowEdit = false;
                        formData.isTemp = true; //custom
                        formData.data = sheetmanage.buildGridData(formData.celldata);
                        Store.luckysheetfile.push(formData);
                        // sheetmanage.createSheetbydata(formData);
                        // sheetmanage.loadOtherFile(formData);

                        jfrefreshgrid();
                        removeLoading();
                    } else {
                        removeLoading(self.error.se);
                    }
                } else {
                    removeLoading(self.error.se);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('error', textStatus);
                removeLoading(self.error.ce);
            }
        });
    },
    variableHTML: function(text) {
        // console.log('variableHTML', text);
        // TODO: custom variable html display in formula bar here!

        // let self = this;
        // let varstack = text.split("");
        // let i = 0,
        //     str = "",
        //     var_str = "";
        // while (i < varstack.length) {
        //     let s = varstack[i];
        //     if(s == self.variablePrefix){
        //         let s_next = "";
        //         if ((i + 1) < varstack.length) {
        //             s_next = varstack[i + 1];
        //         }
        //         str += s;
        //     }else if(){

        //     }
        //     i++;
        // }
        // console.log(var_str);
        return text;
    },
    execFormula: function(txt) {
        if (typeof txt == "string" && txt.slice(0, 1) == "=" && txt.length > 1) {
            return luckysheetformula.execfunction(this.resolveFormula(txt), undefined, undefined, undefined, true);
        }
    },
    isGlobalFX: function(fx) {
        return this.regexTestIsGlobal.test(fx);
    }
}

export default weVariable;