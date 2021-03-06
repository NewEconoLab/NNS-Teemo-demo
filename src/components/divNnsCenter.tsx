import React, { Component } from 'react';
import {Button,Input} from 'antd';
import { async } from 'q';
import { any, number } from 'prop-types';
import NeoHelper from '../Tools/neoHelper'
import NNSHelper from '../Tools/nnsHelper'
import {inject,observer} from 'mobx-react';

interface OwnerInfo
{
    owner:string//如果长度=0 表示没有初始化
    register : string 
    resolver: string ;
    TTL: string ;
    parentOwner: string ;//当此域名注册时，他爹的所有者，记录这个，则可以检测域名的爹变了
    domain: string ;//如果长度=0 表示没有初始化
    parenthash: string ;
    root: string ;//是不是根合约
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
class DivNnsCenter extends React.Component<any,any> {
    // NNSh = new NNSHelper(this.props.store); 

    state = {
        resData : '{}'
    }

    componentDidMount(){
        
    }

    butGetInvokeReadClick = async (e:any) => {
        let invokeGetOwnerInfo =  {
            "scriptHash": this.props.store.scriptHash.nns_domaincenter,
            "operation": "getOwnerInfo",
            "arguments": [
                {"type":"ByteArray","value":await new NNSHelper(this.props.store).namehash(this.props.store.nns)},
            ],
            "network": this.props.store.network
        } 

        // invokeGetOwnerInfo.arguments[0].value = await this.NNSh.namehash(this.props.store.nns)
        //console.log(JSON.stringify(invokeGetOwnerInfo,null,2))

        var nnsOwnerInfoData:InvokeScriptResp = await Teemo.NEO.invokeRead(JSON.parse(JSON.stringify(invokeGetOwnerInfo)) as InvokeReadInput)
        var stack0:any = nnsOwnerInfoData.stack[0].value;
        //console.log(JSON.stringify(nnsOwnerInfoData,null,2))
        var nnsOwnerInfo:OwnerInfo = {
            owner:stack0[0].value,
            register:stack0[1].value,
            resolver:stack0[2].value,
            TTL:stack0[3].value,
            parentOwner:stack0[4].value,
            domain:stack0[5].value,
            parenthash:stack0[6].value,
            root:stack0[7].value,
        }
        nnsOwnerInfo.domain = NeoHelper.hexToString(nnsOwnerInfo.domain)
        nnsOwnerInfo.TTL = NeoHelper.hex2TimeStr(nnsOwnerInfo.TTL)
        if(nnsOwnerInfo.owner != '') nnsOwnerInfo.owner = await Teemo.NEO.getAddressFromScriptHash(NeoHelper.byte2Hex(NeoHelper.hex2Byte(nnsOwnerInfo.owner).reverse()))
        this.setState({
            resData: JSON.stringify(nnsOwnerInfo, null, 2)                                 
        });

        //this.invokeRead(JSON.stringify(invokeRead3))
    }

    // handelChange(e:any){
    //     this.setState({
    //         inputValue:e.target.value
    //     })
    // }

    render() {
      return ( 
        <>
            <p>NNS Domain Center</p>
            {/* <Input id="NNSinput" placeholder="输入要查询的NSS域名" onChange={this.handelChange.bind(this)} defaultValue={this.state.inputValue}/> */}
            <Input placeholder="输入NSS域名" onChange={(e)=>{this.props.store.updateNNS(e.target.value)}} defaultValue={this.props.store.nns}/>
            <Button onClick={this.butGetInvokeReadClick} type="primary">获取NNS所有者信息</Button>
            <pre>{this.state.resData}</pre>
        </>
        )    
    }
  }

export default DivNnsCenter;