import React, { Component } from 'react';
import {Button,Input,Tag,Card} from 'antd';
import { async } from 'q';
import { any, number } from 'prop-types';
import {inject,observer} from 'mobx-react'
import NeoHelper from '../Tools/neoHelper';

// interface IProps{
//     title:string
//     scriptHash:any
// }
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
class DivNnsResolver extends React.Component<any,any> {
    // NNSh = new NNSHelper(this.props.store);
    
    state = {
        resData : {
            address:'', 
            TTL:''
        }     ,
        isExpired : false,
        isloading:true
    }  

    componentDidMount(){
        
    }

    getNNS_TTL = async () => {
        let invokeGetOwnerInfo =  {
            "scriptHash": this.props.store.scriptHash.nns_domaincenter,
            "operation": "getOwnerInfo",
            "arguments": [
                {"type":"ByteArray","value":await Teemo.NEO.NNS.getNamehashFromDomain(this.props.store.nns)},
            ],
            "network": this.props.store.network
        } 

        var nnsOwnerInfoData:InvokeScriptResp = await Teemo.NEO.invokeRead(JSON.parse(JSON.stringify(invokeGetOwnerInfo)) as InvokeReadInput)
        var stack0:any = nnsOwnerInfoData.stack[0].value;

        var ttl = stack0[3].value   
        ttl = await Teemo.NEO.TOOLS.getBigIntegerFromHexstr(ttl)
        ttl = Number(ttl)

        var isExpiredV = false;
        var nowtime = Number((new Date().getTime()/1000).toFixed(0))
        if(ttl<nowtime) isExpiredV = true

        ttl = NeoHelper.timetrans(ttl)

        this.setState({
            isExpired:isExpiredV
        })

        return ttl;
    }

    butGetInvokeReadClick = async (e:any) => {
        this.setState({isloading:true})

        let invokeRead_resolve =  {
            "scriptHash": this.props.store.scriptHash.nns_resolver,
            "operation": "resolve",
            "arguments": [
                {"type":"String","value":"addr"},
                {"type":"ByteArray","value":await Teemo.NEO.NNS.getNamehashFromDomain(this.props.store.nns)}
            ],
            "network": this.props.store.network
        }

        // invokeRead_resolve.arguments[1].value = await this.NNSh.namehash(this.props.store.nns)

        //console.log(this.invokeRead_resolve)
        var resolverData:InvokeScriptResp = await Teemo.NEO.invokeRead(JSON.parse(JSON.stringify(invokeRead_resolve)) as InvokeReadInput)       
        //console.log(resolverData);

        this.setState({
            resData:{
                address:resolverData.stack[0].value==''?'未映射':await Teemo.NEO.TOOLS.getStringFromHexstr(resolverData.stack[0].value), 
                TTL:await this.getNNS_TTL()
            },
            isloading:false                                          
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
            {/* <p>{this.state.isExpired.toString()}</p> */}
            <br />
            <Card
                hoverable = {true}
                loading = {this.state.isloading}
                title="NNS resolution result"
                style={{ width: 500 }}
                >
                <p><b>Address: </b>{this.state.resData.address}</p>
                <p><b>Expired: </b>{this.state.resData.TTL}</p>
                <Tag color="#f50" visible={this.state.isExpired}>已过期！！！</Tag>
            </Card>
            
            {/* <pre>{this.state.resData}</pre> */}
            
        </>
        )    
    }
  }

export default DivNnsResolver;