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
    var StreamParser = (function (_super) {
        __extends(StreamParser, _super);
        function StreamParser() {
            return _super.call(this) || this;
        }
        StreamParser.Parse = function (code) {
            var callarr = code.split("->");
            //初始表
            var oldtable = null;
            var isx = false;
            //前一个表会被附加到后一个表的后面
            for (var _i = 0, callarr_1 = callarr; _i < callarr_1.length; _i++) {
                var t = callarr_1[_i];
                //构造层次计算表
                //得到当前表
                //处理解耦合语法 *()
                var now = null;
                var nisx = false;
                if (t.trim()[0] == "*") {
                    now = _super.Parse.call(this, t.slice(1, t.length));
                    if (now.Type != "normal") {
                        throw new Error("解析错误！只能对normal型表执行解耦合操作");
                    }
                    nisx = true;
                }
                else {
                    now = _super.Parse.call(this, t);
                    nisx = false;
                }
                if (oldtable != null) {
                    if (!isx)
                        now.childs.push(oldtable);
                    else {
                        now.childs = now.childs.concat(oldtable.childs);
                    }
                }
                oldtable = now;
                isx = nisx;
            }
            return oldtable;
        };
        return StreamParser;
    }(LispExecute.Parser));
    LispExecute.StreamParser = StreamParser;
})(LispExecute || (LispExecute = {}));
//# sourceMappingURL=StreamParser.js.map