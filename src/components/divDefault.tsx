import {
    List, message, Avatar, Spin,
  } from 'antd';
import React, { Component } from 'react';
import {Button,Input} from 'antd';
import { async } from 'q';
import { any, number } from 'prop-types';
import NeoHelper from '../Tools/neoHelper'

import {inject,observer} from 'mobx-react';

@inject("store")
@observer
class DivDefault extends React.Component<any,any> {

    state = {
      resData : '{}'
    }

    render() {
      return ( 
        <> 
        <Spin tip='连接Teemo……' spinning={!this.props.store.isTeemoReady}>          
          <p>Default Page</p>
          <p>{this.props.store.address}</p>
          <p>{this.props.store.network}||{this.props.store.rpcUrl}||{this.props.store.webSocketURL}||isConnected:{this.props.store.isConnected.toString()}||{this.props.store.nns}</p>
          {/* <p>block: {this.props.blockHeight}</p>
          <p>notify: {this.props.notifyHeight}</p> */}
          <pre>{JSON.stringify(this.props.store.scriptHash,null,2)}</pre>          
          <div>
            <div className="demo-loading-container">
              <Spin />
              {/* <p>readyState: {this.props.store.socketReadyState}</p> */}
              <p>LastWSmsg: {this.props.store.lastWSmsgSec}s</p>
              <p>LastBlockTime: {NeoHelper.timetrans(this.props.store.lastBlockTime)}(before {NeoHelper.sec2HMS(parseInt((new Date().getTime()/1000 - this.props.store.lastBlockTime).toFixed(0)))})</p>
            </div>
            <List
              bordered = {true}
              dataSource={this.props.store.blockDatas}
              pagination={{
                onChange: (page) => {
                  console.log(page);
                },
                pageSize: 5,
              }}
              renderItem={(item: { id: number; blockHeight: number; timeDiff: number; blockTime:number; blockHash:string ; txCount:number }) => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    avatar={<Avatar src="https://neo-cdn.azureedge.net/images/favicon.png" />}
                    title={item.blockHeight}
                    description={item.blockHash + " tx:" + item.txCount}
                  />
                  <div>({item.timeDiff + 's'}){NeoHelper.timetrans(item.blockTime)}</div>
                </List.Item>
              )}
            ></List>
          </div>
        </Spin>
        </>
        )    
    }
  }

export default DivDefault;