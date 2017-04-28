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
    var LispExecuter = (function (_super) {
        __extends(LispExecuter, _super);
        function LispExecuter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        //此处约定
        //非普通js函数语义的 一律不使用提前计算参数和
        //但是可以使用转化标记
        LispExecuter.prototype.AddPreSymbols = function () {
            var istrue = function (tb) {
                //检查计算的结果是否为真
                //非false则为true   
                //空表为false
                if (tb.Type == "normal" && tb.childs.length == 0)
                    return false;
                if (tb.Type == "object" && tb.Object == false)
                    return false;
                return true;
            };
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
            //工具函数将几个表链接成一个do引导的执行列表
            var linkfunc = function (tabs) {
                var ret = new LispExecute.Table();
                ret.childs = [new LispExecute.LispSymbolRefence('do')].concat(tabs);
                return ret;
            };
            //将几个表连接起来
            this.SetSymbol({ key: 'do', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
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
            this.SetSymbol({ key: 'define', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    //判断定义类型 如果def部分为normal表则为过程定义
                    //否则则为变量定义
                    //注意define操作符不返回值 即返回undefined
                    if (args.length < 2)
                        throw new Error("参数数量不正确");
                    var head = args[0];
                    if (head.Type == "symbol") {
                        //变量定义
                        if (args.length > 2)
                            throw new Error("变量定义形式错误！参数数量不正确");
                        var val = args[1];
                        circum.Set(head.name, val.Calculate(circum));
                        return undefined;
                    }
                    if (head.Type == "normal") {
                        //这里来构造一个process
                        //先构造body
                        var bodylist = args.slice(1, args.length); //得到body序列
                        //合成一个body
                        var body = linkfunc(bodylist);
                        var def = new LispExecute.Table();
                        def.childs[0] = args[0];
                        def.childs[1] = body;
                        var proc = new LispExecute.LispDefProcess(def);
                        //加入环境
                        circum.Set(proc.Name, proc);
                        return undefined;
                    }
                    throw new Error("符号定义错误！头部类型不正确");
                } });
            this.SetSymbol({ key: 'if', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
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
            this.SetSymbol({ key: 'typeof', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (args.length != 1)
                        throw "参数数量错误！";
                    return args[0].Calculate(circum).Type;
                    //这里之所以不直接标记需要计算参数，原因是避免很多参数时进行大量的参数计算
                } });
            this.SetSymbol({ key: 'objtype', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (args.length != 1)
                        throw "参数数量错误！";
                    var temp = args[0].Calculate(circum);
                    if (temp.Type == "object") {
                        return new LispExecute.LispObject(typeof temp.Object);
                    }
                    throw new Error("错误！只能对数据对象使用objtype操作符");
                    //这里之所以不直接标记需要计算参数，原因是避免很多参数时进行大量的参数计算
                } });
            //直接返回表本身（用于提供不计算通道）
            this.SetSymbol({ key: 'quote', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (args.length != 1)
                        throw "参数数量错误！";
                    return args[0];
                } });
            //返回表的第一个元素（如果不存在返回undefined)
            this.SetSymbol({ key: 'car', isneedcircum: true, callthis: null, isneedcal: true, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (args.length != 1)
                        throw "参数数量错误！";
                    var tb = args[0];
                    return tb.childs[0];
                } });
            //返回剩余内容 作为表返回
            this.SetSymbol({ key: 'cdr', isneedcircum: true, callthis: null, isneedcal: true, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (args.length != 1)
                        throw "参数数量错误！";
                    var tb = args[0];
                    var ret = new LispExecute.Table();
                    ret.childs = tb.childs.slice(1, tb.childs.length);
                    return ret;
                } });
            //将参数1插入到参数2（表）的头部
            this.SetSymbol({ key: 'cons', isneedcircum: true, callthis: null, isneedcal: true, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (args.length != 2)
                        throw "参数数量错误！";
                    var inset = args[0];
                    var tb = args[1];
                    if (tb.Type != "normal")
                        throw new Error("错误！参数2必须为表");
                    var ret = new LispExecute.Table();
                    ret.childs = [inset].concat(tb.childs);
                    return ret;
                } });
            //分支结构
            this.SetSymbol({ key: 'cond', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    var now = 0; //计数器主要用于测定else合法性
                    for (var _a = 0, args_3 = args; _a < args_3.length; _a++) {
                        var t = args_3[_a];
                        //这里处理每个测试对
                        var temp = t;
                        if (temp.Type != "normal" || temp.childs.length < 2) {
                            throw new Error("Cond参数错误！必须为normal表并且包含两个以上的子表！");
                        }
                        var testtb = temp.childs[0];
                        //遇到结束符
                        if (testtb.Type == "symbol" && testtb.name == "else") {
                            if (now != args.length - 1) {
                                throw new Error("错误！else必须放在cond语句的最后位置");
                            }
                            else {
                                //将testtb设为恒为真
                                testtb = new LispExecute.LispObject(true);
                            }
                        }
                        var test = testtb.Calculate(circum);
                        //将后续的所有表都用do包装
                        var func = linkfunc(temp.childs.slice(1, temp.childs.length));
                        if (istrue(test)) {
                            //执行并返回
                            //即cond遇到第一个条件为真的则直接返回
                            var ret = func.Calculate(circum);
                            return ret;
                        }
                        now++;
                    }
                    //不返回，如果没有匹配
                    return undefined;
                } });
            //内部数据结构比较相等
            //对数据对象为正常js对象比较
            //对于数据对象（非string和number）会直接比较引用
            //要比较数据对象相等 使用deq?谓词
            var iseq = function (t1, t2) {
                if (t1.Type != t2.Type)
                    return false;
                if (t1.Type == "object") {
                    return t1.Object == t2.Object;
                }
                if (t1.Type == "symbol") {
                    return t1.name == t2.name;
                }
                if (t1.Type == "normal") {
                    var cs = t1.childs;
                    var cs2 = t2.childs;
                    if (cs.length == cs2.length) {
                        for (var i = 0; i < cs.length; ++i) {
                            if (!iseq(cs[i], cs2[i]))
                                return false;
                        }
                        return true;
                    }
                    return false;
                }
            };
            this.SetSymbol({ key: 'equal?', isneedcircum: true, callthis: null, isneedcal: true, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (args.length != 2)
                        throw "参数数量错误！";
                    return new LispExecute.LispObject(iseq(args[0], args[1]));
                } });
            //构造一个匿名函数
            this.SetSymbol({ key: 'lambda', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    //判断定义类型 如果def部分为normal表则为过程定义
                    //否则则为变量定义
                    //注意define操作符不返回值 即返回undefined
                    if (args.length < 2)
                        throw new Error("参数数量不正确");
                    var head = args[0];
                    if (head.Type != "normal" && head.Type != "symbol") {
                        throw new Error("符号定义错误！头部类型不正确");
                    }
                    //这里来构造一个process
                    //先构造body
                    var bodylist = args.slice(1, args.length); //得到body序列
                    //合成一个body
                    var body = new LispExecute.Table();
                    body.childs.push(new LispExecute.LispSymbolRefence("do")); //使用do操作符连接多个table
                    body.childs = body.childs.concat(bodylist);
                    var def = new LispExecute.Table();
                    var thead = new LispExecute.Table();
                    //添加匿名头
                    thead.childs.push(new LispExecute.LispSymbolRefence(""));
                    if (head.Type == "normal") {
                        thead.childs = thead.childs.concat(head.childs);
                    }
                    def.childs[0] = thead;
                    def.childs[1] = body;
                    var proc = new LispExecute.LispDefProcess(def);
                    return proc;
                } });
            //判断是否为基础数据类型 即是否为object型表
            this.SetSymbol({ key: 'atom', isneedcircum: false, callthis: null, isneedcal: true, isneedtrans: false, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    if (args.length != 1)
                        throw "参数数量错误！";
                    var temp = args[0];
                    if (temp.Type == "object") {
                        return new LispExecute.LispObject(true);
                    }
                    else
                        return new LispExecute.LispObject(false);
                } });
            //下面为原生对象操作
            this.SetSymbol({ key: 'prop', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (args.length != 2)
                        throw "参数数量错误！";
                    var temp = args[0].Calculate(circum);
                    if (temp.Type == "object") {
                        //数据对象进行取属性计算
                        var obj = temp.Object;
                        var pname = args[1];
                        pname = pname.Calculate(circum);
                        var name = void 0;
                        if (pname.Type == "object") {
                            name = pname.Object;
                        }
                        else
                            throw new Error("错误！属性名必须为字符串或符号引用");
                        if (name in obj) {
                            return new LispExecute.LispObject(obj[name]);
                        }
                        //调试用
                        throw new Error("\u9519\u8BEF\uFF01\u6307\u5B9A\u5BF9\u8C61\u4E2D\u4E0D\u5B58\u5728\u5C5E\u6027\uFF1A" + name);
                    }
                } });
            //将一个function数据对象变成一个process
            this.SetSymbol({ key: 'proc', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (args.length != 1)
                        throw "参数数量错误！";
                    var temp = args[0];
                    if (temp.Type == "object" && typeof temp.Object == "function") {
                        return new LispExecute.LispRawProcess("", temp.Object, false);
                    }
                } });
            //取一个符号的名字
            this.SetSymbol({ key: 'symname', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (args.length != 1)
                        throw "参数数量错误！";
                    var temp = args[0];
                    if (temp.Type == "symbol") {
                        return new LispExecute.LispObject(temp.name);
                    }
                    throw new Error("只能对符号执行字符串化!");
                } });
            //逻辑运算符
            this.SetSymbol({ key: 'and', isneedcircum: true, callthis: null, isneedcal: true, isneedtrans: true, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (args.length != 2)
                        throw "参数数量错误！";
                    return new LispExecute.LispObject(args[0] && args[1]);
                } });
            this.SetSymbol({ key: 'or', isneedcircum: true, callthis: null, isneedcal: true, isneedtrans: true, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (args.length != 2)
                        throw "参数数量错误！";
                    return new LispExecute.LispObject(args[0] || args[1]);
                } });
            this.SetSymbol({ key: 'not', isneedcircum: true, callthis: null, isneedcal: true, isneedtrans: true, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (args.length != 1)
                        throw "参数数量错误！";
                    return new LispExecute.LispObject(!args[0]);
                } });
            //设置别名
            this.SetOtherName("define", "let");
            this.SetOtherName("define", "set!");
            this.SetOtherName("do", "begin");
        };
        return LispExecuter;
    }(LispExecute.Executer));
    LispExecute.LispExecuter = LispExecuter;
})(LispExecute || (LispExecute = {}));
//# sourceMappingURL=LispExecuter.js.map