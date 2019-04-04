import React, { Component } from 'react';
import { BrowserRouter as Router, Route ,Link ,withRouter  } from 'react-router-dom'
import './App.css';
import { createStore } from 'redux'
import { Layout, Menu, Icon, notification, Input,Spin } from 'antd';
import { any } from 'prop-types';
import {observer,inject} from 'mobx-react';

// import Store from './store';
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

// const webSocketURL = 'ws://47.99.35.147:82/ws/testnet'

let div_defult = () =>{
  return <p>div_defult</p>
}

// let time = new Date().getTime()

// const store = new Store();

// @inject("store")
@observer
class App extends Component<any,any> {
  state = {
    menuID: 1
  }

  menuClick = (e:any) => {
    console.log('menu Click', e);

    //this.props.history.push("/nnscenter")

    this.setState({
      menuID: e.key
    });
  } 
  
  render() {
    // let div_main = null;
    // if (this.state.menuID == 1) {
    //   div_main = <DivDefault />
    // } 
    // else if (this.state.menuID == 2) {
    //   div_main = <DivNnsCenter />
    // }
    // else if (this.state.menuID == 3) {
    //   div_main = <DivNnsResolver />
    // }
    // else if (this.state.menuID == 4) {
    //   div_main = <DivAuction />
    // }
    // else if (this.state.menuID == 5) {
    //   div_main = <DivNnsCredit />
    // }
    // else {
    //   div_main = div_defult()
    // }

    return (
      <Router>
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
              <Link to='/'>
                <Icon type="file" />
                <span className="nav-text">Default Page</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to='/nnscenter'>
                <Icon type="file" />
                <span className="nav-text">NNS Center</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="3">
              <Link to='/nnsresolver'>
                <Icon type="file" />
                <span className="nav-text">NNS resolver</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="4">
              <Link to='/nnsauction'>
                <Icon type="file" />
                <span className="nav-text">NNS Auction</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="5">
              <Link to='/nnscredit'>
                <Icon type="file" />
                <span className="nav-text">NNS Credit</span>
              </Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }}>
            <h1>--- NNS Teemo Demo ---</h1>

          </Header>
          <Content style={{ margin: '24px 16px 0' }}>
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                {this.props.children}
                {/* {div_main} */}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            NNS ©2019 Created by NEL
          </Footer>
        </Layout>
      </Layout>
      </Router>
    );
  }
}

export default App;