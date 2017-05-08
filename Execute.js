var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var LispExecute;
(function (LispExecute) {
    //符号装饰器集合
    var SymDecorator = (function () {
        function SymDecorator() {
        }
        SymDecorator.SymbolDef = function (name, NeedStore, thisobj, NeedCalPars, NeedTransObject) {
            var sym = {
                key: name,
                isNeedStore: NeedStore,
                Callthis: thisobj,
                isNeedCal: NeedCalPars,
                isNeedTrans: NeedTransObject
            };
            //此处不能使用箭头函数
            //此处的this对象为Executer对象
            return function (target, propertyKey, descriptor) {
                sym.val = target[propertyKey];
                if (target.symbols == null)
                    target.symbols = [];
                target.symbols.push(sym);
            };
        };
        return SymDecorator;
    }());
    LispExecute.SymDecorator = SymDecorator;
    var LinkContainer = (function (_super) {
        __extends(LinkContainer, _super);
        function LinkContainer(LinkObject) {
            if (LinkObject === void 0) { LinkObject = null; }
            var _this = _super.call(this) || this;
            _this.LinkObject = LinkObject;
            return _this;
        }
        LinkContainer.prototype.TrySearch = function (name) {
            var ret = _super.prototype.TrySearch.call(this, name);
            if (ret != undefined)
                return ret;
            //分解名字
            if (this.LinkObject != null) {
                var paths = name.split('.');
                var now = this.LinkObject;
                var old = void 0;
                for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
                    var t = paths_1[_i];
                    old = now;
                    now = now[t];
                    if (now == null) {
                        return undefined;
                    }
                }
                if (typeof now != "function")
                    return new LispExecute.LispObject(this.LinkObject[name]);
                else
                    return new LispExecute.LispRawProcess(name, now, false, old);
            }
            return undefined;
        };
        LinkContainer.prototype.RawTrySearch = function (name) {
            return _super.prototype.TrySearch.call(this, name);
        };
        return LinkContainer;
    }(LispExecute.Store));
    LispExecute.LinkContainer = LinkContainer;
    /**
     * 提供顶层环境和外部接口
     */
    var Executer = (function () {
        function Executer(link, initstate) {
            if (link === void 0) { link = null; }
            //先加入预定义符号 加减乘除等
            this.TopContainer = new LinkContainer(link);
            this.AddPreSymbols();
            if (initstate != null)
                for (var _i = 0, initstate_1 = initstate; _i < initstate_1.length; _i++) {
                    var t = initstate_1[_i];
                    this.SetSymbol(t);
                }
        }
        Executer.prototype.AddPreSymbols = function () {
            for (var _i = 0, _a = this.symbols; _i < _a.length; _i++) {
                var t = _a[_i];
                this.SetSymbol(t);
            }
        };
        /**
         * 设置一个符号 可以覆盖
         * @param sym 符号
         */
        Executer.prototype.SetSymbol = function (sym) {
            this.TopContainer.Set(sym.key, this.ToTable(sym));
        };
        /**
         * 为一个符号设置别名
         * @param sname 原名
         * @param nname 新名
         */
        Executer.prototype.SetOtherName = function (sname, nname) {
            var obj = this.TopContainer.RawTrySearch(sname);
            if (obj != null) {
                this.TopContainer.Set(nname, obj);
            }
        };
        /**
         * 获取一个符号代表的变量 自动类型转换
         * @param name 获取的变量的名字
         */
        Executer.prototype.GetSymbol = function (name) {
            var obj = this.TopContainer.TrySearch(name);
            if (obj == undefined)
                return undefined;
            return this.ToRaw(obj);
        };
        Executer.prototype.ToRaw = function (obj) {
            if (obj.Type == "object") {
                var oobj = obj;
                return oobj.Object;
            }
            else if (obj instanceof LispExecute.LispRawProcess) {
                var fun = obj;
                return fun.rawFunc;
            }
            //不需要转换就直接返回
            return obj;
        };
        Executer.prototype.ToString = function (obj) {
            var _this = this;
            //内部计算函数
            var infun = function (tobj) {
                var res = "";
                if (tobj.Type == "normal") {
                    var nowres = "";
                    for (var _i = 0, _a = tobj.childs; _i < _a.length; _i++) {
                        var t = _a[_i];
                        nowres += infun(t) + " ";
                    }
                    //这一步去掉末尾空格
                    nowres = nowres.slice(0, nowres.length - 1);
                    res = "(" + nowres + ")";
                }
                else if (tobj.Type == "symbol") {
                    //处理符号 符号表示为符号名字
                    res = tobj.name;
                }
                else if (tobj.Type == "process") {
                    res = "#process:" + tobj.Name;
                }
                else {
                    //为数据对象时就调用json转换为文本
                    res = JSON.stringify(_this.ToRaw(tobj));
                }
                return res;
            };
            var result = infun(obj);
            if (obj.Type != "object" && obj.Type != "process") {
                result = "'" + result;
            }
            return result;
        };
        /**
         * 此处sympair中仅val和函数专属的属性有效key可以为null
         * @param sym 符号 key无用
         */
        Executer.prototype.ToTable = function (sym) {
            //如果val是object就转换为Table
            if (sym.val instanceof LispExecute.Table) {
                //如果是表就直接加入 否则封装为LispObject
                return sym.val;
            }
            else if (typeof sym.val == "function") {
                //封装函数
                var fun = sym.val;
                var func = new LispExecute.LispRawProcess(sym.key, fun, sym.isNeedStore, sym.Callthis, sym.isNeedCal, sym.isNeedTrans);
                return func;
            }
            else {
                var lobj = new LispExecute.LispObject(sym.val);
                return lobj;
            }
        };
        /**
         *
         * @param obj 要计算的顶层表
         * @param link 要链接到的js顶层对象
         */
        Executer.prototype.Run = function (obj, isstring) {
            if (isstring === void 0) { isstring = false; }
            var ret = obj.Calculate(this.TopContainer);
            if (!isstring)
                return this.ToRaw(ret);
            else {
                return this.ToString(ret);
            }
        };
        return Executer;
    }());
    LispExecute.Executer = Executer;
})(LispExecute || (LispExecute = {}));
//# sourceMappingURL=Execute.js.map