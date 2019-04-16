import React, { Component } from 'react';
import {autorun, observe} from 'mobx'
import {Button,Input,Spin,Statistic, Row, Col, Icon,Timeline,Drawer,Switch,InputNumber,Divider} from 'antd';
import { async } from 'q';
import { any, number } from 'prop-types';
import NeoHelper from '../Tools/neoHelper'
import NNSHelper from '../Tools/nnsHelper'
import ReactDOM from 'react-dom';
import {inject,observer} from 'mobx-react'

interface AuctionState
{
    id:string; //拍卖id,就是拍卖生成的auctionid
    auctionStarter:string;//域名开拍的人
    parenthash:string ;//拍卖内容
    domain:string ;//拍卖内容
    domainTTL:string ;//域名的TTL,用这个信息来判断域名是否发生了变化
    startBlockSelling:number ;//开始销售块
    endBlock:number ;//结束块
    maxPrice:number ;//最高出价
    maxBuyer:string ;//最大出价者
    lastBlock:number ;//最后出价块
}

interface NNScredit
{
    namehash:string
    fullDomainName:string 
    TTL:string
}

interface InvokeScriptRespStack{
    type: string,
    value: string
}
interface InvokeScriptResp{
    script: string,
    state: string,
    gas_consumed: string,
    stack: InvokeScriptRespStack[]
}

@inject("store")
@observer
class DivAuction extends React.Component<any,any> {
    //NNSh = new NNSHelper(this.props.store);
    //NEOh = new NeoHelper(this.props.store);
    nnsInput:any
    constructor(props:any){
        super(props)
        this.nnsInput = React.createRef();
    }  

    state = {
        resDataRead : '{}',
        reqDataWrite : '{}',
        resDataWrite : '{}',
        inputAmount: 0,
        loadingR : true,
        loadingW : false,
        CGASBalance:0,
        auctionBalance:0,
        bidBalance:0,
        auctionDay:0,
        auctionStateInfo:{
            "id": "",
            "auctionStarter": "",
            "parenthash": "",
            "domain": "",
            "domainTTL": "",
            "startBlockSelling": 0,
            "endBlock": "",
            "maxPrice": "",
            "maxBuyer": "",
            "lastBlock": ""
          },
        CGASopValue:0,
        drawerVisible: false
    }  

    intervalID:any
    componentDidMount(){

        this.intervalID = setInterval(async ()=>{
            this.setState({
                auctionDay :await this.calcAuctionDay(this.state.auctionStateInfo.startBlockSelling)
            })           
        },1000)

        if(this.props.store.isTeemoReady){
            this.getInvokeRead_getBanlance()
        }     

        window.addEventListener ("newBlockEvent", this.doOnEvent, false)
    }

    componentWillUnmount(){
        window.removeEventListener("newBlockEvent", this.doOnEvent, false);
        clearInterval(this.intervalID)
    }

    doOnEvent = (e:any) =>{
        console.log('newBlockEvent',e)
        if(e.detail.txidIndex > -1){
            this.getInvokeRead_getBanlance()
        }   
    }

    calcAuctionDay =async (blockIndex:number) =>{
        var startTimeS = (await new NeoHelper(this.props.store).getBlock(blockIndex)).result.time as number
        return  (new Date().getTime()/1000 - startTimeS)/ 60 / this.props.store.auctionMinPerDay  //每天分钟数
    }

