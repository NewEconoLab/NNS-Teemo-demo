import {observer} from 'mobx-react';
import React, {Component} from 'react';

import NeoHelper from '../Tools/neoHelper'

@observer
class MobxTest extends Component<any,any> {
    render() {
        return (
            <div>
                {/* <pre>{JSON.stringify(this.props.store.socketMsgs,null,2)}</pre> */}
                <p>LastWSmsg: {this.props.store.lastWSmsgSec}s</p>
                <p>LastBlockTime: {NeoHelper.timetrans(this.props.store.lastBlockTime)}(before {NeoHelper.sec2HMS(parseInt((new Date().getTime()/1000 - this.props.store.lastBlockTime).toFixed(0)))})</p>
                <pre>{JSON.stringify(this.props.store.blockData,null,2)}</pre>
                <ul>
                    {this.props.store.unfinishedTodos.map((todo: { title: string, done:boolean }, index: number) => <li key={`list-${index}`} onClick={()=>{
                        this.props.store.isShow(index)
                    }}>{todo.title}</li>)}
                </ul>
                <div>
                    <input type="button" onClick={() => {
                        this.props.store.socketInit('ws://47.99.35.147:82/ws/testnet')
                        // this.props.store.changeTodoTitle({
                        //     index: 0,
                        //     title: "修改111后的todo标题",
                        //     done: !this.props.store.todos[0].done
                        // });
                    }} value="点击我"/>
                </div>
            </div>
        )
    }
}

export default MobxTest