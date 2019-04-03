import {
    List, message, Avatar, Spin,
  } from 'antd';
import React, { Component } from 'react';
import {observer} from 'mobx-react';
import {Button,Input} from 'antd';
import { async } from 'q';
import { any, number } from 'prop-types';
import NeoHelper from '../Tools/neoHelper'
import NNSHelper from '../Tools/nnsHelper'

@observer
class DivDefault extends React.Component<any,any> {
    NNSh = new NNSHelper(this.props.store.scriptHash);

    state = {
      resData : '{}'
    }

    render() {
      return ( 
        <>           
            <p>{this.props.title}</p>
            <p>{this.props.store.address}</p>
            <p>{this.props.store.network}</p>
            <p>{this.props.store.nns}</p>
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
            renderItem={(item: { id: number; blockHeight: number; timeDiff: number; blockTime:number; blockHash:string }) => (
              <List.Item key={item.id}>
                <List.Item.Meta
                  avatar={<Avatar src="https://neo-cdn.azureedge.net/images/favicon.png" />}
                  title={item.blockHeight}
                  description={item.blockHash}
                />
                <div>({item.timeDiff + 's'}){NeoHelper.timetrans(item.blockTime)}</div>
              </List.Item>
            )}
          ></List>
        </div>
        </>
        )    
    }
  }

export default DivDefault;