function displayres(str) {
    var view = document.getElementById("viewport");
    view.innerHTML += str + "\n";
}
function displaycom(str) {
    var view = document.getElementById("command");
    view.innerHTML += str + "\n";
}
var obj = new LispExecute.LispExecuter(window);
window.onload = function () {
    var area = document.getElementById("inputarea");
    area.onchange = function (e) {
        var str = area.value;
        area.value = "";
        if (str.trim() != "") {
            try {
                displaycom(str);
                var table = LispExecute.StreamParser.Parse(str);
                var res = obj.Run(table, true);
                displayres("> " + res);
            }
            catch (e) {
                displayres(e);
                throw e;
            }
        }
    };
};
//# sourceMappingURL=index.js.map