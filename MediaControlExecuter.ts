namespace LispExecute{
  import LispExecuter = LispExecute.LispExecuter;
  export class MediaControlExecuter extends LispExecuter{
    /**
     * 定义一个资源 参数为 ： url（http file） type
     * @param cir 环境
     * @param args 参数
     */
    @SymDecorator.TableSymbol("media")
    public Video(cir: Store, ...args) {
      
    }
  }
}