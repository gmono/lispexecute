namespace LispExecute
{
    /**
     * 此为解析工具包对外公开几个静态函数 用于将lisp代码转换为表
     */
    export class Parser
    {
        public static Parse(code:string):Table
        {
            return new Table();
        }
    }
}