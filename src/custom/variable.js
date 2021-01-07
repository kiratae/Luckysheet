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

const weVariable = {
    variablePrefix: '#',
    log: new Log("weVariable", weConfigsetting.isLog),
    resolvedVariables: [],
    // regex: /(?:([a-zA-Z0-9ก-๙_.']+)\!(\#[a-zA-Z0-9ก-๙_.]+|[A-Za-z\$]+[0-9\$]+)|(\#[a-zA-Z0-9ก-๙_.]+))/g,
    // regexIsVar: /[^!](\#[a-zA-Z0-9ก-๙_.]+)/,
    // regexTest: /\#([a-zA-Z0-9ก-๙_.]+)/,
    regexTestIsGlobal: /([a-zA-Zก-ฮ0-9_.']+)\!(\#[a-zA-Z0-9ก-๙_.]+|(([A-Za-z\$]+[0-9\$]+\:[A-Za-z\$]+[0-9\$]+)|([A-Za-z\$]+[0-9\$]+)))/,
    globalRegex: /(?:(\'?[a-zA-Z0-9ก-๙_.]+\'?\!\#[a-zA-Z0-9ก-๙_.]+)|(\'?[a-zA-Z0-9ก-๙_.']+\'?\!(([A-Za-z\$]+[0-9\$]+\:[A-Za-z\$]+[0-9\$]+)|([A-Za-z\$]+[0-9\$]+)))|(\#[a-zA-Z0-9ก-๙_.]+))/g,
    variableRegex: /\'?([a-zA-Z0-9ก-๙_.]+)\'?\!|(\#[a-zA-Z0-9ก-๙_.]+|(([A-Za-z\$]+[0-9\$]+\:[A-Za-z\$]+[0-9\$]+)|([A-Za-z\$]+[0-9\$]+)))/g,
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
    primarySheet: null,
    init: function(vPrefix) {
        let func = 'init';
        this.log.info(func, 'has been initialized.');
        this.variablePrefix = vPrefix ? vPrefix : this.variablePrefix;
    },
    functionboxshow: function(r, c, d, cell) {
        // if (weConfigsetting.formEditor) {
        if (isInlineStringCell(cell)) {
            return getInlineStringNoStyle(r, c);
        } else if (cell.df != null) {
            return getcellvalue(r, c, d, "df");
        } else {
            return valueShowEs(r, c, d);
        }
        // } else {
        //     if (isInlineStringCell(cell)) {
        //         return getInlineStringNoStyle(r, c);
        //     } else if (cell.f != null) {
        //         return getcellvalue(r, c, d, "f");
        //     } else {
        //         return valueShowEs(r, c, d);
        //     }
        // }

    },
    luckysheetupdateCell: function(r, c, d, cell) {
        // if (weConfigsetting.formEditor) {
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
        // } else {
        //     if (isInlineStringCell(cell)) {
        //         return getInlineStringStyle(r, c, d);
        //     } else if (cell.f != null) {
        //         return getcellvalue(r, c, d, "f");
        //     } else {
        //         let v = valueShowEs(r, c, d);
        //         if (cell.qp == "1") {
        //             v = "'" + v;
        //         }
        //         return v;
        //     }
        // }
    },
    transformFormula: function(value) {
        const func = 'transformFormula';
        this.log.info(func, `has been call with value is "${value}".`);
        this.resolvedVariables.splice(0, this.resolvedVariables.length);
        if (getObjType(value) == "string") {
            let resolved = this.resolveFormula2(value);
            this.log.info(func, `"${value}" has been resolved, and result is "${JSON.stringify(resolved)}".`);
            if (typeof resolved === 'string') {
                resolved = this.execFormula(resolved);
            }
            this.log.info(func, `final "${value}" has been resolved, and result is "${JSON.stringify(resolved)}".`);
            return [resolved[1], resolved[2], value];
        } else if (getObjType(value) == "object" && value.df != null) {
            let resolved = this.resolveFormula2(value.df);
            this.log.info(func, `"${value}" has been resolved, and result is "${JSON.stringify(resolved)}".`);
            if (typeof resolved === 'string') {
                resolved = this.execFormula(resolved);
            }
            this.log.info(func, `final "${JSON.stringify(value)}" has been resolved, and result is "${JSON.stringify(resolved)}".`);
            value.v = resolved[1];
            value.f = resolved[2];
            return value;
        }
    },
    /* ⛔ DEPRECATED
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
    */
    getVariableByName: function(name, isLocal = true, sheetName = null) {
        const func = 'getVariableByName';
        this.log.info(func, `has been call with name is "${name}", isLocal is "${isLocal}", and sheetName is "${sheetName}".`);
        try {
            let variables = null;
            if (isLocal && sheetName == null)
                variables = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["variable"];
            else
                variables = sheetmanage.getSheetByName(sheetName)["variable"];

            if (variables)
                return variables.find(item => item.name == name);
            else
                return null;
        } catch (ex) {
            throw this.error.v;
        }
    },
    /* ⛔ DEPRECATED
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
        let tempFx = fx;
        if (variables) {
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
            this.log.debug(func, `to return fx is "${tempFx}".`);
            return tempFx;
        } else {
            return tempFx;
        }
    },
    resolveVariable: function(fx, isSub, sheetName) {
        const func = 'resolveVariable';
        this.log.info(func, `with fx is "${fx}", isSub is "${isSub}", and sheetName "${sheetName}".`);
        let varName = fx.match(this.regexTest)[1];

        let formula = typeof sheetName == 'undefined' ? varName : `${sheetName}!#${varName}`;

        this.detectCircular(formula);

        let v = this.getVariableByName(varName, (typeof sheetName == 'undefined'), sheetName);
        if (!v) {
            this.log.warn(func, `variable "${varName}" is missing!`);
            throw this.error.v;
        }

        // if v.formula have variable
        if (this.regex.test(v.formula)) {
            console.log(func, `${v.formula} have a variable`);
            console.log(func, 'v.formula', v.formula);
            console.log(func, 'formula', formula);
            // let resolved = this.execFormula(v.formula);
            let resolved = this.resolveFormula(v.formula, isSub);
            this.log.debug(func, `resolved formula "${v.formula}" result is "${resolved.toString()}".`);

            if (typeof sheetName == 'undefined') {
                let varName2 = v.formula.match(this.regexTest)[1];
                console.log('varName2', varName2);
            } else {
                let varName2 = v.formula.match(this.regexTestIsGlobal);
                console.log('varName2', varName2);
            }
            // if (typeof resolved === 'string' && resolved.substr(0, 1) == '=') {
            //     resolved = resolved.replace('=', '');
            // }
            // let tempFormula = v.formula.replace(varName, resolved);

            return resolved;
            // if (!resolved)
            //     return '=' + v.formula;
            // if (resolved[1] != '#NAME?') { // if fx is not variable
            //     v.value = resolved[1];
            //     // replace varName with resolved
            //     // if (typeof resolved[2] === 'string' && resolved[2].substr(0, 1) == '=') {
            //     //     resolved[2] = resolved[2].replace('=', '');
            //     // }
            //     let tempFx = v.formula.replace(formula, resolved[2]);
            //     console.log(func, 'tempFx', tempFx);
            //     return isSub ? v.value : resolved[2];
            //     // return resolved;
            // } else { // if fx is variable
            //     return this.resolveMultiVariable(v.formula);
            // }
        } else {
            console.log(func, `${v.formula} not have a variable`);
            return v.formula;
        }
    },
    */
    addRemoteSheet: function(name) {
        const func = 'addRemoteSheet';
        this.log.info(func, `has been call with name is "${name}".`);
        let sheetName = name.replace('_', '-');
        let removeLoading = function() {
            setTimeout(function(ex) {
                $("#luckysheetloadingdata").fadeOut().remove();
                if (ex)
                    throw ex;
            }, 500);
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
                self.log.debug(func, `is calling to "${weConfigsetting.formApi}" with data "${JSON.stringify(postData)}".`);
                $("#" + luckysheetConfigsetting.container).append(luckysheetlodingHTML(false));
            },
            success: function(res, textStatus, jqXHR) {
                if (res.data) {
                    if (res.statusCode == "0") {
                        if (weConfigsetting.deserializeHelper != null && getObjType(weConfigsetting.deserializeHelper) == "function") {
                            try {
                                let formData = weConfigsetting.deserializeHelper(res.data.data)[0];

                                formData.order = Store.luckysheetfile.length;
                                formData.index = name;
                                formData.status = 0;
                                formData.hide = 1;
                                formData.allowEdit = false;
                                formData.isTemp = true; //custom
                                formData.variable = res.data.formVariables;
                                formData.data = sheetmanage.buildGridData(formData);
                                Store.luckysheetfile.push(formData);
                                // sheetmanage.createSheetbydata(formData);
                                // sheetmanage.loadOtherFile(formData);

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
                self.log.error(func, `is calling to "${weConfigsetting.formApi}" has been error with text status is "${textStatus}".`);
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
                return luckysheetformula.execfunction(this.resolveFormula2(txt), undefined, undefined, undefined, true);
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
    resolveFormula2: function(fx) {
        console.log('resolveFormula2', fx);
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
                            var resolved = this.resolveFormula2(variable.formula);
                            resolved = resolved.replace(/=/g, '');
                            fx = fx.replace(new RegExp(varContext), resolved);
                        } else {
                            throw this.error.v;
                        }
                    } else {
                        var matched = varContext.match(this.variableRegex);
                        console.log('matched', matched);
                        if (matched && matched.length === 2) {
                            var sheetName = matched[0].replace(/'|!/g, '');
                            var afterSheetFx = matched[1];
                            console.log('sheetName', sheetName);
                            console.log('afterSheetFx', afterSheetFx);

                            // if not have sheet in current client go to get it from remote
                            if (!sheetmanage.getSheetByName(sheetName)) {
                                this.addRemoteSheet(sheetName);
                            }

                            if (this.isLocalVariable(afterSheetFx)) {
                                this.checkCircular(varContext);
                                var varName = afterSheetFx.replace(/#/g, '');
                                var variable = this.getVariableByName(varName, false, sheetName);
                                if (variable) {
                                    console.log('other sheet variable formula before', variable.formula);
                                    // tranform formula
                                    let cellRange = variable.formula.match(this.cellRefRegex);
                                    console.log('other sheet variable cellRange', cellRange);
                                    if (cellRange && cellRange.length && typeof cellRange === 'object') {
                                        for (var i = 0; i < cellRange.length; i++) {
                                            variable.formula = variable.formula.replace(new RegExp(cellRange[i]), `'${sheetName}'!${cellRange[i]}`);
                                        }
                                    }
                                    console.log('other sheet variable formula after', variable.formula);
                                    var resolved = this.resolveFormula2(variable.formula);
                                    resolved = resolved.replace(/=/g, '');
                                    fx = fx.replace(new RegExp(varContext), resolved);
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
    }
}

export default weVariable;