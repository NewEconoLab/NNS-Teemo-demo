import React, { Component } from 'react';
import './App.css';
import { createStore } from 'redux'
import { Layout, Menu, Icon, notification, Input } from 'antd';
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

const webSocketURL = 'ws://47.99.35.147:82/ws/testnet'

let div_defult = () =>{
  return <p>div_defult</p>
}

let time = new Date().getTime()

const store = new Store(webSocketURL);

class App extends Component {
  state = {
    menuID: 1,
    // address : 'address',
    // network : "network",
    // teemoReady:false
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

      store.updateAddress((await Teemo.NEO.getAccount()).address)
      store.updateNetwork((await Teemo.NEO.getNetworks()).defaultNetwork)

      // this.setState({
      //   address: (await Teemo.NEO.getAccount()).address,
      //   network: (await Teemo.NEO.getNetworks()).defaultNetwork,
      //   teemoReady:true                     
      // }); 
      //console.log(this.state)
    })

    window.addEventListener('Teemo.NEO.NETWORK_CHANGED',(data:any)=>{
      console.log("NETWORK_CHANGED");
      console.log(data);

      store.updateNetwork(data.detail.defaultNetwork)

      // this.setState({
      //   network: data.detail.defaultNetwork                      
      // }); 
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
      div_main = <DivDefault store={store} title="default Page" />
    } 
    else if (this.state.menuID == 2) {
      div_main = <DivNnsCenter store={store} title="NNS Domain Center" />
    }
    else if (this.state.menuID == 3) {
      div_main = <DivNnsResolver store={store} title="NNS Resolver" />
    }
    else if (this.state.menuID == 4) {
      div_main = <DivAuction store={store} title="NNS Auction" />
    }
    else if (this.state.menuID == 5) {
      div_main = <DivNnsCredit store={store} title="NNS Credit" />
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