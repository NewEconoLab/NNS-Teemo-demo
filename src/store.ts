import {observable, action, computed} from 'mobx';
import { notification } from 'antd';
import NeoHelper from './Tools/neoHelper';

class Store {
    @observable scriptHash = {
        nns_domaincenter : "348387116c4a75e420663277d9c02049907128c7",
        nns_resolver : "6e2aea28af9c5febea0774759b1b76398e3167f1",
        nns_auction:"5fd8c2aed0eec0fa103f6fba16748b453baf5b2e",
        nns_credit : "77bf387c9b5f2e2c33ef8507478b103285c55b11",
        NEP_5_CGAS:"74f2dc36a68fdc4682034178eb2220729231db76",
        NEP_5_NNC:"fc732edee1efdf968c23c20a9628eaa5a6ccb934"
    }

    @observable network = 'network'
    @observable address:string = 'A**********************'
    @observable nns:string='qmz.test'
    @action public updateAddress = (addr:string) =>{
        this.address = addr
    }
    @action public updateNetwork = (net:string) =>{
        this.network = net
    }
    @action public updateNNS = (nns:string) =>{
        this.nns = nns
    }

    webSocketURL: string;
    constructor(webSocketURL:string){
        this.webSocketURL = webSocketURL
        setInterval(this.updateLastWSmsgSec,1000)
        this.socketInit()
    }

    updateLastWSmsgSec = () =>{     
        this.lastWSmsgSec=(new Date().getTime() - this.lastWSmsgTime)/1000

        //webstock 如果2分钟取不到最新块，会发送心跳数据包
        if(this.lastWSmsgSec>75){
            
            this.lastWSmsgTime=new Date().getTime(),
            this.lastWSmsgSec=0

            this.socketInit()
        }

        this.socketReadyState = this.socket.readyState
    }

    socket: any;
    time = new Date().getTime()
    @observable socketReadyState = -1
    @observable socketMsgs:Array<any> = []
    @observable blockDatas=[{
        blockHeight:-1,
        blockTime:0,
        blockHash:'',
        timeDiff:0
      }]
    @observable lastBlockTime=0
    @observable lastWSmsgTime=new Date().getTime()
    @observable lastWSmsgSec=0

    // @computed get lastBlockTime(){
    //     if(this.blockData.length >1){
    //         return this.blockData[0].time
    //     }
    //     else return 0
    // }
    @observable txids:string[] = []
    @action public addTxidSended =(txid:string) =>{
        this.txids.unshift('0x' + txid)
    }

    pushEvent =(eventName:string,eventData:any) =>{
        var event = new CustomEvent(eventName, { 
            detail: eventData
        });
        window.dispatchEvent(event);
    }

    getDelay = (time:number) =>{
        return parseInt((new Date().getTime()/1000 - time).toFixed(0)) + 's'
    }

    @action socketInit =() =>{
        this.blockDatas=[{
            blockHeight:-1,
            blockTime:0,
            blockHash:'',
            timeDiff:0
          }]

        this.socket = new WebSocket(this.webSocketURL);
    
        this.socket.onclose = (event:any) => {
            console.log(event);
            notification.warning({message:'websocket',description:'close'})
        };
        this.socket.onerror = (event:any) => {
            console.log(event);
            notification.error({message:'websocket',description:'error'})
        };
        this.socket.onopen = (event:any) =>{
            console.log(event);
            this.socket.send('Hello Server!');
            notification.success({message:'websocket',description:'open'})
        }
        this.socket.onmessage = (event:any) =>{
            console.log(event);
            console.log(event.data);

            this.socketMsgs.unshift(event.data);

            this.lastWSmsgTime = new Date().getTime()
    
            //let timeDiff = new Date().getTime() - this.time;
            this.time = new Date().getTime()
            //console.log(timeDiff.toString() + 'ms')
            var data = JSON.parse(event.data).data
            if(data.blockHeight != null){
                var txidIndex = -1
                if(this.txids.length>0){                  
                    txidIndex = data.tx.findIndex((element:any)=>{
                        return element.txid === this.txids[0]
                    })
                    //console.log({txid:this.txids[0]},data.tx,txidIndex)
                }
                notification.info({message:data.blockHeight,description:'delay: ' + this.getDelay(data.blockTime) + '/' + this.getDelay(data.blockInsertTime) + '/' + this.getDelay(data.svrSystemTime) + '||txidIndex:' + txidIndex})

                var blockHeightDataArray = this.blockDatas

                if(blockHeightDataArray[0].blockHeight == -1 ) blockHeightDataArray.shift()
                if(blockHeightDataArray.length>=50) blockHeightDataArray.pop()

                let timeDiff = 0
                if(blockHeightDataArray.length > 0) timeDiff = (data.blockTime - blockHeightDataArray[0].blockTime)
                let blockData = data // {height:data.blockHeight,time:data.blockTime,hash:data.blockHash,timeDiff:timeDiff}
                blockData['timeDiff'] = timeDiff
                blockData['txidIndex'] = txidIndex
                blockHeightDataArray.unshift(blockData)
                this.pushEvent('newBlockEvent',blockData)            
        
                this.blockDatas = blockHeightDataArray
                this.lastBlockTime = data.blockTime
            }
        }
    }
}

export default Store