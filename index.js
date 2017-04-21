function display(str)
{
    let view=document.getElementById("viewport");
    view.innerHTML+=str+"\n";
}
let obj=new LispExecute.Lisp();
window.onload=function()
{
    let area=document.getElementById("inputarea");
    
    area.onchange=function(e)
    {
        let str=area.value;
        area.value="";
        if(str.trim()!="")
        {
            let table=LispExecute.Parser(str);
            let res=obj.Run(table);
            display(res);
        }
        
    }
}