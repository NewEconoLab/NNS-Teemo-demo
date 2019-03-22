import React, { Component } from 'react';
import './App.css';
import { Layout, Menu, Icon } from 'antd';
import { any } from 'prop-types';
import DivDefault from './Comp/divDefault';
import DivNnsCenter from './Comp/divNnsCenter';
import DivNnsResolver from './Comp/divNnsResolver';
import DivNnsCredit from './Comp/divNnsCredit';

const {
  Header, Content, Footer, Sider,
} = Layout;

const scriptHash = {
  nns_domaincenter : "348387116c4a75e420663277d9c02049907128c7",
  nns_resolver : "6e2aea28af9c5febea0774759b1b76398e3167f1",
  nns_credit : "77bf387c9b5f2e2c33ef8507478b103285c55b11"
}

let div_defult = () =>{
  return <p>div_defult</p>
}

class App extends Component {
  state = {
    menuID: 1,
    address : 'address'
  }

  componentDidMount(){
    this.init()
  }

  init=()=>{
    //console.log("this is init");
    
    window.addEventListener('Teemo.NEO.READY',async (data)=>{
      console.log("inject READY ");
      this.setState({
        address: (await Teemo.NEO.getAccount()).address                       
      });  
      //console.log(JSON.stringify(data.detail))
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
      div_main = <DivDefault title="default Page" address={this.state.address} scriptHash={scriptHash} />
    } 
    else if (this.state.menuID == 2) {
      div_main = <DivNnsCenter title="NNS Domain Center" scriptHash={scriptHash} />
    }
    else if (this.state.menuID == 3) {
      div_main = <DivNnsResolver title="NNS Resolver" scriptHash={scriptHash} />
    }
    else if (this.state.menuID == 4) {
      div_main = <DivNnsCredit title="NNS Credit" scriptHash={scriptHash} />
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
              <span className="nav-text">NNS Credit</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }} />
          <Content style={{ margin: '24px 16px 0' }}>
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