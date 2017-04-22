# lispexecute
ts实现Lisp解释器
# 实现介绍
## DataType
DataType为核心数据体系，其定义为表结构，求值模型等 
其中Table为全局基类 
代表常规表 常规表为一个子表的集合 
object symbolrefence继承于Table 
number string 继承于object 
Process继承于Table 为过程的抽象基类 
Process分为定义的（复合）Process和原生（环境提供）的Process 
其中object求值得自身，symbolrefence求值得其引用的Table 
常规Table求值则为计算式求值 
Process不可求值，只能通过Call方法进行调用 
不管是Calculate求值还是Call调用 都要提供一个“环境查询函数”，来链接到上层作用域 
Call内将单独创建一个作用域，而Calculate将不创建直接沿用传入的查询函数 

## Lisp
叫Lisp但是实际上和Lisp语法没有任何关系，其提供一个顶层容器，对外公开注册符号和获取符号的接口，最重要的是对外公开了Run方法，可以对一个Table进行求值 

## Parser
此为将Lisp语法文本解析为Table树的解析器，理论上可以将各种语法的代码解析为Table树，使用Lisp模块运行 

# 说明
DateType核心提供了很方便的对外部函数进行封装的RawProcess类，并且其中所有的预定义符号都是后期通过此类进行注册的，这样保证了灵活性

# 进展
目前基本运算符已经完成，define和do完成，if语句完成 
目前已经可以在调用Run时提供外部顶层容器对象（原生JS对象）来作为顶层容器的上层 
也就是已经可以用原生JS方法了 
接下来要做的除了添加各种预定义符号外
目前还没有实现尾递归
