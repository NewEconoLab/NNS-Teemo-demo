import React, { Component } from 'react';
import {autorun} from 'mobx'
import {Button,Input,Spin,Statistic, Row, Col, Icon,Timeline,Drawer,Switch,InputNumber,Divider} from 'antd';
import { async } from 'q';
import { any, number } from 'prop-types';
import NeoHelper from '../Tools/neoHelper'
import NNSHelper from '../Tools/nnsHelper'

interface IProps{
    title:string
    address:string
    teemoReady:boolean
    scriptHash:any
}

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

let invokeRead_CGAS_getBanlance =  {
    "scriptHash": "",
    "operation": "balanceOf",
    "arguments": [
        {"type":"Address","value":""}
    ],
    "network": "TestNet"
}

let invokeRead_auction_getBanlance =  {
    "scriptHash": "",
    "operation": "balanceOf",
    "arguments": [
        {"type":"Address","value":""}
    ],
    "network": "TestNet"
}

let invokeRead_auction_getAuctionState =  {
    "scriptHash": "",
    "operation": "getAuctionStateByFullhash",
    "arguments": [
        {"type":"ByteArray","value":""}
    ],
    "network": "TestNet"
}

let invokeRead_auction_getBalanceOfBid =  {
    "scriptHash": "",
    "operation": "balanceOfBid",
    "arguments": [
        {"type":"Address","value":""},
        {"type":"ByteArray","value":""}
    ],
    "network": "TestNet"
}

let invoke_CGAS_doCGASinStep0 =  {
    "scriptHash": "",
    "operation": "transfer",
    "arguments": [
        {"type":"Address","value":""},
        {"type":"Address","value":""},
        {"type":"Integer","value":0}
    ],
    "fee":"0",
    "description":"NNS竞拍充值CGAS转账",
    "network": "TestNet"
}

let invoke_auction_doCGASinStep1 =  {
    "scriptHash": "",
    "operation": "setmoneyin",
    "arguments": [
        {"type":"Hook_Txid","value":0}
    ],
    "fee":"0",
    "description":"NNS竞拍充值确认",
    "network": "TestNet"
}

let invoke_auction_doCGASout =  {
    "scriptHash": "",
    "operation": "getmoneyback",
    "arguments": [
        {"type":"Address","value":""},
        {"type":"Integer","value":0}
    ],
    "fee":"0",
    "description":"NNS竞拍CGAS提取",
    "network": "TestNet"
}

let invoke_auction_doStartAuction =  {
    "scriptHash": "",
    "operation": "startAuction",
    "arguments": [
        {"type":"Address","value":""},
        {"type":"ByteArray","value":""},
        {"type":"String","value":""}
    ],
    "fee":"0",
    "description":"NNS竞拍加价",
    "network": "TestNet"
}

let invoke_auction_doBid =  {
    "scriptHash": "",
    "operation": "raise",
    "arguments": [
        {"type":"Address","value":""},
        {"type":"ByteArray","value":""},
        {"type":"Integer","value":0}
    ],
    "fee":"0",
    "description":"NNS竞拍开标",
    "network": "TestNet"
}

let invoke_auction_doBidSettlement =  {
    "scriptHash": "",
    "operation": "bidSettlement",
    "arguments": [
        {"type":"Address","value":""},
        {"type":"ByteArray","value":""}
    ],
    "fee":"0",
    "description":"NNS竞拍域名领取",
    "network": "TestNet"
}

let invoke_auction_doCollect =  {
    "scriptHash": "",
    "operation": "collectDomain",
    "arguments": [
        {"type":"Address","value":""},
        {"type":"ByteArray","value":""}
    ],
    "fee":"0",
    "description":"NNS竞拍域名领取",
    "network": "TestNet"
}

let invoke_auction_doRenew =  {
    "scriptHash": "",
    "operation": "renewDomain",
    "arguments": [
        {"type":"Address","value":""},
        {"type":"ByteArray","value":""},
        {"type":"String","value":""}
    ],
    "fee":"0",
    "description":"NNS域名续期",
    "network": "TestNet"
}

let invoke_credit_authenticate =  {
    "scriptHash": "",
    "operation": "authenticate",
    "arguments": [
        {"type":"Address","value":""},
        {"type":"Array","value":[]}
    ],
    "fee":"0",
    "description":"NNS反向解析绑定",
    "network": "TestNet"
}

let invoke_credit_revoke =  {
    "scriptHash": "",
    "operation": "revoke",
    "arguments": [
        {"type":"Address","value":""},
    ],
    "fee":"0",
    "description":"NNS反向解析解绑",
    "network": "TestNet"
}

class DivAuction extends React.Component<any,any> {
    NNSh = new NNSHelper(this.props.scriptHash);

