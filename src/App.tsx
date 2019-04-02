import React, { Component } from 'react';
import './App.css';
import { createStore } from 'redux'
import { Layout, Menu, Icon, notification } from 'antd';
import { any } from 'prop-types';

import Store from './store';
import DivDefault from './components/divDefault';
import DivNnsCenter from './components/divNnsCenter';
import DivNnsResolver from './components/divNnsResolver';
import DivAuction from './components/divAuction';
import DivNnsCredit from './components/divNnsCredit';
import MobxTest from './components/mobxTest';
import { updateLocale } from 'moment';

import { observable ,autorun} from "mobx";
import { Socket } from 'dgram';
import Title from 'antd/lib/typography/Title';

const {
  Header, Content, Footer, Sider,
} = Layout;

const scriptHash = {
  nns_domaincenter : "348387116c4a75e420663277d9c02049907128c7",
  nns_resolver : "6e2aea28af9c5febea0774759b1b76398e3167f1",
  nns_auction:"5fd8c2aed0eec0fa103f6fba16748b453baf5b2e",
  nns_credit : "77bf387c9b5f2e2c33ef8507478b103285c55b11",
  NEP_5_CGAS:"74f2dc36a68fdc4682034178eb2220729231db76",
  NEP_5_NNC:"fc732edee1efdf968c23c20a9628eaa5a6ccb934"
}

const webSocketURL = 'ws://47.99.35.147:82/ws/testnet'

let div_defult = () =>{
  return <p>div_defult</p>
}

let time = new Date().getTime()

const store = new Store(webSocketURL);

class App extends Component {
  state = {
    menuID: 1,
    address : 'address',
    network : "network",
    teemoReady:false
  }

  componentWillMount(){
    this.init()
  }

  average = (arr:Array<any>) => {
    const nums = [].concat(...arr);
    return nums.reduce((acc, val) => acc + val, 0) / nums.length;
  };

  init=()=>{
    //console.log("this is init");
    
    window.addEventListener('Teemo.NEO.READY',async (data)=>{
      //console.log(this.state)
      console.log("inject READY ");
      notification.success({message:'Teemo',description:'Teemo.NEO.READY'})
      this.setState({
        address: (await Teemo.NEO.getAccount()).address,
        network: (await Teemo.NEO.getNetworks()).defaultNetwork,
        teemoReady:true                     
      }); 
      //console.log(this.state)
    })

    window.addEventListener('Teemo.NEO.NETWORK_CHANGED',(data:any)=>{
      console.log("NETWORK_CHANGED");
      console.log(data);
      this.setState({
        network: data.detail.defaultNetwork                      
      }); 
    })
  }

  menuClick = (e:any) => {
    console.log('menu Click', e);
    this.setState({
      menuID: e.key
    });
  } 
  
  render() {
    let div_main = null;
    if (this.state.menuID == 1) {
      div_main = <DivDefault store={store} title="default Page" address={this.state.address} network={this.state.network} scriptHash={scriptHash} teemoReady={this.state.teemoReady} />
    } 
    else if (this.state.menuID == 2) {
      div_main = <DivNnsCenter title="NNS Domain Center" scriptHash={scriptHash} />
    }
    else if (this.state.menuID == 3) {
      div_main = <DivNnsResolver title="NNS Resolver" scriptHash={scriptHash} />
    }
    else if (this.state.menuID == 4) {
      div_main = <DivAuction store={store} title="NNS Auction" address={this.state.address}  scriptHash={scriptHash} teemoReady={this.state.teemoReady} />
    }
    else if (this.state.menuID == 5) {
      div_main = <DivNnsCredit store={store} title="NNS Credit" address={this.state.address}  scriptHash={scriptHash} />
    }
    else {
      div_main = div_defult()
    }

    return (
      <Layout>
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          onBreakpoint={(broken) => { console.log(broken); }}
          onCollapse={(collapsed, type) => { console.log(collapsed, type); }}
        >
          <div className="logo" />
          <Menu onClick={this.menuClick}  theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1">
              <Icon type="file" />
              <span className="nav-text">Default Page</span>
            </Menu.Item>
            <Menu.Item key="2">
              <Icon type="file" />
              <span className="nav-text">NNS Center</span>
            </Menu.Item>
            <Menu.Item key="3">
              <Icon type="file" />
              <span className="nav-text">NNS resolver</span>
            </Menu.Item>
            <Menu.Item key="4">
              <Icon type="file" />
              <span className="nav-text">NNS Auction</span>
            </Menu.Item>
            <Menu.Item key="5">
              <Icon type="file" />
              <span className="nav-text">NNS Credit</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }}>
            <h1>--- NNS Teemo Demo ---</h1>
          </Header>
          <Content style={{ margin: '24px 16px 0' }}>
            {/* <MobxTest store={store}/> */}
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                {div_main}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            NNS ©2019 Created by NEL
          </Footer>
        </Layout>
      </Layout>
    );
  }
}

export default App;