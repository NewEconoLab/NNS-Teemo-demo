import { async } from "q";

class NeoHelper {
    public static getAddressFromScriptHash = () =>{
        //根据合约notify输出的scripthash，转换为NEO地址
    }

    store:any
    constructor(store:any){
        this.store=store
    }

    public getBlock = async (blockIndex:number) =>{
      let result = await fetch(this.store.rpcUrl + '?jsonrpc=2.0&method=getblock&params=[' + blockIndex +',1]&id=1', {
        // method: 'post',
        // headers: {
        //   'user-agent': 'Mozilla/4.0 MDN Example',
        //   'content-type': 'application/json'
        // },
        // body: JSON.stringify({
        //   "jsonrpc": "2.0",
        //   "method": "getblock",
        //   "params": [blockIndex, 1],
        //   "id": 1
        // })
      });
      let data = await result.json();
      return data;
    }

    public static hex2a = (hexx:string) => {
        var hex = hexx.toString();//force conversion
        var str = '';
        for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
    }

    public static hex2Int = (hexx:string) =>{
      if(hexx=='') return 0
      return parseInt(NeoHelper.byte2Hex(NeoHelper.hex2Byte(hexx).reverse()), 16)
    }

    public static hex2TimeStr = (hexx:string) =>{
      return NeoHelper.timetrans(parseInt(NeoHelper.byte2Hex(NeoHelper.hex2Byte(hexx).reverse()), 16))
    }

    public static hexReverse = (hexx:string)=>{
      return NeoHelper.byte2Hex(NeoHelper.hex2Byte(hexx).reverse())
    }

    public static byte2Hex = (uint8arr:Uint8Array) => {
        if (!uint8arr) {
          return '';
        }
        
        var hexStr = '';
        for (var i = 0; i < uint8arr.length; i++) {
          var hex = (uint8arr[i] & 0xff).toString(16);
          hex = (hex.length === 1) ? '0' + hex : hex;
          hexStr += hex;
        }
        
        return hexStr.toLowerCase();
    }

    public static hex2Byte = (str:string) => {
        if (!str) {
          return new Uint8Array();
        }
        
        var a = [];
        for (var i = 0, len = str.length; i < len; i+=2) {
          a.push(parseInt(str.substr(i,2),16));
        }
        
        return new Uint8Array(a);
    }

    public static timetrans = (timestamp:number)=>{
        var date = new Date(timestamp*1000);//如果date为13位不需要乘1000
        var Y = date.getFullYear() + '-';
        var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
        var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
        var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
        var m = (date.getMinutes() <10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
        var s = (date.getSeconds() <10 ? '0' + date.getSeconds() : date.getSeconds());
        return Y+M+D+h+m+s;
    }

    public static sec2HMS = (sec:number) =>{
      let h=0
      let m=0
      let s=0
      if((sec % 3600) > 0){
        h = parseInt((sec/3600).toString())
        sec = sec - h*3600
      } 
      if((sec % 60) > 0){
        m = parseInt((sec/60).toString())
        sec = sec - m*60
      }
      s = sec

      let mStr='00'
      let sStr='00'
      if(m <10) mStr = '0' + m 
        else mStr=m.toString()
      if(s <10) sStr = '0' + s
        else sStr = s.toString()

      return h + ':' + mStr + ':' + sStr
    }
}

export default NeoHelper;