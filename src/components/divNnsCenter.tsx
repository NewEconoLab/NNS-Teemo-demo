import React, { Component } from 'react';
import {Button,Input, Card, Tag} from 'antd';
import { async } from 'q';
import { any, number } from 'prop-types';
import {inject,observer} from 'mobx-react';
import NeoHelper from '../Tools/neoHelper';

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
        resData : {
            owner:'',
            register:'',
            resolver:'',
            TTL:'',
            parentOwner:'',
            domain:'',
            parenthash:'',
            root:'',
        },
        isExpired:false,
        isloading:true
    }

    componentDidMount(){
        
    }

    butGetInvokeReadClick = async (e:any) => {
        this.setState({isloading:true})

        console.log(await Teemo.NEO.NNS.getNamehashFromDomain(this.props.store.nns))
        let invokeGetOwnerInfo =  {
            "scriptHash": this.props.store.scriptHash.nns_domaincenter,
            "operation": "getOwnerInfo",
            "arguments": [
                {"type":"ByteArray","value":await Teemo.NEO.NNS.getNamehashFromDomain(this.props.store.nns)},
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
        nnsOwnerInfo.domain =await Teemo.NEO.TOOLS.getStringFromHexstr(nnsOwnerInfo.domain)
        var ttl = Number(await Teemo.NEO.TOOLS.getBigIntegerFromHexstr(nnsOwnerInfo.TTL))
        nnsOwnerInfo.TTL = NeoHelper.timetrans(ttl)
        if(nnsOwnerInfo.owner != '') nnsOwnerInfo.owner = await Teemo.NEO.TOOLS.getAddressFromScriptHash(nnsOwnerInfo.owner)
        if(nnsOwnerInfo.register != '') nnsOwnerInfo.register = await Teemo.NEO.TOOLS.reverseHexstr(nnsOwnerInfo.register)
        if(nnsOwnerInfo.resolver != '') nnsOwnerInfo.resolver = await Teemo.NEO.TOOLS.reverseHexstr(nnsOwnerInfo.resolver)
        if(nnsOwnerInfo.parentOwner != '') nnsOwnerInfo.parentOwner = await Teemo.NEO.TOOLS.getAddressFromScriptHash(nnsOwnerInfo.parentOwner)

        var isExpiredV = false;
        var nowtime = Number((new Date().getTime()/1000).toFixed(0))
        if(Number(ttl)<nowtime) isExpiredV = true

        this.setState({
            resData: nnsOwnerInfo,
            isExpired:isExpiredV,
            isloading:false                          
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
            <Card
                hoverable = {true}
                loading = {this.state.isloading}
                title="NNS OwnerInfo"
                style={{ width: 700 }}
                >
                <p><b>owner: </b>{this.state.resData.owner}</p>
                <p><b>register scripthash: </b>{this.state.resData.register}</p>
                <p><b>resolver scripthash: </b>{this.state.resData.resolver}</p>
                <p><b>TTL: </b>{this.state.resData.TTL}</p>
                <p><b>parentOwner: </b>{this.state.resData.parentOwner}</p>
                <p><b>domain: </b>{this.state.resData.domain}</p>
                <p><b>parenthash: </b>{this.state.resData.parenthash}</p>
                <p><b>root: </b>{this.state.resData.root}</p>
                <Tag color="#f50" visible={this.state.isExpired}>已过期！！！</Tag>
            </Card>
            {/* <pre>{this.state.resData}</pre> */}
        </>
        )    
    }
  }

export default DivNnsCenter;