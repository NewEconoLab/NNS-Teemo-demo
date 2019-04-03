import { async } from "q";

interface InvokeScriptRespStack{
    type: string,
    value: string
}
interface InvokeScriptResp{
    script: string,
    state: string,
    gas_consumed: string,
    stack: InvokeScriptRespStack[]
}




class NNSHelper {
    store:any
    invokeRead_nameHashArray:any
    constructor(store:any) {
        this.store = store
        this.invokeRead_nameHashArray = {
            "scriptHash": store.scriptHash.nns_domaincenter,
            "operation": "nameHashArray",
            "arguments": [
                {"type":"Array","value":[]},
            ],
            "network": store.network
        }
    }

    public namehash = async (nns:string) => {
        var namehash = ""

        this.invokeRead_nameHashArray.arguments[0].value = [];
        for (const str of nns.split('.').reverse()) {
            ((this.invokeRead_nameHashArray.arguments as Argument[])[0].value as Argument[]).push({type:"String",value:str});
        }
        //console.log(invokeRead_nameHashArray)
        //console.log(JSON.stringify(invokeRead_nameHashArray))
        var invokeResp:InvokeScriptResp = await Teemo.NEO.invokeRead(JSON.parse(JSON.stringify(this.invokeRead_nameHashArray)) as InvokeReadInput)
        //console.log(invokeResp)
        namehash = invokeResp.stack[0].value

        return namehash
    }
}

export default NNSHelper;