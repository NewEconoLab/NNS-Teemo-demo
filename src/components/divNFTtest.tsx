import {
    List, message, Avatar, Spin, InputNumber,
  } from 'antd';
import React, { Component } from 'react';
import {Button,Input,Divider,Drawer,Popover,Card,Icon} from 'antd';
import { async, timeout } from 'q';
import { any, number } from 'prop-types';

import {inject,observer} from 'mobx-react';
import Item, { Meta } from 'antd/lib/list/Item';

const { TextArea } = Input;

@inject("store")
@observer
class DivNFTtest extends React.Component<any,any> {
    state={
        NFTscripthash:this.props.store.scriptHash.NEL_NFT_Test,
        resData : '{}',
        name:'',
        symbol:'',
        isOpen:'',
        supportedStandards:'',
        totalSupply:0,
        balanceOf:0,
        newToken:{
            tokenID:0,
            owner:'A*************',
            properties:'Look at my eyes 0',
            URI:'https://nel-test.oss-cn-hangzhou.aliyuncs.com/kwysxs.gif',
            rwProperties:JSON.stringify({created_at:new Date().getTime(),cat_name:"cat 0"})
        },
        tempToken:{
            tokenID:0,
            allowance:'',
            ownerOf:'',
            properties:'',
            rwProperties:'',
            token:'',
            uri:'',
            tokenData:''
        },
        tokens:[{
            tokenID:0,
            allowance:'',
            ownerOf:'',
            properties:'',
            rwProperties:'',
            token:'',
            uri:'',
            tokenData:''
        }],
        tokenIDsOfOwner:'{}',
        addr_from:'ASBhJFN3XiDu38EdEQyMY3N2XwGh1gd5WW',
        addr_to:'AeaWf2v7MHGpzxH4TtBAu5kJRp5mRq2DQG',
        tokenID:1,
        reqDataWrite:'{}',
        resDataWrite:'{}',
        loadingW:false,
        loadingR:true,
        drawerVisible:false 
    }

    componentDidMount(){
        //this.state.NFTscripthash = this.props.store.scriptHash.NFT_test_O3Foundry

        window.addEventListener ("newBlockEvent", this.doOnEvent, false)

        if(this.props.store.isTeemoReady){
            this.getNFTinfos()
        }
    }

    componentWillUnmount(){
        window.removeEventListener("newBlockEvent", this.doOnEvent, false);
    }

    
    doOnEvent = (e:any) =>{
        console.log('newBlockEvent',e)
        if(e.detail.txidIndex > -1){
            this.getNFTinfos()
        }   
    }

    getNFTinfos = async ()=>{
        let input = {
            scriptHash: this.state.NFTscripthash,
            operation: "",
            arguments: [],
            network: this.props.store.network
        }

        let inputs = {group:[{}]}
        inputs.group.pop()

        let operations = ['name','symbol','supportedStandards','totalSupply','isOpen']

        operations.forEach(operation => {
            input.operation = operation
            inputs.group.push(JSON.parse(JSON.stringify(input)))
        });

        //console.log(JSON.stringify(inputs,null,2))

        let result:any = await Teemo.NEO.invokeReadGroup(JSON.parse(JSON.stringify(inputs))) as InvokeReadGroup

        var NFTDataArray = [{
            tokenID:0,
            allowance:'',
            ownerOf:'',
            properties:'',
            rwProperties:'',
            token:'',
            uri:''
        }]

        if(NFTDataArray[0].tokenID == 0 ) NFTDataArray.shift()
        //if(NFTDataArray.length>=50) NFTDataArray.pop()

        let totalSupply = parseInt('0x' + result.stack[3].value)
        //console.log(totalSupply)

        for (var i=1;i<=totalSupply;i++)
        {
            let tokenResult =await this.getTokenInfo(i)
            NFTDataArray.push(tokenResult)
            if(i>=30) break;
        }
        
        // result = result.stack[0].value
        // result = NeoHelper.hexToString(result)
        // console.log(result)
        this.setState({
            // resData:JSON.stringify(result,null,2),
            name:await Teemo.NEO.TOOLS.getStringFromHexstr(result.stack[0].value),
            symbol:await Teemo.NEO.TOOLS.getStringFromHexstr(result.stack[1].value),
            supportedStandards:await Teemo.NEO.TOOLS.getStringFromHexstr(result.stack[2].value[0].value),//.replace('80010006','')),
            totalSupply:totalSupply,
            isOpen:result.stack[4].value,
            tokens:NFTDataArray,
            loadingR:false
        })

        this.getBalanceOf()
        this.getTokensOfOwner()
        this.getTokenInfo(this.state.tokenID)
    }

