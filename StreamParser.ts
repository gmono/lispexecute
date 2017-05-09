namespace LispExecute
{
    export class StreamParser extends Parser
    {
        public constructor()
        {
            super();
        }
        public static Parse(code:string):Table
        {
            let callarr=code.split("->");
            //初始表
            let oldtable=null;
            //前一个表会被附加到后一个表的后面
            for(let t of callarr)
            {
                //构造层次计算表
                //得到当前表
                let now=super.Parse(t);
                if(oldtable!=null)
                {
                    now.childs.push(oldtable);
                }
                oldtable=now;
            }
            return oldtable;
        }
    }
}