    getInvokeRead_getBanlance = async () =>{
        let invokeRead_CGAS_getBanlance =  {
            "scriptHash": this.props.store.scriptHash.NEP_5_CGAS,
            "operation": "balanceOf",
            "arguments": [
                {"type":"Address","value":this.props.store.address}
            ],
            "network": this.props.store.network
        }
        let invokeRead_auction_getBanlance =  {
            "scriptHash": this.props.store.scriptHash.nns_auction,
            "operation": "balanceOf",
            "arguments": [
                {"type":"Address","value":this.props.store.address}
            ],
            "network": this.props.store.network
        }       
        let invokeRead_auction_getAuctionState =  {
            "scriptHash": this.props.store.scriptHash.nns_auction,
            "operation": "getAuctionStateByFullhash",
            "arguments": [
                {"type":"ByteArray","value":await new NNSHelper(this.props.store).namehash(this.props.store.nns)}
            ],
            "network": this.props.store.network
        }        
        let invokeRead_auction_getBalanceOfBid =  {
            "scriptHash": this.props.store.scriptHash.nns_auction,
            "operation": "balanceOfBid",
            "arguments": [
                {"type":"Address","value":this.props.store.address},
                {"type":"ByteArray","value":""}
            ],
            "network": this.props.store.network
        }

        // invokeRead_CGAS_getBanlance.arguments[0].value =  this.props.store.address//await this.NNSh.namehash(this.state.inputValue)

        // this.invokeRead_auction_getBanlance.arguments[0].value =  this.props.store.address

        //this.invokeRead_auction_getAuctionState.arguments[0].value = await new NNSHelper(this.props.store).namehash(this.props.store.nns)

        //console.log(invokeRead_resolve)
        var InvokeReadGroupInput = {group:[{}]}
        InvokeReadGroupInput.group.pop()
        InvokeReadGroupInput.group.push(invokeRead_CGAS_getBanlance)
        InvokeReadGroupInput.group.push(invokeRead_auction_getBanlance)
        InvokeReadGroupInput.group.push(invokeRead_auction_getAuctionState)
        
        // console.log(JSON.stringify(InvokeReadGroupInput,null,2));
        
        var resData:InvokeScriptResp = await Teemo.NEO.invokeReadGroup(JSON.parse(JSON.stringify(InvokeReadGroupInput)) as InvokeReadGroup)       
        //console.log(resData.stack[3].value);
        //console.log(resData)

        if(resData.stack[0] != null){
            //console.log('stack',resData.stack)
            var stack2:any = resData.stack[2].value;
            //console.log('stack2',stack2)

            var AuctionStateInfo:AuctionState = {
                id:stack2[0].value, //拍卖id,就是拍卖生成的auctionid
                auctionStarter:stack2[1].value,//域名开拍的人
                parenthash:stack2[2].value,//拍卖内容
                domain:stack2[3].value,//拍卖内容
                domainTTL:stack2[4].value,//域名的TTL,用这个信息来判断域名是否发生了变化
                startBlockSelling:stack2[5].value,//开始销售块
                endBlock:stack2[6].value,//结束块
                maxPrice:stack2[7].value,//最高出价
                maxBuyer:stack2[8].value,//最大出价者
                lastBlock:stack2[9].value//最后出价块
            }
            AuctionStateInfo.auctionStarter = await Teemo.NEO.getAddressFromScriptHash(NeoHelper.hexReverse(AuctionStateInfo.auctionStarter))
            AuctionStateInfo.domain = NeoHelper.hexToString(AuctionStateInfo.domain)
            AuctionStateInfo.domainTTL = NeoHelper.hex2TimeStr(AuctionStateInfo.domainTTL)
            AuctionStateInfo.maxPrice = AuctionStateInfo.maxPrice/10**8
            if(AuctionStateInfo.maxBuyer != ''){
                AuctionStateInfo.maxBuyer = await Teemo.NEO.getAddressFromScriptHash(NeoHelper.hexReverse(AuctionStateInfo.maxBuyer))
            }      

            //---第二轮invokescript

            // this.invokeRead_auction_getBalanceOfBid.arguments[0].value = this.props.store.address
            invokeRead_auction_getBalanceOfBid.arguments[1].value = AuctionStateInfo.id

            var resData2:InvokeScriptResp = await Teemo.NEO.invokeRead(JSON.parse(JSON.stringify(invokeRead_auction_getBalanceOfBid)) as InvokeArgs)

            //console.log('AuctionStateInfo',AuctionStateInfo)

            //var CGAS_balacnce = resData.stack[0].value
            //console.log(NeoHelper.hex2Int(CGAS_balacnce)/10**8)

            this.setState({
                CGASBalance:NeoHelper.hex2Int(resData.stack[0].value)/10**8,
                auctionBalance:NeoHelper.hex2Int(resData.stack[1].value)/10**8,
                bidBalance:NeoHelper.hex2Int(resData2.stack[0].value)/10**8,
                auctionStateInfo:AuctionStateInfo,
                auctionDay:await this.calcAuctionDay(AuctionStateInfo.startBlockSelling),
                resDataRead:JSON.stringify(AuctionStateInfo,null,2),
                loadingR:false
            })
        }
        else{
            this.setState({
                resDataRead:"查询异常",
                loadingR:false
            })
        }

        

        //console.log(this.state.auctionStateInfo)
    }

