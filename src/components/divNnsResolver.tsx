import React, { Component } from 'react';
import {Button,Input} from 'antd';
import { async } from 'q';
import { any, number } from 'prop-types';
import NeoHelper from '../Tools/neoHelper'
import NNSHelper from '../Tools/nnsHelper'
import {inject,observer} from 'mobx-react'

// interface IProps{
//     title:string
//     scriptHash:any
// }

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
class DivNnsResolver extends React.Component<any,any> {
    // NNSh = new NNSHelper(this.props.store);
    
    state = {
        resData : '{}'
    }  

    componentDidMount(){
        
    }

    butGetInvokeReadClick = async (e:any) => {
        let invokeRead_resolve =  {
            "scriptHash": this.props.store.scriptHash.nns_resolver,
            "operation": "resolve",
            "arguments": [
                {"type":"String","value":"addr"},
                {"type":"ByteArray","value":await new NNSHelper(this.props.store).namehash(this.props.store.nns)}
            ],
            "network": this.props.store.network
        }

        // invokeRead_resolve.arguments[1].value = await this.NNSh.namehash(this.props.store.nns)

        //console.log(this.invokeRead_resolve)
        var resolverData:InvokeScriptResp = await Teemo.NEO.invokeRead(JSON.parse(JSON.stringify(invokeRead_resolve)) as InvokeReadInput)       
        //console.log(resolverData);

        this.setState({
            resData:NeoHelper.hex2a(resolverData.stack[0].value)==''?'未映射':NeoHelper.hex2a(resolverData.stack[0].value)                                 
        });
    }

    // handelChange(e:any){
    //     this.setState({
    //         inputValue:e.target.value
    //     })
    // }

    render() {
      return ( 
        <>
            <p>NNS Resolver</p>
            {/* <Input placeholder="输入要查询的NSS域名" onChange={this.handelChange.bind(this)} defaultValue={this.state.inputValue}/> */}
            <Input placeholder="输入NSS域名" onChange={(e)=>{this.props.store.updateNNS(e.target.value)}} defaultValue={this.props.store.nns}/>
            <Button onClick={this.butGetInvokeReadClick} type="primary">解析NNS</Button>
            <pre>{this.state.resData}</pre>
        </>
        )    
    }
  }

export default DivNnsResolver;