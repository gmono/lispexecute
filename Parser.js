var LispExecute;
(function (LispExecute) {
    /**
     * 此为解析工具包对外公开几个静态函数 用于将lisp代码转换为表
     */
    var Parser = (function () {
        function Parser() {
        }
        Parser.Parse = function (code) {
            return new LispExecute.Table();
        };
        return Parser;
    }());
    LispExecute.Parser = Parser;
})(LispExecute || (LispExecute = {}));