    butGetInvokeReadClick = async (e:any) => {
        this.getInvokeRead_getBanlance()
    }

    butInvoke_doCGASin_click = async () =>{
        let invoke_CGAS_doCGASinStep0 =  {
            "scriptHash": this.props.store.scriptHash.NEP_5_CGAS,
            "operation": "transfer",
            "arguments": [
                {"type":"Address","value":this.props.store.address},
                {"type":"Address","value":await Teemo.NEO.getAddressFromScriptHash(this.props.store.scriptHash.nns_auction)},
                {"type":"Integer","value":this.state.CGASopValue * (10**8)}
            ],
            "fee":"0",
            "description":"NNS竞拍充值CGAS转账",
            "network": this.props.store.network
        }
        let invoke_auction_doCGASinStep1 =  {
            "scriptHash": this.props.store.scriptHash.nns_auction,
            "operation": "setmoneyin",
            "arguments": [
                {"type":"Hook_Txid","value":0}
            ],
            "fee":"0",
            "description":"NNS竞拍充值确认",
            "network": this.props.store.network
        }

        // this.invoke_CGAS_doCGASinStep0.arguments[0].value = this.props.store.address
        // this.invoke_CGAS_doCGASinStep0.arguments[1].value = await Teemo.NEO.getAddressFromScriptHash(this.props.store.scriptHash.nns_auction)
        // this.invoke_CGAS_doCGASinStep0.arguments[2].value = this.state.CGASopValue * (10**8)

        //console.log(invoke_CGAS_doCGASinStep0)

        var InvokeGroupInput = {merge:true,group:[{}]}
        InvokeGroupInput.group.pop()
        InvokeGroupInput.group.push(invoke_CGAS_doCGASinStep0)
        InvokeGroupInput.group.push(invoke_auction_doCGASinStep1)

        //console.log(InvokeGroupInput)

        this.setState({
            loadingW:true                                
        });

        var resp = await Teemo.NEO.invokeGroup(JSON.parse(JSON.stringify(InvokeGroupInput)) as InvokeGroup)

        //console.log(resp)

        resp.forEach(res => {
            this.props.store.addTxidSended(res.txid)
        });
        this.setState({
            reqDataWrite:JSON.stringify(InvokeGroupInput,null,2),
            resDataWrite:JSON.stringify(resp, null, 2),
            loadingW:false,
            loadingR:true                               
        });
    }

    butInvoke_doCGASout_click = async () =>{
        let invoke_auction_doCGASout =  {
            "scriptHash": this.props.store.scriptHash.nns_auction,
            "operation": "getmoneyback",
            "arguments": [
                {"type":"Address","value":this.props.store.address},
                {"type":"Integer","value":this.state.CGASopValue * (10**8)}
            ],
            "fee":"0",
            "description":"NNS竞拍CGAS提取",
            "network": this.props.store.network
        }

        // this.invoke_auction_doCGASout.arguments[0].value = this.props.store.address
        // this.invoke_auction_doCGASout.arguments[1].value = this.state.CGASopValue * (10**8)

        this.setState({
            loadingW:true                                
        });

        var resp = await Teemo.NEO.invoke(JSON.parse(JSON.stringify(invoke_auction_doCGASout)) as InvokeArgs)

        this.props.store.addTxidSended(resp.txid)
        this.setState({
            reqDataWrite:JSON.stringify(invoke_auction_doCGASout,null,2),
            resDataWrite:JSON.stringify(resp, null, 2),
            loadingW:false,
            loadingR:true                               
        });
    }

