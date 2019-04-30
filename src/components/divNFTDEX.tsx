import {
    List, message, Avatar, Spin, InputNumber, Switch, Modal,
  } from 'antd';
import React, { Component } from 'react';
import {Button,Input,Divider,Drawer,Popover,Card,Icon} from 'antd';
import { async, timeout } from 'q';
import { any, number } from 'prop-types';

import {inject,observer} from 'mobx-react';
import Item, { Meta } from 'antd/lib/list/Item';
import NeoHelper from '../Tools/neoHelper';

interface NFT{
    scriptHash:string,
    tokenID:number
}

@inject("store")
@observer
class DivNFTDEX extends React.Component<any,any> {
    state = {
        nFTs:[
            {
                scriptHash:'1dec715db5de0db0b2c54864aef32e5e30f0eddb',
                tokenID:2
            }
        ],
        nFTsHexStr:'',
        nFTsHexStrReverse:''
    }

    decimalToHex = (d:string|number) =>{ 
        var hex = Number(d).toString(16); 
        if (hex.length % 2 !=0) { 
            hex = "0" + hex; 
        } 
        return hex; 
    } 

    NFTs2HexStr = () =>{
        let hexStr = ''
        let nFTs = this.state.nFTs

        hexStr = hexStr + '80'
        hexStr = hexStr + this.decimalToHex(nFTs.length)

        nFTs.forEach(nFT => {
            hexStr = hexStr + '8002'
            hexStr = hexStr + '00'
            hexStr = hexStr + this.decimalToHex((nFT.scriptHash.length/2))
            hexStr = hexStr + NeoHelper.hexReverse(nFT.scriptHash)
            hexStr = hexStr + '00'
            let tokenIDHexStr = this.decimalToHex(nFT.tokenID)
            hexStr = hexStr + this.decimalToHex(tokenIDHexStr.length/2)
            hexStr = hexStr + NeoHelper.hexReverse(tokenIDHexStr)
        });

        this.setState({
            nFTsHexStr:hexStr,
            nFTsHexStrReverse:NeoHelper.hexReverse(hexStr)
        })
    }

    render() {
        return (
            <>
            <Button type="primary" onClick={this.NFTs2HexStr}>获取NFT组HexStr</Button>
            <p>{this.state.nFTsHexStr}</p>
            <p>{this.state.nFTsHexStrReverse}</p>
            </>
        )
    }
}
export default DivNFTDEX;