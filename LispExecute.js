var LispExecute;
(function (LispExecute) {
    /**
     * 提供顶层环境和外部接口
     */
    var Lisp = (function () {
        function Lisp(initstate) {
            this.TopContainer = new Map();
            //先加入预定义符号 加减乘除等
            this.AddPreSymbols();
            if (initstate != null)
                for (var _i = 0, initstate_1 = initstate; _i < initstate_1.length; _i++) {
                    var t = initstate_1[_i];
                    this.SetSymbol(t);
                }
        }
        Lisp.prototype.AddPreSymbols = function () {
            this.SetSymbol({ key: '+', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    if (typeof args[0] != "number" && typeof args[0] != "string")
                        throw new Error("错误！运算对象类型错误！");
                    var sum = typeof args[0] == "number" ? 0 : "";
                    for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
                        var t = args_1[_a];
                        if (typeof t != "number" && typeof t != "string")
                            throw new Error("错误！运算对象类型错误！");
                        sum += t;
                    }
                    return sum;
                } });
            //减法只能用于数字
            this.SetSymbol({ key: '-', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    if (typeof args[0] != "number")
                        throw new Error("错误！运算对象类型错误！");
                    var sum = args[0];
                    for (var _a = 0, _b = args.slice(1, args.length); _a < _b.length; _a++) {
                        var t = _b[_a];
                        if (typeof args[0] != "number")
                            throw new Error("错误！运算对象类型错误！");
                        sum -= t;
                    }
                    return sum;
                } });
            //乘法可以用于重复语义和数字
            this.SetSymbol({ key: '*', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var sum = args[0];
                    //注意 第一个参数为字符串则整体为重复语义 数字则为乘法语义
                    if (typeof sum == "string") {
                        //重复语义
                        var nowblock = sum;
                        for (var _a = 0, _b = args.slice(1, args.length); _a < _b.length; _a++) {
                            var a = _b[_a];
                            if (typeof a != "number")
                                throw new Error("错误！重复语义乘法除第一个参数外必须都为Number型!");
                            for (var i = 0; i < a; ++i) {
                                sum += nowblock;
                            }
                            nowblock = sum;
                        }
                    }
                    else if (typeof sum == "number") {
                        for (var _c = 0, _d = args.slice(1, args.length); _c < _d.length; _c++) {
                            var a = _d[_c];
                            sum *= a;
                        }
                    }
                    else
                        throw new Error("错误！运算对象类型错误！");
                    ;
                    return sum;
                } });
            this.SetSymbol({ key: '/', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    if (typeof args[0] != "number")
                        throw new Error("错误！运算对象类型错误！");
                    var sum = args[0];
                    for (var _a = 0, _b = args.slice(1, args.length); _a < _b.length; _a++) {
                        var t = _b[_a];
                        if (typeof args[0] != "number")
                            throw new Error("错误！运算对象类型错误！");
                        sum /= t;
                    }
                    return sum;
                } });
            //比较操作部分
            this.SetSymbol({ key: '>', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var old = args[0];
                    for (var _a = 0, _b = args.slice(1, args.length); _a < _b.length; _a++) {
                        var t = _b[_a];
                        if (!(old > t))
                            return false;
                        old = t;
                    }
                    return true;
                } });
            this.SetSymbol({ key: '<', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var old = args[0];
                    for (var _a = 0, _b = args.slice(1, args.length); _a < _b.length; _a++) {
                        var t = _b[_a];
                        if (!(old < t))
                            return false;
                        old = t;
                    }
                    return true;
                } });
            this.SetSymbol({ key: '=', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var old = args[0];
                    for (var _a = 0, _b = args.slice(1, args.length); _a < _b.length; _a++) {
                        var t = _b[_a];
                        if (!(old == t))
                            return false;
                        old = t;
                    }
                    return true;
                } });
            this.SetSymbol({ key: '>=', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var old = args[0];
                    for (var _a = 0, _b = args.slice(1, args.length); _a < _b.length; _a++) {
                        var t = _b[_a];
                        if (!(old >= t))
                            return false;
                        old = t;
                    }
                    return true;
                } });
            this.SetSymbol({ key: '<=', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var old = args[0];
                    for (var _a = 0, _b = args.slice(1, args.length); _a < _b.length; _a++) {
                        var t = _b[_a];
                        if (!(old <= t))
                            return false;
                        old = t;
                    }
                    return true;
                } });
            this.SetSymbol({ key: 'do', isneedcircum: true, callthis: null, isneedcal: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    //此过程对接收的每个参数求值 后返回最后一个求值的结果
                    //此过程用于将多个Table联合在一起作为一个Table求值
                    var ret;
                    for (var _a = 0, args_2 = args; _a < args_2.length; _a++) {
                        var a = args_2[_a];
                        ret = a.Calculate(circum);
                    }
                    return ret.Calculate(circum);
                } });
            this.SetSymbol({ key: 'define', isneedcircum: true, callthis: null, isneedcal: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    //这里来构造一个process
                    //先构造body
                    var bodylist = args.slice(1, args.length); //得到body序列
                    //合成一个body
                    var body = new LispExecute.Table();
                    body.childs.push(new LispExecute.LispSymbolRefence("do")); //使用do操作符连接多个table
                    body.childs = body.childs.concat(bodylist);
                    var def = new LispExecute.Table();
                    def.childs[0] = args[0];
                    def.childs[1] = body;
                    var proc = new LispExecute.LispDefProcess(def);
                    //加入环境
                    circum(proc.Name, proc);
                } });
            this.SetSymbol({ key: 'if', isneedcircum: true, callthis: null, isneedcal: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    //这里来判断条件
                    if (args.length < 2)
                        throw new Error("错误！IF操作参数过少！");
                    var p = args[0];
                    var res = p.Calculate(circum);
                    var bres = true;
                    if (res.Type == "object") {
                        var rres = res;
                        if (rres.Object == false)
                            bres = false;
                        //除了false其他都被作为true
                    }
                    //如果条件为真则执行A 否则如果有B则执行B 没有就返回空表
                    var A = args[1];
                    if (bres) {
                        return A.Calculate(circum);
                    }
                    if (args.length >= 3) {
                        var B = args[2];
                        return B.Calculate(circum);
                    }
                    else
                        return undefined;
                } });
        };
        /**
         * 设置一个符号 可以覆盖
         * @param sym 符号
         */
        Lisp.prototype.SetSymbol = function (sym) {
            this.TopContainer.set(sym.key, this.ToTable(sym));
        };
        /**
         * 获取一个符号代表的变量 自动类型转换
         * @param name 获取的变量的名字
         */
        Lisp.prototype.GetSymbol = function (name) {
            if (!this.TopContainer.has(name))
                return null;
            var obj = this.TopContainer.get(name);
            return this.ToRaw(obj);
        };
        Lisp.prototype.ToRaw = function (obj) {
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
        /**
         * 此处sympair中仅val和函数专属的属性有效key可以为null
         * @param sym 符号 key无用
         */
        Lisp.prototype.ToTable = function (sym) {
            //如果val是object就转换为Table
            if (sym.val instanceof LispExecute.Table) {
                //如果是表就直接加入 否则封装为LispObject
                return sym.val;
            }
            else if (typeof sym.val == "function") {
                //封装函数
                var fun = sym.val;
                var func = new LispExecute.LispRawProcess(fun.name, fun, sym.isneedcircum, sym.callthis, sym.isneedcal);
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
        Lisp.prototype.Run = function (obj, link) {
            var _this = this;
            var func = function (name, val) {
                if (val == null) {
                    if (_this.TopContainer.has(name))
                        return _this.TopContainer.get(name);
                    if (link != null) {
                        var now = link;
                        var old = void 0;
                        var paths = name.split('.');
                        var isok = true; //是否成功找到
                        for (var i = 0; i < paths.length; ++i) {
                            old = now;
                            now = now[paths[i]];
                            if (now == null) {
                                isok = false;
                                break;
                            }
                        }
                        if (isok) {
                            var func_1 = now;
                            var proc = new LispExecute.LispRawProcess(func_1.name, func_1, false, old, true, true);
                            return proc;
                        }
                    }
                    return undefined;
                }
                _this.TopContainer.set(name, val);
            };
            var ret = obj.Calculate(func);
            return this.ToRaw(ret);
        };
        return Lisp;
    }());
    LispExecute.Lisp = Lisp;
})(LispExecute || (LispExecute = {}));
//# sourceMappingURL=LispExecute.js.map