    butInvoke_doStartAuction_click = async () =>{
        let invoke_auction_doStartAuction =  {
            "scriptHash": this.props.store.scriptHash.nns_auction,
            "operation": "startAuction",
            "arguments": [
                {"type":"Address","value":this.props.store.address},
                {"type":"ByteArray","value":await new NNSHelper(this.props.store).namehash(this.props.store.nns.split('.')[1])},
                {"type":"String","value":this.props.store.nns.split('.')[0]}
            ],
            "fee":"0",
            "description":"NNS竞拍开标",
            "network": this.props.store.network
        }

        // this.invoke_auction_doStartAuction.arguments[0].value = this.props.store.address;
        // this.invoke_auction_doStartAuction.arguments[1].value = await new NNSHelper(this.props.store).namehash(this.props.store.nns.split('.')[1])
        // this.invoke_auction_doStartAuction.arguments[2].value = this.props.store.nns.split('.')[0]

        //console.log(invoke_auction_doStartAuction)

        this.setState({
            loadingW:true                                
        });

        var resp = await Teemo.NEO.invoke(JSON.parse(JSON.stringify(invoke_auction_doStartAuction)) as InvokeArgs)

        this.props.store.addTxidSended(resp.txid)
        this.setState({
            reqDataWrite:JSON.stringify(invoke_auction_doStartAuction,null,2),
            resDataWrite:JSON.stringify(resp, null, 2),
            loadingW:false,
            loadingR:true                               
        });
    }

    butInvoke_doBid_click = async() =>{
        let invoke_auction_doBid =  {
            "scriptHash": this.props.store.scriptHash.nns_auction,
            "operation": "raise",
            "arguments": [
                {"type":"Address","value":this.props.store.address},
                {"type":"ByteArray","value":this.state.auctionStateInfo.id},
                {"type":"Integer","value":(this.state.inputAmount*(10**8)).toString()}
            ],
            "fee":"0",
            "description":"NNS竞拍加价",
            "network": this.props.store.network
        }

        // this.invoke_auction_doBid.arguments[0].value = this.props.store.address;
        // this.invoke_auction_doBid.arguments[1].value = this.state.auctionStateInfo.id
        // this.invoke_auction_doBid.arguments[2].value = (this.state.inputAmount*(10**8)).toString()

        console.log(invoke_auction_doBid)

        this.setState({
            loadingW:true                                
        });

        var resp = await Teemo.NEO.invoke(JSON.parse(JSON.stringify(invoke_auction_doBid)) as InvokeArgs)

        this.props.store.addTxidSended(resp.txid)
        this.setState({
            reqDataWrite:JSON.stringify(invoke_auction_doBid,null,2),
            resDataWrite:JSON.stringify(resp, null, 2),
            loadingW:false,
            loadingR:true                               
        })
    }

    butInvoke_doBidSettlementAndCollect_click = async() =>{
        let invoke_auction_doBidSettlement =  {
            "scriptHash": this.props.store.scriptHash.nns_auction,
            "operation": "bidSettlement",
            "arguments": [
                {"type":"Address","value":this.props.store.address},
                {"type":"ByteArray","value":this.state.auctionStateInfo.id}
            ],
            "fee":"0",
            "description":"NNS竞拍域名领取",
            "network": this.props.store.network
        }        
        let invoke_auction_doCollect =  {
            "scriptHash": this.props.store.scriptHash.nns_auction,
            "operation": "collectDomain",
            "arguments": [
                {"type":"Address","value":this.props.store.address},
                {"type":"ByteArray","value":this.state.auctionStateInfo.id}
            ],
            "fee":"0",
            "description":"NNS竞拍域名领取",
            "network": this.props.store.network
        }
        // this.invoke_auction_doBidSettlement.arguments[0].value = this.props.store.address
        // this.invoke_auction_doBidSettlement.arguments[1].value = this.state.auctionStateInfo.id

        // this.invoke_auction_doCollect.arguments[0].value = this.props.store.address
        // this.invoke_auction_doCollect.arguments[1].value = this.state.auctionStateInfo.id

        var InvokeGroupInput = {merge:false,group:[{}]}
        InvokeGroupInput.group.pop()
        InvokeGroupInput.group.push(invoke_auction_doBidSettlement)
        InvokeGroupInput.group.push(invoke_auction_doCollect)

        //console.log(JSON.stringify(InvokeGroupInput,null,2))

        this.setState({
            loadingW:true                                
        });

        var resp = await Teemo.NEO.invokeGroup(JSON.parse(JSON.stringify(InvokeGroupInput)) as InvokeGroup)

        //console.log(resp)
        resp.forEach(res => {
            this.props.store.addTxidSended(res.txid)
        });
        this.setState({
            reqDataWrite:JSON.stringify(InvokeGroupInput,null,2),
            resDataWrite:JSON.stringify(resp, null, 2),
            loadingW:false,
            loadingR:true                               
        });
    }

