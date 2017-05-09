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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LispExecute;
(function (LispExecute) {
    var LispExecuter = (function (_super) {
        __extends(LispExecuter, _super);
        function LispExecuter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        LispExecuter.prototype.IsTrue = function (tb) {
            //检查计算的结果是否为真
            //非false则为true   
            //空表为false
            if (tb.Type == "normal" && tb.childs.length == 0)
                return false;
            if (tb.Type == "object" && tb.Object == false)
                return false;
            return true;
        };
        //工具函数将几个表链接成一个do引导的执行列表
        LispExecuter.prototype.LinkFunc = function (tabs) {
            var ret = new LispExecute.Table();
            ret.childs = [new LispExecute.LispSymbolRefence('do')].concat(tabs);
            return ret;
        };
        //内部数据结构比较相等
        //对数据对象为正常js对象比较
        //对于数据对象（非string和number）会直接比较引用
        //要比较数据对象相等 使用deq?谓词
        LispExecuter.prototype.TableEqual = function (t1, t2) {
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
                        if (!this.TableEqual(cs[i], cs2[i]))
                            return false;
                    }
                    return true;
                }
                return false;
            }
        };
        LispExecuter.prototype.Add = function () {
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
        };
        LispExecuter.prototype.Sub = function () {
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
        };
        LispExecuter.prototype.Mul = function () {
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
        };
        LispExecuter.prototype.Div = function () {
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
        };
        //比较操作部分
        LispExecuter.prototype.CmpA = function () {
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
        };
        LispExecuter.prototype.CmpB = function () {
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
        };
        LispExecuter.prototype.CmpE = function () {
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
        };
        LispExecuter.prototype.CmpAE = function () {
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
        };
        LispExecuter.prototype.CmpBE = function () {
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
        };
        //将几个表连接起来
        LispExecuter.prototype.Do = function (circum) {
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
        };
        LispExecuter.prototype.Define = function (circum) {
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
                var body = this.LinkFunc(bodylist);
                var def = new LispExecute.Table();
                def.childs[0] = args[0];
                def.childs[1] = body;
                var proc = new LispExecute.LispDefProcess(def);
                //加入环境
                circum.Set(proc.Name, proc);
                return undefined;
            }
            throw new Error("符号定义错误！头部类型不正确");
        };
        LispExecuter.prototype.If = function (circum) {
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
        };
        LispExecuter.prototype.STypeof = function (circum) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (args.length != 1)
                throw "参数数量错误！";
            return args[0].Calculate(circum).Type;
            //这里之所以不直接标记需要计算参数，原因是避免很多参数时进行大量的参数计算
        };
        LispExecuter.prototype.GetObjType = function (circum) {
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
        };
        LispExecuter.prototype.Quote = function (circum) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (args.length != 1)
                throw "参数数量错误！";
            return args[0];
        };
        LispExecuter.prototype.CAR = function (circum) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (args.length != 1)
                throw "参数数量错误！";
            var tb = args[0];
            return tb.childs[0];
        };
        LispExecuter.prototype.CDR = function (circum) {
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
        };
        LispExecuter.prototype.Cons = function (circum) {
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
        };
        LispExecuter.prototype.Cond = function (circum) {
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
                var func = this.LinkFunc(temp.childs.slice(1, temp.childs.length));
                if (this.IsTrue(test)) {
                    //执行并返回
                    //即cond遇到第一个条件为真的则直接返回
                    var ret = func.Calculate(circum);
                    return ret;
                }
                now++;
            }
            //不返回，如果没有匹配
            return undefined;
        };
        LispExecuter.prototype.Lambda = function (circum) {
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
        };
        LispExecuter.prototype.isEqual = function (circum) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (args.length != 2)
                throw "参数数量错误！";
            return new LispExecute.LispObject(this.TableEqual(args[0], args[1]));
        };
        LispExecuter.prototype.isEq = function (circum) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (args.length != 2)
                throw "参数数量错误！";
            var targs = args;
            if (targs[0].Type != targs[1].Type)
                return new LispExecute.LispObject(false);
            if (targs[0].Type == "symbol")
                return new LispExecute.LispObject(targs[0].name == targs[1].name);
            if (targs[0].Type == "object")
                return new LispExecute.LispObject(args[0].Object == args[1].Object);
            //normal
            //如果直接就是个table  那肯定不是相等的
            return false;
        };
        LispExecuter.prototype.Atom = function (circum) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (args.length != 1)
                throw "参数数量错误！";
            var temp = args[0];
            if (temp.Type == "object") {
                return new LispExecute.LispObject(true);
            }
            else
                return new LispExecute.LispObject(false);
        };
        LispExecuter.prototype.GetProp = function (circum) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (args.length != 2)
                throw "参数数量错误！";
            var temp = args[0].Calculate(circum);
            if (temp.Type == "object") {
                //数据对象进行取属性计算
                var obj_1 = temp.Object;
                var pname = args[1];
                pname = pname.Calculate(circum);
                var name_1;
                if (pname.Type == "object") {
                    name_1 = pname.Object;
                }
                else
                    throw new Error("错误！属性名必须为字符串或符号引用");
                if (name_1 in obj_1) {
                    return new LispExecute.LispObject(obj_1[name_1]);
                }
                //调试用
                throw new Error("\u9519\u8BEF\uFF01\u6307\u5B9A\u5BF9\u8C61\u4E2D\u4E0D\u5B58\u5728\u5C5E\u6027\uFF1A" + name_1);
            }
        };
        LispExecuter.prototype.AsProc = function (circum) {
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
        };
        LispExecuter.prototype.GetSymName = function (circum) {
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
        };
        LispExecuter.prototype.AND = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length != 2)
                throw "参数数量错误！";
            return new LispExecute.LispObject(args[0] && args[1]);
        };
        LispExecuter.prototype.OR = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length != 2)
                throw "参数数量错误！";
            return new LispExecute.LispObject(args[0] || args[1]);
        };
        LispExecuter.prototype.NOT = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length != 1)
                throw "参数数量错误！";
            return new LispExecute.LispObject(!args[0]);
        };
        LispExecuter.prototype.BITNOT = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length != 1)
                throw "参数数量错误！";
            var num = args[0];
            if (typeof num != "number")
                throw new Error("错误！只能对数值类型进行位运算");
            return ~num;
        };
        LispExecuter.prototype.BITAND = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length != 2)
                throw "参数数量错误！";
            var num = args[0];
            var num2 = args[1];
            if (typeof num != "number" || typeof num2 != "number")
                throw new Error("错误！只能对数值类型进行位运算");
            return num & num2;
        };
        LispExecuter.prototype.BITOR = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length != 2)
                throw "参数数量错误！";
            var num = args[0];
            var num2 = args[1];
            if (typeof num != "number" || typeof num2 != "number")
                throw new Error("错误！只能对数值类型进行位运算");
            return num | num2;
        };
        LispExecuter.prototype.SHL = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length != 2)
                throw "参数数量错误！";
            var num = args[0];
            var num2 = args[1];
            if (typeof num != "number" || typeof num2 != "number")
                throw new Error("错误！只能对数值类型进行位运算");
            return num << num2;
        };
        LispExecuter.prototype.SHR = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length != 2)
                throw "参数数量错误！";
            var num = args[0];
            var num2 = args[1];
            if (typeof num != "number" || typeof num2 != "number")
                throw new Error("错误！只能对数值类型进行位运算");
            return num >> num2;
        };
        LispExecuter.prototype.ROL = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length != 2)
                throw "参数数量错误！";
            var num = args[0];
            var num2 = args[1];
            if (typeof num != "number" || typeof num2 != "number")
                throw new Error("错误！只能对数值类型进行位运算");
            //使用LimitNumber库处理
            if (num2 == 0)
                return num;
            var tbits = new LispExecute.LimitNumber.DWord(true, num).GetLimitBits(32 - num2, 31);
            var ret = num << num2;
            var temp = new LispExecute.LimitNumber.DWord(false, ret);
            temp.SetLimitBits(0, num2 - 1, tbits);
            ret = temp.Value;
            return ret;
        };
        LispExecuter.prototype.ROR = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length != 2)
                throw "参数数量错误！";
            var num = args[0];
            var num2 = args[1];
            if (typeof num != "number" || typeof num2 != "number")
                throw new Error("错误！只能对数值类型进行位运算");
            //使用LimitNumber库处理
            if (num2 == 0)
                return num;
            var tbits = new LispExecute.LimitNumber.DWord(true, num).GetLimitBits(0, num2 - 1);
            var ret = num >> num2;
            var temp = new LispExecute.LimitNumber.DWord(false, ret);
            temp.SetLimitBits(num2, 31, tbits);
            ret = temp.Value;
            return ret;
        };
        //批量定义局部变量 并在此中计算
        LispExecuter.prototype.Let = function (circum) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            //let有多个参数第一个是一个嵌套表 声明局部变量
            //后面的是程序序列 返回最后一次执行的结果
            var deftable = args[0];
            var ds = args.slice(1, args.length);
            //执行表构造完成 处理定义表
            //构建新层
            var nstore = new LispExecute.Store(circum);
            //加入局部变量
            for (var _a = 0, _b = deftable.childs; _a < _b.length; _a++) {
                var pair = _b[_a];
                if (pair.childs.length != 2 || pair.childs[0].Type != "symbol")
                    throw new Error("错误！定义序列元素中第一项应为符号");
                var sym = pair.childs[0];
                //这里也考虑不检测 不过感觉不太正常 如果一个定义表中有多个同样符号的定义的话
                if (nstore.SelfHas(sym.name)) {
                    throw new Error("错误！局部变量重复定义");
                }
                var val = pair.childs[1].Calculate(nstore);
                nstore.Set(sym.name, val);
            }
            //执行计算
            //这里本来可以通过构造一个table来通过核心引擎执行do操作的
            //但是这样更快
            //然而这样的话就没有RawCall操作中的某些转换 计算 等特性
            //使用时需要注意
            return this.Do.apply(this, [nstore].concat(ds));
        };
        /**
         * 元组赋值 可以是不存在的符号
         */
        LispExecuter.prototype.UseValue = function (circum) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (args.length != 2)
                throw new Error("错误！元组赋值只允许两个参数");
            var deft = args[0];
            var valt = args[1];
            if (deft.childs.length != valt.childs.length) {
                throw new Error("错误！元组赋值数量不对等");
            }
            //赋值
            for (var i = 0; i < deft.childs.length; ++i) {
                var sym = deft.childs[i];
                if (sym.Type != "symbol")
                    throw new Error("错误！元组赋值中第一个表必须为纯符号表");
                var val = valt.childs[i].Calculate(circum);
                circum.Set(sym.name, val);
            }
        };
        /**
         * 元组赋值 必须是存在的符号
         */
        LispExecuter.prototype.SetValue = function (circum) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (args.length != 2)
                throw new Error("错误！元组赋值只允许两个参数");
            var deft = args[0];
            var valt = args[1];
            if (deft.childs.length != valt.childs.length) {
                throw new Error("错误！元组赋值数量不对等");
            }
            for (var _a = 0, _b = deft.childs; _a < _b.length; _a++) {
                var t = _b[_a];
                if (t.Type != "symbol" || circum.TrySearch(t.name) == undefined) {
                    //如果不是符号或者符号并不存在 
                    throw new Error("错误！要赋值的符号不存在");
                }
            }
            this.UseValue.apply(this, [circum].concat(args));
        };
        //此处约定
        //非普通js函数语义的 一律不使用提前计算参数和
        //但是可以使用转化标记
        LispExecuter.prototype.AddPreSymbols = function () {
            _super.prototype.AddPreSymbols.call(this);
            //取一个符号的名字
            //设置别名
            // this.SetOtherName("define","let"); 这是错误的。。
            this.SetOtherName("define", "set!");
            this.SetOtherName("do", "begin");
            this.SetOtherName("eqv?", "eq?");
        };
        return LispExecuter;
    }(LispExecute.Executer));
    __decorate([
        LispExecute.SymDecorator.RawFunction("+")
    ], LispExecuter.prototype, "Add", null);
    __decorate([
        LispExecute.SymDecorator.RawFunction("-")
    ], LispExecuter.prototype, "Sub", null);
    __decorate([
        LispExecute.SymDecorator.RawFunction("*")
    ], LispExecuter.prototype, "Mul", null);
    __decorate([
        LispExecute.SymDecorator.RawFunction("/")
    ], LispExecuter.prototype, "Div", null);
    __decorate([
        LispExecute.SymDecorator.RawFunction(">")
    ], LispExecuter.prototype, "CmpA", null);
    __decorate([
        LispExecute.SymDecorator.RawFunction("<")
    ], LispExecuter.prototype, "CmpB", null);
    __decorate([
        LispExecute.SymDecorator.RawFunction("=")
    ], LispExecuter.prototype, "CmpE", null);
    __decorate([
        LispExecute.SymDecorator.RawFunction(">=")
    ], LispExecuter.prototype, "CmpAE", null);
    __decorate([
        LispExecute.SymDecorator.RawFunction("<=")
    ], LispExecuter.prototype, "CmpBE", null);
    __decorate([
        LispExecute.SymDecorator.TableSymbol("do")
    ], LispExecuter.prototype, "Do", null);
    __decorate([
        LispExecute.SymDecorator.TableSymbol("define")
    ], LispExecuter.prototype, "Define", null);
    __decorate([
        LispExecute.SymDecorator.TableSymbol("if")
    ], LispExecuter.prototype, "If", null);
    __decorate([
        LispExecute.SymDecorator.TableSymbol("typeof")
    ], LispExecuter.prototype, "STypeof", null);
    __decorate([
        LispExecute.SymDecorator.TableSymbol("objtype")
    ], LispExecuter.prototype, "GetObjType", null);
    __decorate([
        LispExecute.SymDecorator.TableSymbol("quote")
    ], LispExecuter.prototype, "Quote", null);
    __decorate([
        LispExecute.SymDecorator.InnerFunc("car")
    ], LispExecuter.prototype, "CAR", null);
    __decorate([
        LispExecute.SymDecorator.InnerFunc("cdr")
    ], LispExecuter.prototype, "CDR", null);
    __decorate([
        LispExecute.SymDecorator.InnerFunc("cons")
    ], LispExecuter.prototype, "Cons", null);
    __decorate([
        LispExecute.SymDecorator.TableSymbol("cond")
    ], LispExecuter.prototype, "Cond", null);
    __decorate([
        LispExecute.SymDecorator.TableSymbol("lambda")
    ], LispExecuter.prototype, "Lambda", null);
    __decorate([
        LispExecute.SymDecorator.InnerFunc("equal?")
    ], LispExecuter.prototype, "isEqual", null);
    __decorate([
        LispExecute.SymDecorator.InnerFunc("eq?")
    ], LispExecuter.prototype, "isEq", null);
    __decorate([
        LispExecute.SymDecorator.InnerFunc("atom")
    ], LispExecuter.prototype, "Atom", null);
    __decorate([
        LispExecute.SymDecorator.TableSymbol("prop")
    ], LispExecuter.prototype, "GetProp", null);
    __decorate([
        LispExecute.SymDecorator.TableSymbol("proc")
    ], LispExecuter.prototype, "AsProc", null);
    __decorate([
        LispExecute.SymDecorator.TableSymbol("symname")
    ], LispExecuter.prototype, "GetSymName", null);
    __decorate([
        LispExecute.SymDecorator.RawFunction("and")
    ], LispExecuter.prototype, "AND", null);
    __decorate([
        LispExecute.SymDecorator.RawFunction("or")
    ], LispExecuter.prototype, "OR", null);
    __decorate([
        LispExecute.SymDecorator.RawFunction("not")
    ], LispExecuter.prototype, "NOT", null);
    __decorate([
        LispExecute.SymDecorator.RawFunction("~")
    ], LispExecuter.prototype, "BITNOT", null);
    __decorate([
        LispExecute.SymDecorator.RawFunction("&")
    ], LispExecuter.prototype, "BITAND", null);
    __decorate([
        LispExecute.SymDecorator.RawFunction("|")
    ], LispExecuter.prototype, "BITOR", null);
    __decorate([
        LispExecute.SymDecorator.RawFunction("<<")
    ], LispExecuter.prototype, "SHL", null);
    __decorate([
        LispExecute.SymDecorator.RawFunction(">>")
    ], LispExecuter.prototype, "SHR", null);
    __decorate([
        LispExecute.SymDecorator.RawFunction("rol")
    ], LispExecuter.prototype, "ROL", null);
    __decorate([
        LispExecute.SymDecorator.RawFunction("ror")
    ], LispExecuter.prototype, "ROR", null);
    __decorate([
        LispExecute.SymDecorator.TableSymbol("let")
    ], LispExecuter.prototype, "Let", null);
    __decorate([
        LispExecute.SymDecorator.TableSymbol("use")
    ], LispExecuter.prototype, "UseValue", null);
    __decorate([
        LispExecute.SymDecorator.TableSymbol("set")
    ], LispExecuter.prototype, "SetValue", null);
    LispExecute.LispExecuter = LispExecuter;
})(LispExecute || (LispExecute = {}));
//# sourceMappingURL=LispExecuter.js.map