function displayres(str) {
    let view = document.getElementById("viewport");
    view.innerHTML += str + "\n";
}

function displaycom(str) {
    let view = document.getElementById("command");
    view.innerHTML += str + "\n";
}
let obj = new LispExecute.LispExecuter(window);
window.onload = function () {
    let area = document.getElementById("inputarea");

    area.onchange = function (e) {
        let str = area.value;
        area.value = "";
        if (str.trim() != "") {
            try {
                displaycom(str);
                let table = LispExecute.Parser.Parse(str);
                let res = obj.Run(table,true);
                displayres("> " + res);
            } catch (e) {
                displayres(e);
            }

        }

    }
}