    butInvoke_doRenew_click = async() =>{
        let invoke_auction_doRenew =  {
            "scriptHash": this.props.store.scriptHash.nns_auction,
            "operation": "renewDomain",
            "arguments": [
                {"type":"Address","value":this.props.store.address},
                {"type":"ByteArray","value":await new NNSHelper(this.props.store).namehash(this.props.store.nns.split('.')[1])},
                {"type":"String","value":this.props.store.nns.split('.')[0]}
            ],
            "fee":"0",
            "description":"NNS域名续期",
            "network": this.props.store.network
        }

        // this.invoke_auction_doRenew.arguments[0].value = this.props.store.address
        // this.invoke_auction_doRenew.arguments[1].value = await new NNSHelper(this.props.store).namehash(this.props.store.nns.split('.')[1])
        // this.invoke_auction_doRenew.arguments[2].value = this.props.store.nns.split('.')[0]

        console.log(invoke_auction_doRenew)

        this.setState({
            loadingW:true                                
        });

        var resp = await Teemo.NEO.invoke(JSON.parse(JSON.stringify(invoke_auction_doRenew)) as InvokeArgs)

        this.props.store.addTxidSended(resp.txid)
        this.setState({
            reqDataWrite:JSON.stringify(invoke_auction_doRenew,null,2),
            resDataWrite:JSON.stringify(resp, null, 2),
            loadingW:false,
            loadingR:true                               
        })
    }

    CGASopChange(e:any){
        this.setState({
            CGASopValue:e.target.value
        })
    }

    // addrChange(e:any){
    //     this.setState({
    //         inputValueAddr:e.target.value
    //     })
    // }

    // nnsChange(e:any){
    //     this.setState({
    //         inputValueNns:e.target.value
    //     })
    // }

    amountChange(e:any){
        this.setState({
            inputAmount:e
        })
    }