    getTokenInfo=async (tokenID:number)=>{
        let input = {
            scriptHash: this.state.NFTscripthash,
            operation: "",
            arguments: [{type:"Integer",value:tokenID}],
            network: this.props.store.network
        }

        let inputs = {group:[{}]}
        inputs.group.pop()
        let operations = ['allowance','ownerOf','properties','rwProperties','token','uri','token']
        operations.forEach(operation => {
            input.operation = operation
            inputs.group.push(JSON.parse(JSON.stringify(input)))
        });

        let result:any = await Teemo.NEO.invokeReadGroup(JSON.parse(JSON.stringify(inputs))) as InvokeReadGroup

        //console.log(JSON.stringify(result,null,2))

        let allowanceStr = result.stack[0].value
        if(allowanceStr.length>0){
            let allowance1 = allowanceStr.substr(0,40)
            if(allowance1.length>0) allowance1 = await Teemo.NEO.TOOLS.getAddressFromScriptHash(allowance1)
            let allowance2 = allowanceStr.substr(40)
            if(allowance2.length>0) allowance2 = await Teemo.NEO.TOOLS.getAddressFromScriptHash(allowance2)
            allowanceStr = allowance1 + " >>> " + allowance2
        }

        this.setState({
            tempToken:{
                tokenID:tokenID,
                allowance:allowanceStr,// + "|" + allowance1 + "|" + allowance2,
                ownerOf:await Teemo.NEO.TOOLS.getAddressFromScriptHash(result.stack[1].value),
                properties:await Teemo.NEO.TOOLS.getStringFromHexstr(result.stack[2].value),
                rwProperties:await Teemo.NEO.TOOLS.getStringFromHexstr(result.stack[3].value),
                token:JSON.stringify(result.stack[4].value),
                uri:await Teemo.NEO.TOOLS.getStringFromHexstr(result.stack[5].value),
                tokenData: result.stack[6].value
            }
        })

        return {
            tokenID:tokenID,
            allowance:allowanceStr,// + "|" + allowance1 + "|" + allowance2,
            ownerOf:await Teemo.NEO.TOOLS.getAddressFromScriptHash(result.stack[1].value),
            properties:await Teemo.NEO.TOOLS.getStringFromHexstr(result.stack[2].value),
            rwProperties:await Teemo.NEO.TOOLS.getStringFromHexstr(result.stack[3].value),
            token:result.stack[4].value,
            uri:await Teemo.NEO.TOOLS.getStringFromHexstr(result.stack[5].value),
            tokenData: result.stack[6].value
        }
    }

    getBalanceOf = async () =>{
        let input = {
            scriptHash: this.state.NFTscripthash,
            operation: "balanceOf",
            arguments: [{"type":"Address","value":this.props.store.address}],
            network: this.props.store.network
        }

        let result:any = await Teemo.NEO.invokeRead(JSON.parse(JSON.stringify(input))) as InvokeReadInput

        this.setState({
            // resData:JSON.stringify(result,null,2),
            balanceOf:result.stack[0].value
        })
    }

    getTokensOfOwner = async () =>{
        let input = {
            scriptHash: this.state.NFTscripthash,
            operation: "tokenIDsOfOwner",
            arguments: [
                {"type":"Address","value":this.props.store.address},
                // {"type":"Integer","value":1}
            ],
            network: this.props.store.network
        }

        let result:any = await Teemo.NEO.invokeRead(JSON.parse(JSON.stringify(input))) as InvokeReadInput

        this.setState({
            //resData:JSON.stringify(result,null,2)
            tokenIDsOfOwner:JSON.stringify(result,null,2)
        })
    }

    doInvoke = async (input:any) =>{
        console.log(JSON.stringify(input,null,2))

        this.setState({
            loadingW:true                                
        });

        var resp = await Teemo.NEO.invoke(JSON.parse(JSON.stringify(input)) as InvokeArgs)

        this.props.store.addTxidSended(resp.txid)
        this.setState({
            reqDataWrite:JSON.stringify(input,null,2),
            resDataWrite:JSON.stringify(resp, null, 2),
            loadingW:false,
            loadingR:true                               
        })
    }

    doMintToken = async () =>{
        let tokenID = this.state.totalSupply + 1

        let invoke_doMintToken =  {
            "scriptHash": this.state.NFTscripthash,
            "operation": "mintToken",
            "arguments": [
                {"type":"Address","value":this.props.store.address},//owner 0
                //{"type":"Integer","value":tokenID},//tokenID 1
                {"type":"String","value":this.state.newToken.properties},//properties 2
                {"type":"String","value":this.state.newToken.URI},//URI 3 
                {"type":"String","value":this.state.newToken.rwProperties}//rwProperties 4
            ],
            "fee":"0",
            "description":"增发新NFT",
            "network": this.props.store.network
        }

        this.doInvoke(invoke_doMintToken)
    }