    state = {
        resDataRead : '{}',
        reqDataWrite : '{}',
        resDataWrite : '{}',
        inputValueAddr : this.props.address,
        inputValueNns : 'qmz.test',
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
        invokeRead_CGAS_getBanlance.scriptHash = this.props.scriptHash.NEP_5_CGAS
        invokeRead_auction_getBanlance.scriptHash = this.props.scriptHash.nns_auction
        invoke_CGAS_doCGASinStep0.scriptHash = this.props.scriptHash.NEP_5_CGAS
        invoke_auction_doCGASinStep1.scriptHash = this.props.scriptHash.nns_auction
        invoke_auction_doCGASout.scriptHash = this.props.scriptHash.nns_auction
        invokeRead_auction_getAuctionState.scriptHash = this.props.scriptHash.nns_auction
        invoke_auction_doStartAuction.scriptHash = this.props.scriptHash.nns_auction
        invoke_auction_doBid.scriptHash = this.props.scriptHash.nns_auction
        invokeRead_auction_getBalanceOfBid.scriptHash = this.props.scriptHash.nns_auction
        invoke_auction_doBidSettlement.scriptHash = this.props.scriptHash.nns_auction
        invoke_auction_doCollect.scriptHash = this.props.scriptHash.nns_auction
        invoke_auction_doRenew.scriptHash = this.props.scriptHash.nns_auction

        this.intervalID = setInterval(async ()=>{
            this.setState({
                auctionDay :await this.calcAuctionDay(this.state.auctionStateInfo.startBlockSelling)
            })           
        },1000)

        console.log("teemoReady:" ,this.props.teemoReady)
        if(this.props.teemoReady)
        {
            console.log(1)
            this.getInvokeRead_getBanlance()
        }
        else{
            console.log(0)
            var intervalID = setInterval(()=>{
                console.log("teemoReady:" ,this.props.teemoReady)
                if(this.props.teemoReady)
                {
                    setTimeout(()=>{this.getInvokeRead_getBanlance()},1000)                   
                    clearInterval(intervalID)
                }               
            },1000) 
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
        var startTimeS = (await NeoHelper.getBlock(blockIndex)).result.time as number
        return  (new Date().getTime()/1000 - startTimeS)/ 60 / 5  //5分钟1天
    }

    getInvokeRead_getBanlance = async () =>{
        invokeRead_CGAS_getBanlance.arguments[0].value =  this.state.inputValueAddr//await this.NNSh.namehash(this.state.inputValue)
        invokeRead_auction_getBanlance.arguments[0].value =  this.state.inputValueAddr
        invokeRead_auction_getAuctionState.arguments[0].value = await this.NNSh.namehash(this.state.inputValueNns)
        invokeRead_auction_getBalanceOfBid.arguments[0].value = this.state.inputValueAddr
        invokeRead_auction_getBalanceOfBid.arguments[1].value = this.state.auctionStateInfo.id

        //console.log(invokeRead_resolve)
        var InvokeReadGroupInput = {group:[{}]}
        InvokeReadGroupInput.group.pop()
        InvokeReadGroupInput.group.push(invokeRead_CGAS_getBanlance)
        InvokeReadGroupInput.group.push(invokeRead_auction_getBanlance)
        InvokeReadGroupInput.group.push(invokeRead_auction_getAuctionState)
        InvokeReadGroupInput.group.push(invokeRead_auction_getBalanceOfBid)
        
        console.log(JSON.stringify(invokeRead_auction_getBalanceOfBid));
        
        var resData:InvokeScriptResp = await Teemo.NEO.invokeReadGroup(JSON.parse(JSON.stringify(InvokeReadGroupInput)) as InvokeReadGroup)       
        //console.log(resData.stack[3].value);
        console.log(resData)

        var stack2:any = resData.stack[2].value;
        //console.log(stack2)

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
        AuctionStateInfo.domain = NeoHelper.hex2a(AuctionStateInfo.domain)
        AuctionStateInfo.domainTTL = NeoHelper.hex2TimeStr(AuctionStateInfo.domainTTL)
        AuctionStateInfo.maxPrice = AuctionStateInfo.maxPrice/10**8
        AuctionStateInfo.maxBuyer = await Teemo.NEO.getAddressFromScriptHash(NeoHelper.hexReverse(AuctionStateInfo.maxBuyer))

        //console.log(AuctionStateInfo)

        //var CGAS_balacnce = resData.stack[0].value
        //console.log(NeoHelper.hex2Int(CGAS_balacnce)/10**8)

        this.setState({
            CGASBalance:NeoHelper.hex2Int(resData.stack[0].value)/10**8,
            auctionBalance:NeoHelper.hex2Int(resData.stack[1].value)/10**8,
            bidBalance:NeoHelper.hex2Int(resData.stack[3].value)/10**8,
            auctionStateInfo:AuctionStateInfo,
            auctionDay:await this.calcAuctionDay(AuctionStateInfo.startBlockSelling),
            resDataRead:JSON.stringify(AuctionStateInfo,null,2),
            loadingR:false
        })

        //console.log(this.state.auctionStateInfo)
    }

    butGetInvokeReadClick = async (e:any) => {
        this.getInvokeRead_getBanlance()
    }

    butInvoke_doCGASin_click = async () =>{
        invoke_CGAS_doCGASinStep0.arguments[0].value = this.state.inputValueAddr
        invoke_CGAS_doCGASinStep0.arguments[1].value = await Teemo.NEO.getAddressFromScriptHash(this.props.scriptHash.nns_auction)
        invoke_CGAS_doCGASinStep0.arguments[2].value = this.state.CGASopValue * (10**8)

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
        invoke_auction_doCGASout.arguments[0].value = this.state.inputValueAddr
        invoke_auction_doCGASout.arguments[1].value = this.state.CGASopValue * (10**8)

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
        invoke_auction_doStartAuction.arguments[0].value = this.state.inputValueAddr;
        invoke_auction_doStartAuction.arguments[1].value = await this.NNSh.namehash(this.state.inputValueNns.split('.')[1])
        invoke_auction_doStartAuction.arguments[2].value = this.state.inputValueNns.split('.')[0]

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
        invoke_auction_doBid.arguments[0].value = this.state.inputValueAddr;
        invoke_auction_doBid.arguments[1].value = this.state.auctionStateInfo.id
        invoke_auction_doBid.arguments[2].value = (this.state.inputAmount*(10**8)).toString()

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
        invoke_auction_doBidSettlement.arguments[0].value = this.state.inputValueAddr
        invoke_auction_doBidSettlement.arguments[1].value = this.state.auctionStateInfo.id

        invoke_auction_doCollect.arguments[0].value = this.state.inputValueAddr
        invoke_auction_doCollect.arguments[1].value = this.state.auctionStateInfo.id

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
        invoke_auction_doRenew.arguments[0].value = this.state.inputValueAddr
        invoke_auction_doRenew.arguments[1].value = await this.NNSh.namehash(this.state.inputValueNns.split('.')[1])
        invoke_auction_doRenew.arguments[2].value = this.state.inputValueNns.split('.')[0]

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

    butInvokeCreditAuthenticateClick = async(e:any) => {
        invoke_credit_authenticate.arguments[0].value = this.state.inputValueAddr
        invoke_credit_authenticate.arguments[1].value = []
        for (const str of this.state.inputValueNns.split('.').reverse()) {
            ((invoke_credit_authenticate.arguments as Argument[])[1].value as Argument[]).push({type:"String",value:str});
        }

        this.setState({
            loadingW:true                                
        });

        var invokeCreditAuthenticateResp:InvokeOutput = await Teemo.NEO.invoke(JSON.parse(JSON.stringify(invoke_credit_authenticate)) as InvokeArgs)

        this.props.store.addTxidSended(invokeCreditAuthenticateResp.txid)
        this.setState({
            reqDataWrite:JSON.stringify(invoke_credit_authenticate,null,2),
            resDataWrite:JSON.stringify(invokeCreditAuthenticateResp, null, 2),
            loadingW:false,
            loadingR:true                               
        });
    }

    butInvokeCreditRevokeClick = async(e:any) => {
        invoke_credit_revoke.arguments[0].value = this.state.inputValueAddr

        this.setState({
            loadingW:true                                
        });

        var invokeCreditRevokeResp:InvokeOutput = await Teemo.NEO.invoke(JSON.parse(JSON.stringify(invoke_credit_revoke)) as InvokeArgs)

        this.props.store.addTxidSended(invokeCreditRevokeResp.txid)
        this.setState({
            reqDataWrite:JSON.stringify(invoke_credit_revoke,null,2),
            resDataWrite:JSON.stringify(invokeCreditRevokeResp, null, 2),
            loadingW:false,
            loadingR:true                                                                 
        });
    }

    CGASopChange(e:any){
        this.setState({
            CGASopValue:e.target.value
        })
    }

    addrChange(e:any){
        this.setState({
            inputValueAddr:e.target.value
        })
    }

    nnsChange(e:any){
        this.setState({
            inputValueNns:e.target.value
        })
    }

    amountChange(e:any){
        this.setState({
            inputAmount:e
        })
    }

    render() {
      return ( 
        <>
            <p>{this.props.title}</p>
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
            <Input placeholder="输入要查询的地址" onChange={this.addrChange.bind(this)} defaultValue={this.state.inputValueAddr}/>
            <Input placeholder="输入要绑定的NNS" onChange={this.nnsChange.bind(this)} defaultValue={this.state.inputValueNns}/>
            <Button onClick={this.butGetInvokeReadClick} type="primary">刷新数据</Button>
            <Divider type="vertical" />
            <Button onClick={this.butInvoke_doStartAuction_click}>开标</Button>           
            <Divider type="vertical" />
            <InputNumber min={0} max={this.state.auctionBalance} step={0.1} onChange={this.amountChange.bind(this)} />=>
            <Button onClick={this.butInvoke_doBid_click}>加价</Button> 
            <Divider type="vertical" /> 
            <Button onClick={this.butInvoke_doBidSettlementAndCollect_click}>结算与领取</Button>
            <Divider type="vertical" /> 
            <Button onClick={this.butInvoke_doRenew_click} disabled={this.state.auctionDay>(365-90)?true:false}>续期{(this.state.auctionDay-(365-90)).toFixed(2)}</Button>             
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