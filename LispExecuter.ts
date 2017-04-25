namespace LispExecute
{
    export class LispExecuter extends Executer
    {
        //此处约定
        //非普通js函数语义的 一律不使用提前计算参数和
        //但是可以使用转化标记
        protected AddPreSymbols()
        {
            this.SetSymbol(<SymPair>{key:'+',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                if(typeof args[0]!="number"&&typeof args[0]!="string") throw new Error("错误！运算对象类型错误！");
                let sum=typeof args[0] =="number"? 0:"";
                for(let t of args)
                {
                    if(typeof t!="number"&&typeof t!="string") throw new Error("错误！运算对象类型错误！");
                    sum+=<any>t;
                }
                return sum;
            }});
            //减法只能用于数字
            this.SetSymbol(<SymPair>{key:'-',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                if(typeof args[0]!="number") throw new Error("错误！运算对象类型错误！");
                let sum=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(typeof args[0]!="number") throw new Error("错误！运算对象类型错误！");
                    sum-=t;
                }
                return sum;
            }});
            //乘法可以用于重复语义和数字
            this.SetSymbol(<SymPair>{key:'*',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                   let sum=args[0];
                   //注意 第一个参数为字符串则整体为重复语义 数字则为乘法语义
                   if(typeof sum=="string")
                   {
                       //重复语义
                       let nowblock=sum;
                       for(let a of args.slice(1,args.length))
                       {
                           if(typeof a !="number") throw new Error("错误！重复语义乘法除第一个参数外必须都为Number型!");
                           for(let i=0;i<a;++i)
                           {
                               sum+=nowblock;
                           }
                           nowblock=sum;
                       }
                   }
                   else if(typeof sum=="number")
                   {
                       for(let a of args.slice(1,args.length))
                       {
                           sum*=a;
                       }
                   }
                   else throw new Error("错误！运算对象类型错误！");;
                   return sum;
               }});
            this.SetSymbol(<SymPair>{key:'/',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                if(typeof args[0]!="number") throw new Error("错误！运算对象类型错误！");
                let sum=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(typeof args[0]!="number") throw new Error("错误！运算对象类型错误！");
                    sum/=t;
                }
                return sum;
            }});
            //比较操作部分
            this.SetSymbol(<SymPair>{key:'>',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                let old=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(!(old>t)) return false;
                    old=t;
                }
                return true;
            }});
            this.SetSymbol(<SymPair>{key:'<',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                let old=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(!(old<t)) return false;
                    old=t;
                }
                return true;
            }});
            this.SetSymbol(<SymPair>{key:'=',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                let old=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(!(old==t)) return false;
                    old=t;
                }
                return true;
            }});
            this.SetSymbol(<SymPair>{key:'>=',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                let old=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(!(old>=t)) return false;
                    old=t;
                }
                return true;
            }});
            this.SetSymbol(<SymPair>{key:'<=',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                let old=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(!(old<=t)) return false;
                    old=t;
                }
                return true;
            }});
            this.SetSymbol(<SymPair>{key:'do',isneedcircum:true,callthis:null,isneedcal:false,isneedtrans:false,val:(circum:Store,...args)=>{
                //此过程对接收的每个参数求值 后返回最后一个求值的结果
                //此过程用于将多个Table联合在一起作为一个Table求值
                let ret:Table;
                for(let a  of args)
                {
                    ret=(<Table>a).Calculate(circum);
                }
                return ret.Calculate(circum);
            }});
            this.SetSymbol(<SymPair>{key:'define',isneedcircum:true,callthis:null,isneedcal:false,isneedtrans:false,val:(circum:Store,...args)=>{
                //判断定义类型 如果def部分为normal表则为过程定义
                //否则则为变量定义
                //注意define操作符不返回值 即返回undefined
                if(args.length<2) throw new Error("参数数量不正确");
                let head=<Table>args[0];
                if(head.Type=="symbol")
                {
                    //变量定义
                    if(args.length>2) throw new Error("变量定义形式错误！参数数量不正确");
                    let val=args[1] as Table;
                    circum.Set((<LispSymbolRefence>head).name,val.Calculate(circum));
                    return undefined;
                }
                if(head.Type=="normal")
                {
                    //这里来构造一个process
                    //先构造body
                    let bodylist=args.slice(1,args.length);//得到body序列

                    //合成一个body
                    let body=new Table();
                    body.childs.push(new LispSymbolRefence("do"));//使用do操作符连接多个table
                    body.childs=body.childs.concat(bodylist);
                    let def=new Table();
                    def.childs[0]=args[0];
                    def.childs[1]=body;
                    let proc=new LispDefProcess(def);
                    //加入环境
                    circum.Set(proc.Name,proc);
                    return undefined;
                }
                throw new Error("符号定义错误！头部类型不正确");

            }});
            this.SetSymbol(<SymPair>{key:'if',isneedcircum:true,callthis:null,isneedcal:false,isneedtrans:false,val:(circum:Store,...args)=>{
                //这里来判断条件
                if(args.length<2) throw new Error("错误！IF操作参数过少！");
                let p=args[0] as Table;
                let res=p.Calculate(circum);
                let bres=true;
                if(res.Type=="object")
                {
                    let rres=res as LispObject;
                    if(rres.Object==false) bres=false;
                    //除了false其他都被作为true
                }
                //如果条件为真则执行A 否则如果有B则执行B 没有就返回空表
                let A=args[1] as Table;
                if(bres)
                {
                    return A.Calculate(circum);
                }
                if(args.length>=3)
                {
                    let B=args[2] as Table;
                    return B.Calculate(circum);
                }
                else return undefined;
            }});
            this.SetSymbol(<SymPair>{key:'typeof',isneedcircum:true,callthis:null,isneedcal:false,isneedtrans:false,val:(circum:Store,...args)=>{
                if(args.length!=1) throw "参数数量错误！";
                return (<Table>args[0]).Calculate(circum).Type;
                //这里之所以不直接标记需要计算参数，原因是避免很多参数时进行大量的参数计算
  
            }});
            this.SetSymbol(<SymPair>{key:'objtype',isneedcircum:true,callthis:null,isneedcal:false,isneedtrans:false,val:(circum:Store,...args)=>{
                if(args.length!=1) throw "参数数量错误！";
                let temp=(<Table>args[0]).Calculate(circum);
                if(temp.Type=="object")
                {
                    return new LispObject(typeof (<LispObject>temp).Object);
                }
                throw new Error("错误！只能对数据对象使用objtype操作符");
                //这里之所以不直接标记需要计算参数，原因是避免很多参数时进行大量的参数计算
  
            }});
            this.SetSymbol(<SymPair>{key:'quote',isneedcircum:true,callthis:null,isneedcal:false,isneedtrans:false,val:(circum:Store,...args)=>{
                if(args.length!=1) throw "参数数量错误！";
                return args[0];
            }});
            this.SetSymbol(<SymPair>{key:'lambda',isneedcircum:true,callthis:null,isneedcal:false,isneedtrans:false,val:(circum:Store,...args)=>{
                //判断定义类型 如果def部分为normal表则为过程定义
                //否则则为变量定义
                //注意define操作符不返回值 即返回undefined
                if(args.length<2) throw new Error("参数数量不正确");
                let head=<Table>args[0];
                if(head.Type!="normal"&&head.Type!="symbol")
                {
                    throw new Error("符号定义错误！头部类型不正确");
                }
                    //这里来构造一个process
                    //先构造body
                    let bodylist=args.slice(1,args.length);//得到body序列

                    //合成一个body
                    let body=new Table();
                    body.childs.push(new LispSymbolRefence("do"));//使用do操作符连接多个table
                    body.childs=body.childs.concat(bodylist);
                    let def=new Table();
                    let thead=new Table();
                    //添加匿名头
                    thead.childs.push(new LispSymbolRefence(""));
                    if(head.Type=="normal")
                    {
                        thead.childs=thead.childs.concat(head.childs);
                    }
                    def.childs[0]=thead;
                    def.childs[1]=body;
                    let proc=new LispDefProcess(def);
                    return proc;
            }});
            this.SetSymbol(<SymPair>{key:'prop',isneedcircum:true,callthis:null,isneedcal:false,isneedtrans:false,val:(circum:Store,...args)=>{
                if(args.length!=2) throw "参数数量错误！";
                let temp=(<Table>args[0]).Calculate(circum);
                if(temp.Type=="object")
                {
                    //数据对象进行取属性计算
                    let obj=(<LispObject>temp).Object;
                    let pname=args[1] as Table;
                    pname=pname.Calculate(circum);
                    let name;
                    if(pname.Type=="object")
                    {
                        name=(<LispObject>pname).Object;
                    }
                    else throw new Error("错误！属性名必须为字符串或符号引用");
                    if(name in obj)
                    {
                        return new LispObject(obj[name]);
                    }
                }
            }});
            this.SetSymbol(<SymPair>{key:'funcof',isneedcircum:true,callthis:null,isneedcal:false,isneedtrans:false,val:(circum:Store,...args)=>{
                if(args.length!=1) throw "参数数量错误！";
                let temp=<Table>args[0];
                if(temp.Type=="object"&&typeof (<LispObject>temp).Object=="function")
                {
                    return new LispRawProcess("",(<LispObject>temp).Object,false);
                }
            }});
            this.SetSymbol(<SymPair>{key:'strof',isneedcircum:true,callthis:null,isneedcal:false,isneedtrans:false,val:(circum:Store,...args)=>{
                if(args.length!=1) throw "参数数量错误！";
                let temp=<LispSymbolRefence>args[0];
                if(temp.Type=="symbol")
                {
                    return new LispObject(temp.name);
                }
                throw new Error("只能对符号执行字符串化!");
            }});
            
        }
    }
}
