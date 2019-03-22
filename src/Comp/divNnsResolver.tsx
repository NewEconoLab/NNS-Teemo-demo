import React, { Component } from 'react';
import {Button,Input} from 'antd';
import { async } from 'q';
import { any, number } from 'prop-types';
import NeoHelper from '../Tools/neoHelper'
import NNSHelper from '../Tools/nnsHelper'

interface IProps{
    title:string
    scriptHash:any
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

let invokeRead_resolve =  {
    "scriptHash": "",
    "operation": "resolve",
    "arguments": [
        {"type":"String","value":"addr"},
        {"type":"ByteArray","value":""}
    ],
    "network": "TestNet"
}

class DivNnsResolver extends React.Component<IProps,any> {
    NNSh = new NNSHelper(this.props.scriptHash);

    state = {
        resData : '{}',
        inputValue : 'qmz.test'
    }  

    componentDidMount(){
        invokeRead_resolve.scriptHash = this.props.scriptHash.nns_resolver
    }

    butGetInvokeReadClick = async (e:any) => {
        invokeRead_resolve.arguments[1].value = await this.NNSh.namehash(this.state.inputValue)

        //console.log(invokeRead_resolve)
        var resolverData:InvokeScriptResp = await Teemmo.NEO.invokeRead(JSON.parse(JSON.stringify(invokeRead_resolve)) as InvokeReadInput)       
        //console.log(resolverData);

        this.setState({
            resData:NeoHelper.hex2a(resolverData.stack[0].value)                                 
        });
    }

    handelChange(e:any){
        this.setState({
            inputValue:e.target.value
        })
    }

    render() {
      return ( 
        <>
            <p>{this.props.title}</p>
            <Input placeholder="输入要查询的NSS域名" onChange={this.handelChange.bind(this)} defaultValue={this.state.inputValue}/>
            <Button onClick={this.butGetInvokeReadClick} type="primary">获取NNS所有者信息</Button>
            <pre>{this.state.resData}</pre>
        </>
        )    
    }
  }

export default DivNnsResolver;