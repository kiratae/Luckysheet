import { getObjType } from '../utils/util';
import { isInlineStringCell } from '../controllers/inlineString';
import { getcellvalue, getcellFormula, getInlineStringNoStyle, getInlineStringStyle, getOrigincell } from '../global/getdata';
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

let weVariableLogger = new Log("weVariable");

const weVariable = {
    variablePrefix: '#',
    resolvedVariables: [],
    // regex: /(?:([a-zA-Z0-9ก-๙_.']+)\!(\#[a-zA-Z0-9ก-๙_.]+|[A-Za-z\$]+[0-9\$]+)|(\#[a-zA-Z0-9ก-๙_.]+))/g,
    // regexIsVar: /[^!](\#[a-zA-Z0-9ก-๙_.]+)/,
    // regexTest: /\#([a-zA-Z0-9ก-๙_.]+)/,
    regexTestIsGlobal: /([a-zA-Zก-ฮ0-9_.'*-]+)\!(\#[a-zA-Z0-9ก-๙_.]+|(([A-Za-z\$]+[0-9\$]+\:[A-Za-z\$]+[0-9\$]+)|([A-Za-z\$]+[0-9\$]+)))/,
    globalRegex: /(?:(\'?[a-zA-Z0-9ก-๙_.*-]+\'?\!\#[a-zA-Z0-9ก-๙_.]+)|(\'?[a-zA-Z0-9ก-๙_.'*-]+\'?\!(([A-Za-z\$]+[0-9\$]+\:[A-Za-z\$]+[0-9\$]+)|([A-Za-z\$]+[0-9\$]+)))|(\#[a-zA-Z0-9ก-๙_.]+))/g,
    variableRegex: /\'?([a-zA-Z0-9ก-๙_.*-]+)\'?\!|(\#[a-zA-Z0-9ก-๙_.]+|(([A-Za-z\$]+[0-9\$]+\:[A-Za-z\$]+[0-9\$]+)|([A-Za-z\$]+[0-9\$]+)))/g,
    localVariableRegex: /(?<!\!)(\#[a-zA-Z0-9ก-๙_.]+)/,
    cellRefRegex: /(([A-Za-z\$]+[0-9\$]+\:[A-Za-z\$]+[0-9\$]+)|([A-Za-z\$]+[0-9\$]+))/g,
    error: {
        c: "#CIRCULAR!",
        ce: "#CLIENT!",
        se: "#SERVER!",
        v: "#VAR!",
        arg: "#ARG!",
        d: "#DATA!",
    },
    variableHTMLIndex: 0,
    primarySheet: null,
    init: function(vPrefix) {
        let func = 'init';
        weVariableLogger.info(func, 'has been initialized.');
        this.variablePrefix = vPrefix ? vPrefix : this.variablePrefix;
    },
    functionboxshow: function(r, c, d, cell) {
        if (isInlineStringCell(cell)) {
            return getInlineStringNoStyle(r, c);
        } else if (cell.df != null) {
            return getcellvalue(r, c, d, "df");
        } else {
            return valueShowEs(r, c, d);
        }
    },
    luckysheetupdateCell: function(r, c, d, cell) {
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
    },
    transformFormula: function(value) {
        const func = 'transformFormula';
        weVariableLogger.info(func, `has been call with value is "${value}".`);
        this.resolvedVariables.splice(0, this.resolvedVariables.length);
        if (getObjType(value) == "string") {
            let resolved = this.resolveFormula(value);
            weVariableLogger.info(func, `"${value}" has been resolved, and result is "${JSON.stringify(resolved)}".`);
            if (typeof resolved === 'string') {
                resolved = this.execFormula(resolved);
            }
            weVariableLogger.info(func, `final "${value}" has been resolved, and result is "${JSON.stringify(resolved)}".`);
            return [resolved[1], resolved[2], value];
        } else if (getObjType(value) == "object" && value.df != null) {
            let resolved = this.resolveFormula(value.df);
            weVariableLogger.info(func, `"${value}" has been resolved, and result is "${JSON.stringify(resolved)}".`);
            if (typeof resolved === 'string') {
                resolved = this.execFormula(resolved);
            }
            weVariableLogger.info(func, `final "${JSON.stringify(value)}" has been resolved, and result is "${JSON.stringify(resolved)}".`);
            value.v = resolved[1];
            value.f = resolved[2];
            return value;
        }
    },
    getVariableByName: function(name, isLocal = true, sheetName = null) {
        const func = 'getVariableByName';
        weVariableLogger.info(func, `has been call with name is "${name}", isLocal is "${isLocal}", and sheetName is "${sheetName}".`);
        try {
            let variables = null;
            if (isLocal && sheetName == null) {
                let file = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)];
                console.log('file', file);
                variables = file.variable;
            } else {
                let file = sheetmanage.getSheetByName(sheetName);
                console.log('file', file);
                variables = file.variable;
            }


            if (variables)
                return variables.find(item => item.name == name);
            else
                return null;
        } catch (ex) {
            throw this.error.v;
        }
    },
    addRemoteSheet: function(name, previousAmt = 0) {
        const func = 'addRemoteSheet';
        weVariableLogger.info(func, `has been call with name is "${name}" and previousAmt is "${previousAmt}".`);

        let removeLoading = function() {
            setTimeout(function(ex) {
                $("#luckysheetloadingdata").fadeOut().remove();
                if (ex)
                    throw ex;
            }, 500);
        }
        const self = this;
        let postData = { rptFormCode: name };
        if (previousAmt > 0) {
            postData['rptFormCode'] = name.replace(/\*/g, '');
            postData['previousAmt'] = previousAmt;
        }
        if (!weConfigsetting.formEditor) {
            postData['formReportSetId'] = weConfigsetting.formReportSetId;
        }
        $.ajax({
            url: weConfigsetting.formApi,
            type: 'post',
            dataType: 'json',
            data: postData,
            beforeSend: function() {
                weVariableLogger.debug(func, `is calling to "${weConfigsetting.formApi}" with data "${JSON.stringify(postData)}".`);
                $("#" + luckysheetConfigsetting.container).append(luckysheetlodingHTML(false));
            },
            success: function(res, textStatus, jqXHR) {
                if (res.data) {
                    if (res.statusCode == "0") {
                        if (weConfigsetting.deserializeHelper != null && getObjType(weConfigsetting.deserializeHelper) == "function") {
                            try {
                                let formData = weConfigsetting.deserializeHelper(res.data.data)[0];

                                formData.order = Store.luckysheetfile.length;
                                formData.index = res.data.rptFormId + (previousAmt > 0 ? Array(previousAmt + 1).join('*') : "")
                                formData.name = name;
                                formData.status = 0;
                                formData.hide = 1;
                                formData.allowEdit = false;
                                formData.isTemp = true; //custom
                                formData.variable = res.data.formVariables;
                                formData.data = sheetmanage.buildGridData(formData);
                                Store.luckysheetfile.push(formData);

                                jfrefreshgrid();
                                removeLoading();
                            } catch (ex) {
                                removeLoading(self.error.d);
                            }
                        } else {
                            removeLoading(self.error.arg);
                        }
                    } else {
                        removeLoading(self.error.se);
                    }
                } else {
                    removeLoading(self.error.se);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                weVariableLogger.error(func, `is calling to "${weConfigsetting.formApi}" has been error with text status is "${textStatus}".`);
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
    execFormula: function(txt, outsider = false) {
        if (typeof txt == "string" && txt.slice(0, 1) == "=" && txt.length > 1) {
            if (outsider) {
                return luckysheetformula.execfunction(this.resolveFormula(txt), undefined, undefined, undefined, true);
            } else {
                return luckysheetformula.execfunction(txt, undefined, undefined, undefined, true);
            }
        } else {
            return null;
        }
    },
    isGlobalFX: function(fx) {
        return this.regexTestIsGlobal.test(fx);
    },
    resolveFormula: function(fx) {
        const func = "resolveFormula";
        weVariableLogger.info(func, `has been call with fx is "${fx}".`);
        if (this.hasVariable(fx)) {
            let varContexts = this.getVariableContexts(fx);
            if (varContexts && varContexts.length && typeof varContexts === 'object') {
                for (var i = 0; i < varContexts.length; i++) {
                    var varContext = varContexts[i];
                    if (this.isLocalVariable(varContext)) {
                        this.checkCircular(varContext);
                        var varName = varContext.replace(/#/g, '');
                        var variable = this.getVariableByName(varName);
                        if (variable) {
                            var resolved = this.resolveFormula(variable.formula);
                            resolved = resolved.replace(/=/g, '');
                            fx = fx.replace(new RegExp(this.escapeRegExp(varContext)), resolved);
                        } else {
                            throw this.error.v;
                        }
                    } else {
                        var matched = varContext.match(this.variableRegex);
                        if (matched && matched.length === 2) {
                            var sheetName = matched[0].replace(/'|!/g, '');
                            sheetName = sheetName.replace('_', '-');
                            var afterSheetFx = matched[1];

                            let matchStar = sheetName.match(/\*/g);
                            let prvAmt = matchStar != null ? matchStar.length : 0;

                            console.log('sheetName', sheetName, 'prvAmt', prvAmt);

                            // if not have sheet in current client go to get it from remote
                            if (!sheetmanage.getSheetByName(sheetName)) {
                                if (prvAmt > 0) {
                                    if (weConfigsetting.formEditor) {
                                        throw this.error.v;
                                    }
                                    this.addRemoteSheet(sheetName, prvAmt);
                                } else {
                                    this.addRemoteSheet(sheetName);
                                }
                            }

                            if (this.isLocalVariable(afterSheetFx)) {
                                this.checkCircular(varContext);
                                var varName = afterSheetFx.replace(/#/g, '');
                                console.log('varName', varName);
                                var variable = this.getVariableByName(varName, false, sheetName);
                                if (variable) {
                                    // tranform formula
                                    let cellRange = variable.formula.match(this.cellRefRegex);
                                    console.log('variable.formula cellRange', cellRange);
                                    let tempFx = variable.formula;
                                    if (cellRange && cellRange.length && typeof cellRange === 'object') {
                                        for (var i = 0; i < cellRange.length; i++) {
                                            tempFx = tempFx.replace(new RegExp(cellRange[i]), `'${sheetName}'!${cellRange[i]}`);
                                        }
                                    }
                                    console.log('variable.formula', tempFx);
                                    let resolved = this.resolveFormula(tempFx);
                                    resolved = resolved.replace(/=/g, '');
                                    fx = fx.replace(new RegExp(this.escapeRegExp(varContext)), resolved);
                                } else {
                                    throw this.error.v;
                                }
                            } else {
                                continue;
                            }
                        } else {
                            continue;
                            // console.error('Global variable has some error.');
                            // throw this.error.ce;
                        }
                    }
                }
                return fx;
            } else {
                return fx;
            }
        } else {
            return fx;
        }
    },
    hasVariable: function(fx) {
        return this.globalRegex.test(fx);
    },
    isLocalVariable: function(fx) {
        return this.localVariableRegex.test(fx);
    },
    getVariableContexts: function(fx) {
        return fx.match(this.globalRegex);
    },
    checkCircular: function(varContext) {
        if (this.resolvedVariables.includes(varContext))
            throw this.error.c; // circular error string
        this.resolvedVariables.push(varContext);
    },
    isVariable: function(txt) {
        // console.log('isVariable', txt);
        if (txt.toString().match(this.variableRegex)) {
            return true;
        } else {
            return false;
        }
    },
    escapeRegExp: function(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }
}

export default weVariable;