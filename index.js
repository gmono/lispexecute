function display(str)
{
    let view=document.getElementById("viewport");
    view.innerHTML+=str+"\n";
}

window.onload=function()
{
    let area=document.getElementById("inputarea");
    
    area.onchange=function(e)
    {
        let str=area.value;
        area.value="";
        if(str.trim()!="")
        {
            display(str);
        }
        
    }
}