    doModifyURI = async() =>{
        let invoke_doModifyURI = {
            "scriptHash": this.state.NFTscripthash,
            "operation": "modifyURI",
            "arguments": [
                {"type":"Integer","value":this.state.tempToken.tokenID},//tokenID 1
                {"type":"String","value":this.state.tempToken.uri},//URI 3 
            ],
            "fee":"0",
            "description":"修改NFT URI",
            "network": this.props.store.network
        }

        this.doInvoke(invoke_doModifyURI)
    }

    doSetRWProperties = async() =>{
        let invoke_doSetRWProperties = {
            "scriptHash": this.state.NFTscripthash,
            "operation": "setRWProperties",
            "arguments": [
                {"type":"Integer","value":this.state.tempToken.tokenID},//tokenID 1
                {"type":"String","value":this.state.tempToken.rwProperties},//URI 3 
            ],
            "fee":"0",
            "description":"修改NFT 可变属性",
            "network": this.props.store.network
        }

        this.doInvoke(invoke_doSetRWProperties)
    }

    doApprove = async() =>{
        let invoke_doApprove =  {
            "scriptHash": this.state.NFTscripthash,
            "operation": "approve",
            "arguments": [
                //{"type":"Address","value":this.props.store.address},//owner 0
                {"type":"Address","value":this.state.addr_to},//t_spender 1
                {"type":"Integer","value":this.state.tokenID},//t_id 2
                {"type":"Boolean","value":false}//revoke 3
            ],
            "fee":"0",
            "description":"授权NFT处置权",
            "network": this.props.store.network
        }

        this.doInvoke(invoke_doApprove)
    }

    doApproveRevoke = async() =>{
        let invoke_doApprove =  {
            "scriptHash": this.state.NFTscripthash,
            "operation": "approve",
            "arguments": [
                //{"type":"Address","value":this.props.store.address},//owner 0
                {"type":"Address","value":this.state.addr_to},//t_spender 1
                {"type":"Integer","value":this.state.tokenID},//t_id 2
                {"type":"Boolean","value":true}//revoke 3
            ],
            "fee":"0",
            "description":"撤销授权NFT处置权",
            "network": this.props.store.network
        }

        this.doInvoke(invoke_doApprove)
    }

    doTransferFrom = async() =>{
        let invoke_doTransferFrom =  {
            "scriptHash": this.state.NFTscripthash,
            "operation": "transferFrom",
            "arguments": [
                //{"type":"Address","value":this.props.store.address},//t_spender 0
                //{"type":"Address","value":this.state.addr_from},//t_from 1
                {"type":"Address","value":this.state.addr_to},//t_to 2
                {"type":"Integer","value":this.state.tokenID}//tokenID 3
            ],
            "fee":"0",
            "description":"已授权NFT处置权的转移",
            "network": this.props.store.network
        }

        this.doInvoke(invoke_doTransferFrom)
    }

    doTransfer =()=>{
        let invoke_doTransfer = {
            "scriptHash": this.state.NFTscripthash,
            "operation": "transfer",
            "arguments": [
                // {"type":"Address","value":this.props.store.address},//t_spender 0
                // {"type":"Address","value":this.state.addr_from},//t_from 1
                {"type":"Address","value":this.state.addr_to},//t_to 0
                {"type":"Integer","value":this.state.tokenID}//tokenID 1
            ],
            "fee":"0",
            "description":"无授权NFT转移",
            "network": this.props.store.network
        }

        this.doInvoke(invoke_doTransfer)
    } 

    viewTokenContent =(index:number)=>{
        if(this.state.tokens[0].tokenID != 0 && index>0){
            // index--
            let token = this.state.tempToken// this.state.tokens[index]
    
            return (
                <div>
                    <Card
                        style={{ width: 350 }}
                        cover={<img alt="URI" src={token.uri} />}
                        actions={[<Icon type="link" onClick={this.doModifyURI} />, <Icon type="edit" onClick={this.doSetRWProperties}/>]}
                    >
                        <Meta
                        avatar={<Avatar src="http://erc721.org/assets/img/721_cover.gif" />}
                        title={"tokenID: " + token.tokenID}
                        description={token.properties}
                        />
                        <p>{token.ownerOf}</p>
                        <TextArea value={token.uri} autosize onChange={(e)=>{token.uri=e.target.value; this.setState({tempToken:token})}}></TextArea>
                        <TextArea value={token.rwProperties} autosize onChange={(e)=>{token.rwProperties=e.target.value; this.setState({tempToken:token})}}></TextArea>
                    </Card>
                </div>
            )
        }
        else{return (<div></div>)}
    } 

