import {
    List, message, Avatar, Spin,
  } from 'antd';
import React, { Component } from 'react';
import {Button,Input} from 'antd';
import { async, timeout } from 'q';
import { any, number } from 'prop-types';
import NeoHelper from '../Tools/neoHelper'
import NNSHelper from '../Tools/nnsHelper'

import {inject,observer} from 'mobx-react';
import Item from 'antd/lib/list/Item';

@inject("store")
@observer
class DivNFTtest extends React.Component<any,any> {
    state={
        NFTscripthash:'',
        resData : '{}',
        name:'',
        symbol:'',
        supportedStandards:'',
        totalSupply:0,
        tokens:[{
            tokenID:0,
            allowance:'',
            ownerOf:'',
            properties:'',
            rwProperties:'',
            token:'',
            uri:''
        }]
    }

    componentDidMount(){
        this.state.NFTscripthash = this.props.store.scriptHash.NFT_test_HashPuppies
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

        let operations = ['name','symbol','supportedStandards','totalSupply']

        operations.forEach(operation => {
            input.operation = operation
            inputs.group.push(JSON.parse(JSON.stringify(input)))
        });

        console.log(JSON.stringify(inputs,null,2))

        let result:any = await Teemo.NEO.invokeReadGroup(JSON.parse(JSON.stringify(inputs))) as InvokeReadGroup

        var NFTDataArray = this.state.tokens

        if(NFTDataArray[0].tokenID == 0 ) NFTDataArray.shift()
        //if(NFTDataArray.length>=50) NFTDataArray.pop()

        let totalSupply = parseInt('0x' + result.stack[3].value)
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
            name:NeoHelper.hexToString(result.stack[0].value),
            symbol:NeoHelper.hexToString(result.stack[1].value),
            supportedStandards:NeoHelper.hexToString(result.stack[2].value),//.replace('80010006','')),
            totalSupply:parseInt('0x' + result.stack[3].value),
            tokens:NFTDataArray
        })
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
        let operations = ['allowance','ownerOf','properties','rwProperties','token','uri']
        operations.forEach(operation => {
            input.operation = operation
            inputs.group.push(JSON.parse(JSON.stringify(input)))
        });

        let result:any = await Teemo.NEO.invokeReadGroup(JSON.parse(JSON.stringify(inputs))) as InvokeReadGroup

        return {
            tokenID:tokenID,
            allowance:result.stack[0].value,
            ownerOf:await Teemo.NEO.getAddressFromScriptHash(NeoHelper.hexReverse(result.stack[1].value)),
            properties:NeoHelper.hexToString(result.stack[2].value),
            rwProperties:NeoHelper.hexToString(result.stack[3].value),
            token:result.stack[4].value,
            uri:NeoHelper.hexToString(result.stack[5].value) 
        }
    }

    render() {
        return (
        <div>
            <p>NFT test-{this.state.NFTscripthash}</p>
            <Button onClick={this.getNFTinfos}>刷新数据</Button>
            <pre>{this.state.resData}</pre>
            <p>name:{this.state.name}</p>
            <p>symbol:{this.state.symbol}</p>
            <p>supportedStandards:{this.state.supportedStandards}</p>
            <p>totalSupply:{this.state.totalSupply}</p>
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
                uri:string
              }) => (
                <List.Item 
                    key={item.tokenID}
                    extra={<img width={272} alt="NFT URI" src={item.uri} />}
                >
                  <List.Item.Meta
                    avatar={<Avatar src='https://neo-cdn.azureedge.net/images/favicon.png' />}
                    title={'tokenID: ' + item.tokenID}
                    description={'owner: ' + item.ownerOf}//{item.token}
                  />
                  <div className="wrap">
                    properties:{item.properties}
                    <br />
                    rwProperties:{item.rwProperties}
                  </div>
                </List.Item>
              )}
            ></List>
        </div>    
        )
    }

}

export default DivNFTtest;