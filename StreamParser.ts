import { Table } from "./DataType";
import { Parser } from "./Parser";

export class StreamParser extends Parser {
    public constructor() {
        super();
    }
    public static Parse(code: string): Table {
        let callarr = code.split("->");
        //初始表
        let oldtable: Table = null;
        let isx = false;
        //前一个表会被附加到后一个表的后面
        for (let t of callarr) {
            //构造层次计算表
            //得到当前表
            //处理解耦合语法 *()
            let now: Table = null;
            let nisx = false;
            if (t.trim()[0] == "*") {
                now = super.Parse(t.slice(1, t.length));
                if (now.Type != "normal") {
                    throw new Error("解析错误！只能对normal型表执行解耦合操作");
                }
                nisx = true;
            }
            else {
                now = super.Parse(t);
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
    }
}