    doMintTokenContent =()=>{
        return (
            <div>
                <img src={this.state.newToken.URI}></img>
            </div>
        )
    } 

    render() {
        return (
        <div>
            <p>NFT test-{this.state.NFTscripthash}</p>
            <Input placeholder="输入地址" onChange={(e)=>{this.props.store.updateAddress(e.target.value)}} value={this.props.store.address}/>
            <Input placeholder="输入地址from" onChange={(e)=>{this.setState({addr_from:e.target.value})}} defaultValue={this.state.addr_from}/>
            <Input placeholder="输入地址to" onChange={(e)=>{this.setState({addr_to:e.target.value})}} defaultValue={this.state.addr_to}/>
            <Popover content={this.viewTokenContent(this.state.tokenID)} title="Token" trigger="click">
                <InputNumber min={1} max={this.state.totalSupply} step={1} onChange={async (e)=>{this.setState({tokenID:e});await this.getTokenInfo(e as number)}} defaultValue={this.state.tokenID}/>
            </Popover>
            <Button onClick={this.getNFTinfos} type="primary">刷新数据</Button>
            <Divider type="vertical" />
            <Button onClick={()=>{this.getNFTinfos();this.setState({drawerVisible: !this.state.drawerVisible})}} >铸造新币</Button>
            <Drawer
                title="铸造新币"
                height='300'
                placement='top'
                closable={false}
                onClose={()=>{this.setState({drawerVisible: false})}}
                visible={this.state.drawerVisible}
                >
                <p>owner：{this.props.store.address}</p>
                <p>tokenID：{this.state.totalSupply + 1}</p>
                <Input placeholder="输入properties" onChange={(e)=>{let NT = this.state.newToken;NT.properties=e.target.value;this.setState({newToken:NT})}} defaultValue={this.state.newToken.properties}/>
                <Popover content={this.doMintTokenContent()} title="URI" trigger="hover">
                    <Input placeholder="输入URI" onChange={(e)=>{let NT = this.state.newToken;NT.URI=e.target.value;this.setState({URI:NT})}} defaultValue={this.state.newToken.URI}/>
                </Popover>
                <Input placeholder="输入rwProperties" onChange={(e)=>{let NT = this.state.newToken;NT.rwProperties=e.target.value;this.setState({rwProperties:NT})}} defaultValue={this.state.newToken.rwProperties}/>
                <Button onClick={this.doMintToken} type="primary">铸造</Button>
            </Drawer>
            <Divider type="vertical" />
            <Button onClick={this.doApprove} >授权处置权</Button>
            <Button onClick={this.doApproveRevoke} >撤销处置权</Button>
            <Button onClick={this.doTransferFrom} >已授权的所有权转移</Button>
            <Divider type="vertical" />
            <Button onClick={this.doTransfer} >无授权转移</Button>
            <pre>{this.state.resData}</pre>
            <Spin tip='请求中' spinning={this.state.loadingW}>
                <pre>{this.state.resDataWrite}</pre>
            </Spin>
            <Spin tip='等待共识中' spinning={this.state.loadingR}>
                <p>name:{this.state.name}</p>
                <p>symbol:{this.state.symbol}</p>
                <p>supportedStandards:{this.state.supportedStandards}</p>
                <p>totalSupply:{this.state.totalSupply}</p>
                <p>isOpen:{this.state.isOpen}</p>
                <p>balanceOf({this.props.store.address}):{this.state.balanceOf}</p>
                <List
                itemLayout="vertical"
                bordered = {true}
                dataSource={this.state.tokens}
                pagination={{
                    onChange: (page) => {
                    console.log(page);
                    },
                    pageSize: 5,
                }}
                renderItem={(item: { 
                    tokenID:number,
                    allowance:string,
                    ownerOf:string,
                    properties:string,
                    rwProperties:string,
                    token:string,
                    uri:string,
                    tokenData:string
                }) => (
                    <List.Item 
                        key={item.tokenID}
                        extra={<img width={272} alt="NFT URI" src={item.uri} />}
                    >
                    <List.Item.Meta
                        avatar={<Avatar src='http://erc721.org/assets/img/721_cover.gif' />}
                        title={'tokenID: ' + item.tokenID}
                        description={'owner: ' + item.ownerOf}//{item.token}
                    />
                    {/* <div className="wrap"> */}
                    <div>
                        allowance:{item.allowance}
                        <br />
                        properties:{item.properties}
                        <br />
                        rwProperties:{item.rwProperties}
                        {/* <br />
                        tokenData:<pre>{JSON.stringify(item.tokenData,null,2)}</pre> */}
                    </div>
                    </List.Item>
                )}
                ></List>
            </Spin>
        </div>    
        )
    }

}

export default DivNFTtest;