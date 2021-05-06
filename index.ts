import { MediaControlExecuter } from "./MediaControlExecuter";
import { StreamParser } from "./StreamParser";

function displayres(str) {
    let view = document.getElementById("viewport");
    view.innerHTML += str + "\n";
}

function displaycom(str) {
    let view = document.getElementById("command");
    view.innerHTML += str + "\n";
}
let obj = new MediaControlExecuter(window);
window.onload = function () {
    let area = document.getElementById("inputarea") as HTMLTextAreaElement;

    area.onchange = function (e) {
        let str = area.value;
        area.value = "";
        if (str.trim() != "") {
            try {
                displaycom(str);
                let table = StreamParser.Parse(str);
                let res = obj.Run(table,true);
                displayres("> " + res);
            } catch (e) {
                displayres(e);
                throw e;
            }

        }

    }
}