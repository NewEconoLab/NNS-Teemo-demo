import React, { Component } from 'react';
import {Button,Input} from 'antd';
import { async } from 'q';
import { any, number } from 'prop-types';
import NeoHelper from '../Tools/neoHelper'
import NNSHelper from '../Tools/nnsHelper'

interface IProps{
    title:string
    address:string
    scriptHash:any
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

let invokeRead_credit =  {
    "scriptHash": "",
    "operation": "getCreditInfo",
    "arguments": [
        {"type":"Address","value":""}
    ],
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

class DivNnsCredit extends React.Component<IProps,any> {
    NNSh = new NNSHelper(this.props.scriptHash);

    state = {
        resData : '{}',
        inputValueAddr : this.props.address,
        inputValueNns : 'qmz.test'
    }  

    componentDidMount(){
        invokeRead_credit.scriptHash = this.props.scriptHash.nns_credit
        invoke_credit_authenticate.scriptHash = this.props.scriptHash.nns_credit
        invoke_credit_revoke.scriptHash = this.props.scriptHash.nns_credit
    }

    butGetInvokeReadClick = async (e:any) => {
        invokeRead_credit.arguments[0].value =  this.state.inputValueAddr//await this.NNSh.namehash(this.state.inputValue)

        //console.log(invokeRead_resolve)
        var creditData:InvokeScriptResp = await Teemo.NEO.invokeRead(JSON.parse(JSON.stringify(invokeRead_credit)) as InvokeReadInput)       
        //console.log(creditData);

        var stack0:any = creditData.stack[0].value;
        var creditInfo:NNScredit = {
            namehash:stack0[0].value,
            fullDomainName:stack0[1].value,
            TTL:stack0[2].value,
        }
        creditInfo.fullDomainName = NeoHelper.hex2a(creditInfo.fullDomainName)
        creditInfo.TTL = NeoHelper.timetrans(parseInt(NeoHelper.byte2Hex(NeoHelper.hex2Byte(creditInfo.TTL).reverse()), 16))

        this.setState({
            resData:JSON.stringify(creditInfo, null, 2)                                 
        });
    }

    butInvokeCreditAuthenticateClick = async(e:any) => {
        invoke_credit_authenticate.arguments[0].value = this.state.inputValueAddr
        for (const str of this.state.inputValueNns.split('.').reverse()) {
            ((invoke_credit_authenticate.arguments as Argument[])[1].value as Argument[]).push({type:"String",value:str});
        }

        var invokeCreditAuthenticateResp:InvokeOutput = await Teemo.NEO.invoke(JSON.parse(JSON.stringify(invoke_credit_authenticate)) as InvokeArgs)

        this.setState({
            resData:JSON.stringify(invokeCreditAuthenticateResp, null, 2)                                 
        });
    }

    butInvokeCreditRevokeClick = async(e:any) => {
        invoke_credit_revoke.arguments[0].value = this.state.inputValueAddr

        var invokeCreditRevokeResp:InvokeOutput = await Teemo.NEO.invoke(JSON.parse(JSON.stringify(invoke_credit_revoke)) as InvokeArgs)

        this.setState({
            resData:JSON.stringify(invokeCreditRevokeResp, null, 2)                                 
        });
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

    render() {
      return ( 
        <>
            <p>{this.props.title}</p>
            <Input placeholder="输入要查询的地址" onChange={this.addrChange.bind(this)} defaultValue={this.state.inputValueAddr}/>
            <Input placeholder="输入要绑定的NNS" onChange={this.nnsChange.bind(this)} defaultValue={this.state.inputValueNns}/>
            <Button onClick={this.butGetInvokeReadClick} type="primary">获取NNS反向代理信息</Button>
            <Button onClick={this.butInvokeCreditAuthenticateClick}>绑定</Button>
            <Button onClick={this.butInvokeCreditRevokeClick}>解绑</Button>
            <pre>{this.state.resData}</pre>
        </>
        )    
    }
  }

export default DivNnsCredit;