    render() {
      return ( 
        <>
            <p>NNS Auction</p>
            <Switch checked={this.props.store.auctionMinPerDay == 5?true:false} checkedChildren="*.test" unCheckedChildren="*.neo" defaultChecked onChange={async (e)=>{
                    console.log(e)
                    if(e) 
                    {
                        this.props.store.updateAuctionMinPerDay(5)
                        var newNns = this.props.store.nns.replace('.neo','.test')
                        this.props.store.updateNNS(newNns);
                        // console.log(this.nnsInput.current)
                        this.nnsInput.current.state.value = newNns
                    }
                    else {
                        this.props.store.updateAuctionMinPerDay(1440)
                        var newNns = this.props.store.nns.replace('.test','.neo')
                        this.props.store.updateNNS(newNns);
                        this.nnsInput.current.state.value = newNns
                    }

                    this.setState({
                        CGASBalance:0,
                        auctionBalance:0,
                        bidBalance:0,
                        auctionStateInfo:{
                            "id": "",
                            "auctionStarter": "",
                            "parenthash": "",
                            "domain": "",
                            "domainTTL": "",
                            "startBlockSelling": 0,
                            "endBlock": "",
                            "maxPrice": "",
                            "maxBuyer": "",
                            "lastBlock": ""
                          },
                        auctionDay:await this.calcAuctionDay(0),
                        resDataRead:"{}"
                    })
                    this.getInvokeRead_getBanlance()                 
                }} />选择根域(流速{this.props.store.auctionMinPerDay}分钟每天)
            <Divider /> 
            <Row gutter={16}>
                <Col span={8}>
                    <Spin tip='等待共识中' spinning={this.state.loadingR}>
                        <Statistic title="钱包账户" value={this.state.CGASBalance} suffix="CGAS" prefix={<Icon type="money-collect" />} />
                    </Spin>                  
                </Col>
                <Col span={8}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Button onClick={this.butInvoke_doCGASout_click} ><Icon type="left" />提取</Button>
                        </Col>
                        <Col span={8}>
                            <Input placeholder="输入金额" onChange={this.CGASopChange.bind(this)} defaultValue={this.state.CGASopValue.toString()} />   
                        </Col>
                        <Col span={8}>
                            <Button onClick={this.butInvoke_doCGASin_click} >充值<Icon type="right" /></Button>
                        </Col>
                    </Row>                                                     
                </Col>
                <Col span={8}>
                    <Spin tip='等待共识中' spinning={this.state.loadingR}>
                    <Statistic title="合约账户" value={this.state.auctionBalance} suffix="CGAS" prefix={<Icon type="money-collect" />} />
                    </Spin>                  
                </Col>
            </Row>
            {/* <Input placeholder="输入要查询的地址" onChange={this.addrChange.bind(this)} defaultValue={this.props.store.address}/> */}
            {/* <Input placeholder="输入要绑定的NNS" onChange={this.nnsChange.bind(this)} defaultValue={this.props.store.nns}/> */}
            <Input placeholder="输入地址" onChange={(e)=>{this.props.store.updateAddress(e.target.value)}} defaultValue={this.props.store.address}/>
            <Input ref={this.nnsInput} placeholder="输入NSS域名" onChange={(e)=>{this.props.store.updateNNS(e.target.value)}} defaultValue={this.props.store.nns}/>

            <Button onClick={this.butGetInvokeReadClick} type="primary">刷新数据</Button>
            <Divider type="vertical" />
            <Button onClick={this.butInvoke_doStartAuction_click}>开标</Button>           
            <Divider type="vertical" />
            <InputNumber min={0} max={this.state.auctionBalance} step={0.1} onChange={this.amountChange.bind(this)} />=>
            <Button onClick={this.butInvoke_doBid_click}>加价</Button> 
            <Divider type="vertical" /> 
            <Button onClick={this.butInvoke_doBidSettlementAndCollect_click}>结算与领取</Button>
            <Divider type="vertical" /> 
            <Button onClick={this.butInvoke_doRenew_click} disabled={this.state.auctionDay>(365-90)?false:true}>续期{(this.state.auctionDay-(365-90)).toFixed(2)}</Button>             
            <Divider />         
            <Spin tip='等待共识中' spinning={this.state.loadingR}>
                <Row type="flex" align="middle" gutter={16}>
                    <Col span={3}>
                        <Statistic title="开拍天数" value={this.state.auctionDay.toFixed(2)} suffix="天" prefix={<Icon type="clock-circle" />} />
                    </Col>
                    <Col span={8}>
                        <Switch checked={this.state.drawerVisible} onChange={()=>{this.setState({drawerVisible: !this.state.drawerVisible})}} />显示时间轴  
                    </Col>
                    <Col span={13}>
                        <Statistic title="加价总数" value={this.state.bidBalance} suffix="CGAS" prefix={<Icon type="money-collect" />} />
                    </Col>
                </Row>                                             
                
                {/* <Button type="primary" onClick={()=>{this.setState({drawerVisible: true})}}>查看竞拍阶段</Button> */}
                <Drawer
                    title="竞拍阶段"
                    placement="left"
                    closable={false}
                    onClose={()=>{this.setState({drawerVisible: false})}}
                    visible={this.state.drawerVisible}
                    >
                        <Timeline>
                            <Timeline.Item color={this.state.auctionDay>0?'green':'blue'}>确定期（1-2）</Timeline.Item>
                            <Timeline.Item color={this.state.auctionDay>2?'green':'blue'}>确定期（3）</Timeline.Item>
                            <Timeline.Item color={this.state.auctionDay>3?'green':'blue'}>随机期（4-5）</Timeline.Item>
                            <Timeline.Item color={this.state.auctionDay>5?'green':'blue'}>竞拍结束（5）</Timeline.Item>
                            <Timeline.Item color={this.state.auctionDay>(365-90)?'green':'blue'}>续期期（365-90）</Timeline.Item>
                            <Timeline.Item color={this.state.auctionDay>365?'green':'blue'}>到期（365）</Timeline.Item>
                        </Timeline>
                    </Drawer>
                <pre>{this.state.resDataRead}</pre>
            </Spin>
            {/* <pre>{this.state.reqDataWrite}</pre> */}
            <Spin tip='请求中' spinning={this.state.loadingW}>
                <pre>{this.state.resDataWrite}</pre>
            </Spin>
        </>
        )    
    }
  }

export default DivAuction;