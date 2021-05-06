var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
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
    var LispExecuter = LispExecute.LispExecuter;
    var MediaControlExecuter = /** @class */ (function (_super) {
        __extends(MediaControlExecuter, _super);
        function MediaControlExecuter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * 定义一个资源 参数为 ： url（http file） type
         * @param cir 环境
         * @param args 参数
         */
        MediaControlExecuter.prototype.Video = function (cir) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var _a = args, type = _a[0], url = _a[1];
            if (type.Type == "symbol") {
                var t = type;
                var u = url;
                if (t.name == "video") {
                    //测试
                    var s = u.Object;
                    alert("type:video " + "url:" + s);
                }
            }
            else {
            }
        };
        __decorate([
            LispExecute.SymDecorator.TableSymbol("media")
        ], MediaControlExecuter.prototype, "Video", null);
        return MediaControlExecuter;
    }(LispExecuter));
    LispExecute.MediaControlExecuter = MediaControlExecuter;
})(LispExecute || (LispExecute = {}));
//# sourceMappingURL=MediaControlExecuter.js.map