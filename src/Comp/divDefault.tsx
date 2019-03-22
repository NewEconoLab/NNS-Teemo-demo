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

class DivDefault extends React.Component<IProps,any> {
    NNSh = new NNSHelper(this.props.scriptHash);

    state = {
        resData : '{}',
        inputValueAddr : 'ASBhJFN3XiDu38EdEQyMY3N2XwGh1gd5WW',
        inputValueNns : 'qmz.test'
    }  

    componentDidMount(){
    }

    render() {
      return ( 
        <>
            <p>{this.props.title}</p>
            <p>{this.props.address}</p>
            <pre>{JSON.stringify(this.props.scriptHash,null,2)}</pre>
        </>
        )    
    }
  }

export default DivDefault;