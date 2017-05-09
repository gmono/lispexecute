namespace LispExecute
{
    export class LispExecuter extends Executer
    {
        public IsTrue(tb:Table)
        {
            //检查计算的结果是否为真
                //非false则为true   
                //空表为false
                if(tb.Type=="normal"&&tb.childs.length==0) return false;
                if(tb.Type=="object"&&(<LispObject>tb).Object==false) return false;
                return true;
        }
        //工具函数将几个表链接成一个do引导的执行列表
            public LinkFunc(tabs:Table[])
            {
                let ret:Table=new Table();
                ret.childs=(<Table[]>[new LispSymbolRefence('do')]).concat(tabs);
                return ret;
            }
            //内部数据结构比较相等
            //对数据对象为正常js对象比较
            //对于数据对象（非string和number）会直接比较引用
            //要比较数据对象相等 使用deq?谓词
            public TableEqual(t1:Table,t2:Table)
            {
                if(t1.Type!=t2.Type) return false;
                if(t1.Type=="object")
                {
                    return (t1 as LispObject).Object==(t2 as LispObject).Object;
                }
                if(t1.Type=="symbol")
                {
                    return (t1 as LispSymbolRefence).name==(t2 as LispSymbolRefence).name;
                }
                if(t1.Type=="normal")
                {
                    let cs:Table[]=t1.childs;
                    let cs2:Table[]=t2.childs;
                    if(cs.length==cs2.length)
                    {
                        for(let i=0;i<cs.length;++i)
                        {
                            if(!this.TableEqual(cs[i],cs2[i])) return false;
                        }
                        return true;
                    }
                    return false;
                }
            }
            
            @SymDecorator.RawFunction("+")
            public Add(...args)
            {
                if(typeof args[0]!="number"&&typeof args[0]!="string") throw new Error("错误！运算对象类型错误！");
                let sum=typeof args[0] =="number"? 0:"";
                for(let t of args)
                {
                    if(typeof t!="number"&&typeof t!="string") throw new Error("错误！运算对象类型错误！");
                    sum+=<any>t;
                }
                return sum;
            }
            @SymDecorator.RawFunction("-")
            public Sub(...args)
            {
                if(typeof args[0]!="number") throw new Error("错误！运算对象类型错误！");
                let sum=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(typeof args[0]!="number") throw new Error("错误！运算对象类型错误！");
                    sum-=t;
                }
                return sum;
            }

            @SymDecorator.RawFunction("*")
            public Mul(...args)
            {
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
            }
            @SymDecorator.RawFunction("/")
            public Div(...args)
            {
                if(typeof args[0]!="number") throw new Error("错误！运算对象类型错误！");
                let sum=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(typeof args[0]!="number") throw new Error("错误！运算对象类型错误！");
                    sum/=t;
                }
                return sum;
            }
            //比较操作部分
            @SymDecorator.RawFunction(">")
            public CmpA(...args)
            {
                let old=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(!(old>t)) return false;
                    old=t;
                }
                return true;
            }

            @SymDecorator.RawFunction("<")
            public CmpB(...args)
            {
                let old=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(!(old<t)) return false;
                    old=t;
                }
                return true;
            }

            @SymDecorator.RawFunction("=")
            public CmpE(...args)
            {
                let old=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(!(old==t)) return false;
                    old=t;
                }
                return true;
            }

            @SymDecorator.RawFunction(">=")
            public CmpAE(...args)
            {
                let old=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(!(old>=t)) return false;
                    old=t;
                }
                return true;
            }

            @SymDecorator.RawFunction("<=")
            public CmpBE(...args)
            {
                let old=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(!(old<=t)) return false;
                    old=t;
                }
                return true;
            }

            //将几个表连接起来
            @SymDecorator.TableSymbol("do")
            public Do(circum:Store,...args)
            {
                //此过程对接收的每个参数求值 后返回最后一个求值的结果
                //此过程用于将多个Table联合在一起作为一个Table求值
                let ret:Table;
                for(let a  of args)
                {
                    ret=(<Table>a).Calculate(circum);
                }
                return ret.Calculate(circum);
            }

            @SymDecorator.TableSymbol("define")
            public Define(circum:Store,...args)
            {
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
                    let body=this.LinkFunc(bodylist);
                    let def=new Table();
                    def.childs[0]=args[0];
                    def.childs[1]=body;
                    let proc=new LispDefProcess(def);
                    //加入环境
                    circum.Set(proc.Name,proc);
                    return undefined;
                }
                throw new Error("符号定义错误！头部类型不正确");
            }

            @SymDecorator.TableSymbol("if")
            public If(circum:Store,...args)
            {
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
            }

            @SymDecorator.TableSymbol("typeof")
            public STypeof(circum:Store,...args)
            {
                if(args.length!=1) throw "参数数量错误！";
                return (<Table>args[0]).Calculate(circum).Type;
                //这里之所以不直接标记需要计算参数，原因是避免很多参数时进行大量的参数计算
            }
            @SymDecorator.TableSymbol("objtype")
            public GetObjType(circum:Store,...args)
            {
                if(args.length!=1) throw "参数数量错误！";
                let temp=(<Table>args[0]).Calculate(circum);
                if(temp.Type=="object")
                {
                    return new LispObject(typeof (<LispObject>temp).Object);
                }
                throw new Error("错误！只能对数据对象使用objtype操作符");
                //这里之所以不直接标记需要计算参数，原因是避免很多参数时进行大量的参数计算
            }
            @SymDecorator.TableSymbol("quote")
            public Quote(circum:Store,...args)
            {
                if(args.length!=1) throw "参数数量错误！";
                return args[0];
            }
            @SymDecorator.InnerFunc("car")
            public CAR(circum:Store,...args)
            {
                if(args.length!=1) throw "参数数量错误！";
                let tb=<Table>args[0];
                return tb.childs[0];
            }
            @SymDecorator.InnerFunc("cdr")
            public CDR(circum:Store,...args)
            {
                if(args.length!=1) throw "参数数量错误！";
                let tb=<Table>args[0];
                let ret=new Table();
                ret.childs=tb.childs.slice(1,tb.childs.length);
                return ret;
            }
            @SymDecorator.InnerFunc("cons")
            public Cons(circum:Store,...args)
            {
                if(args.length!=2) throw "参数数量错误！";
                let inset=<Table>args[0];
                let tb=<Table>args[1];
                if(tb.Type!="normal") throw new Error("错误！参数2必须为表");
                let ret=new Table();
                ret.childs=[inset].concat(tb.childs);
                return ret;
            }
            @SymDecorator.TableSymbol("cond")
            public Cond(circum:Store,...args)
            {
                let now=0;//计数器主要用于测定else合法性
                for(let t of args)
                {
                    //这里处理每个测试对
                    let temp=<Table>t;
                    if(temp.Type!="normal"||temp.childs.length<2)
                    {
                        throw new Error("Cond参数错误！必须为normal表并且包含两个以上的子表！");
                    }
                    let testtb=temp.childs[0];
                    //遇到结束符
                    if(testtb.Type=="symbol"&&(<LispSymbolRefence>testtb).name=="else")
                    {
                        if(now!=args.length-1)
                        {
                            throw new Error("错误！else必须放在cond语句的最后位置");
                        }
                        else
                        {
                            //将testtb设为恒为真
                            testtb=new LispObject(true);
                        }
                    }
                    let test=testtb.Calculate(circum);
                    //将后续的所有表都用do包装
                    let func=this.LinkFunc(temp.childs.slice(1,temp.childs.length));
                    if(this.IsTrue(test))
                    {
                        //执行并返回
                        //即cond遇到第一个条件为真的则直接返回
                        let ret=func.Calculate(circum);
                        return ret;
                    }
                    now++;
                }
                //不返回，如果没有匹配
                return undefined;
            }
            @SymDecorator.TableSymbol("lambda")
            public Lambda(circum:Store,...args)
            {
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
            }
            @SymDecorator.InnerFunc("equal?")
            public isEqual(circum:Store,...args)
            {
                if(args.length!=2) throw "参数数量错误！";
                return new LispObject(this.TableEqual(args[0],args[1]));
            }

            @SymDecorator.InnerFunc("eq?")
            public isEq(circum:Store,...args)
            {
                if(args.length!=2) throw "参数数量错误！";
                let targs=<Table[]>args;
                if(targs[0].Type!=targs[1].Type) return new LispObject(false);
                if(targs[0].Type=="symbol") return new LispObject((targs[0] as LispSymbolRefence).name==(targs[1] as LispSymbolRefence).name);
                if(targs[0].Type=="object") return new LispObject((args[0] as LispObject).Object==(args[1] as LispObject).Object);
                //normal
                //如果直接就是个table  那肯定不是相等的
                return false;
            }


            @SymDecorator.InnerFunc("atom")
            public Atom(circum:Store,...args)
            {
                if(args.length!=1) throw "参数数量错误！";
                let temp=<Table>args[0];
                if(temp.Type=="object")
                {
                    return new LispObject(true);
                }
                else return new LispObject(false);
            }

            @SymDecorator.TableSymbol("prop")
            public GetProp(circum:Store,...args)
            {
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
                    //调试用
                    throw new Error(`错误！指定对象中不存在属性：${name}`);
                }
            }
            /**
             * 将一个function型 的object转换为一个RawProcess对象
             */
            @SymDecorator.TableSymbol("proc")
            public AsProc(circum:Store,...args)
            {
                if(args.length!=1) throw "参数数量错误！";
                let temp=<Table>args[0];
                if(temp.Type=="object"&&typeof (<LispObject>temp).Object=="function")
                {
                    return new LispRawProcess("",(<LispObject>temp).Object,false);
                }
            }
            /**
             * 得到一个符号的名字（字符串)
             */
            @SymDecorator.TableSymbol("symname")
            public GetSymName(circum:Store,...args)
            {
                if(args.length!=1) throw "参数数量错误！";
                let temp=<LispSymbolRefence>args[0];
                if(temp.Type=="symbol")
                {
                    return new LispObject(temp.name);
                }
                throw new Error("只能对符号执行字符串化!");
            }

            @SymDecorator.RawFunction("and")
            public AND(...args)
            {
                if(args.length!=2) throw "参数数量错误！";
                return new LispObject(args[0]&&args[1]);
            }
            @SymDecorator.RawFunction("or")
            public OR(...args)
            {
                if(args.length!=2) throw "参数数量错误！";
                return new LispObject(args[0]||args[1]);
            }
            
            @SymDecorator.RawFunction("not")
            public NOT(...args)
            {
                if(args.length!=1) throw "参数数量错误！";
                return new LispObject(!args[0]);
            }
            @SymDecorator.RawFunction("~")
            public BITNOT(...args)
            {
                if(args.length!=1) throw "参数数量错误！";
                let num=args[0];
                if(typeof num!="number") throw new Error("错误！只能对数值类型进行位运算");
                return ~num;
            }
            @SymDecorator.RawFunction("&")
            public BITAND(...args)
            {
                if(args.length!=2) throw "参数数量错误！";
                let num=args[0];
                let num2=args[1];
                if(typeof num!="number"||typeof num2!="number") throw new Error("错误！只能对数值类型进行位运算");
                return num&num2;
            }
            @SymDecorator.RawFunction("|")
            public BITOR(...args)
            {
                if(args.length!=2) throw "参数数量错误！";
                let num=args[0];
                let num2=args[1];
                if(typeof num!="number"||typeof num2!="number") throw new Error("错误！只能对数值类型进行位运算");
                return num|num2;
            }
            @SymDecorator.RawFunction("<<")
            public SHL(...args)
            {
                if(args.length!=2) throw "参数数量错误！";
                let num=args[0];
                let num2=args[1];
                if(typeof num!="number"||typeof num2!="number") throw new Error("错误！只能对数值类型进行位运算");
                return num<<num2;
            }
            @SymDecorator.RawFunction(">>")
            public SHR(...args)
            {
                if(args.length!=2) throw "参数数量错误！";
                let num=args[0];
                let num2=args[1];
                if(typeof num!="number"||typeof num2!="number") throw new Error("错误！只能对数值类型进行位运算");
                return num>>num2;
            }
            @SymDecorator.RawFunction("rol")
            public ROL(...args)
            {
                if(args.length!=2) throw "参数数量错误！";
                let num=args[0];
                let num2=args[1];
                if(typeof num!="number"||typeof num2!="number") throw new Error("错误！只能对数值类型进行位运算");
                //使用LimitNumber库处理
                if(num2==0) return num;
                let tbits=new LimitNumber.DWord(true,num).GetLimitBits(32-num2,31);
                let ret=num<<num2;
                let temp=new LimitNumber.DWord(false,ret);
                temp.SetLimitBits(0,num2-1,tbits);
                ret=temp.Value;
                return ret;
            }
            @SymDecorator.RawFunction("ror")
            public ROR(...args)
            {
                if(args.length!=2) throw "参数数量错误！";
                let num=args[0];
                let num2=args[1];
                if(typeof num!="number"||typeof num2!="number") throw new Error("错误！只能对数值类型进行位运算");
                //使用LimitNumber库处理
                if(num2==0) return num;
                let tbits=new LimitNumber.DWord(true,num).GetLimitBits(0,num2-1);
                let ret=num>>num2;
                let temp=new LimitNumber.DWord(false,ret);
                temp.SetLimitBits(num2,31,tbits);
                ret=temp.Value;
                return ret;
            }
            //批量定义局部变量 并在此中计算
            @SymDecorator.TableSymbol("let")
            public Let(circum:Store,...args)
            {
                //let有多个参数第一个是一个嵌套表 声明局部变量
                //后面的是程序序列 返回最后一次执行的结果
                let deftable:Table=args[0];
                let ds=args.slice(1,args.length);
                //执行表构造完成 处理定义表
                //构建新层
                let nstore=new Store(circum);
                //加入局部变量
                for(let pair of deftable.childs)
                {
                    if(pair.childs.length!=2||pair.childs[0].Type!="symbol")
                        throw new Error("错误！定义序列元素中第一项应为符号");
                    let sym:LispSymbolRefence=pair.childs[0] as LispSymbolRefence;
                    //这里也考虑不检测 不过感觉不太正常 如果一个定义表中有多个同样符号的定义的话
                    if(nstore.SelfHas(sym.name))
                    {
                        throw new Error("错误！局部变量重复定义");
                    }
                    let val=pair.childs[1].Calculate(nstore);
                    nstore.Set(sym.name,val);
                }
                //执行计算
                //这里本来可以通过构造一个table来通过核心引擎执行do操作的
                //但是这样更快
                //然而这样的话就没有RawCall操作中的某些转换 计算 等特性
                //使用时需要注意
                return this.Do.apply(this,[nstore].concat(ds));
            }
            /**
             * 元组赋值 可以是不存在的符号
             */
            @SymDecorator.TableSymbol("use")
            public UseValue(circum:Store,...args)
            {
                if(args.length!=2) throw new Error("错误！元组赋值只允许两个参数");
                let deft:Table=args[0];
                let valt:Table=args[1];
                if(deft.childs.length!=valt.childs.length)
                {
                    throw new Error("错误！元组赋值数量不对等");
                }
                //赋值
                for(let i=0;i<deft.childs.length;++i)
                {
                    let sym=deft.childs[i] as LispSymbolRefence;
                    if(sym.Type!="symbol") throw new Error("错误！元组赋值中第一个表必须为纯符号表");
                    let val=valt.childs[i].Calculate(circum);
                    circum.Set(sym.name,val);
                }
            }
            /**
             * 元组赋值 必须是存在的符号
             */
            @SymDecorator.TableSymbol("set")
            public SetValue(circum:Store,...args)
            {
                if(args.length!=2) throw new Error("错误！元组赋值只允许两个参数");
                let deft:Table=args[0];
                let valt:Table=args[1];
                if(deft.childs.length!=valt.childs.length)
                {
                    throw new Error("错误！元组赋值数量不对等");
                }
                for(let t of deft.childs)
                {
                    if(t.Type!="symbol"||circum.TrySearch((t as LispSymbolRefence).name)==undefined)
                    {
                        //如果不是符号或者符号并不存在 
                        throw new Error("错误！要赋值的符号不存在");
                    }
                }
                this.UseValue.apply(this,[circum].concat(args));
            }
            /**
             * 主动计算一个表（允许多个)
             */
            @SymDecorator.InnerFunc("cal")
            public Cal(circum:Store,...args)
            {
                if(args.length<1) throw new Error("错误！参数过少");
                let ret=undefined;
                for(let t of (args as Table[]))
                {
                    ret=t.Calculate(circum);
                }
                return ret;
            }
            /**
             * 此符号接受一个字符串
             * 转换为symbol refence后返回
             */
            @SymDecorator.InnerFunc("assym")
            public AsSymbol(circum:Store,...args)
            {
                if(args.length!=1) throw new Error("参数数量错误!");
                let str=args[0] as Table;
                if(str.Type!="object")
                    throw new Error("错误！只能对数据对象(可字符串化)执行assym操作");
                //原则上不限制类型 只要可以做字符串用就行
                //不过考虑可以限制类型
                return new LispSymbolRefence((str as LispObject).Object);
            }
        //此处约定
        //非普通js函数语义的 一律不使用提前计算参数和
        //但是可以使用转化标记
        protected AddPreSymbols()
        {
            super.AddPreSymbols();
            //取一个符号的名字
            //设置别名
            // this.SetOtherName("define","let"); 这是错误的。。
            this.SetOtherName("define","set!");
            this.SetOtherName("do","begin");
            this.SetOtherName("eqv?","eq?");
            
        }
    }
}
