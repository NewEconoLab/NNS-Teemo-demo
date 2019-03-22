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

let invokeRead_nameHashArray = {
    "scriptHash": "",
    "operation": "nameHashArray",
    "arguments": [
        {"type":"Array","value":[]},
    ],
    "network": "TestNet"
}


class NNSHelper {
    constructor(scriptHash:any) {
        invokeRead_nameHashArray.scriptHash = scriptHash.nns_domaincenter
    }

    public namehash = async (nns:string) => {
        var namehash = ""

        invokeRead_nameHashArray.arguments[0].value = [];
        for (const str of nns.split('.').reverse()) {
            ((invokeRead_nameHashArray.arguments as Argument[])[0].value as Argument[]).push({type:"String",value:str});
        }
        //console.log(invokeRead_nameHashArray)
        //console.log(JSON.stringify(invokeRead_nameHashArray))
        var invokeResp:InvokeScriptResp = await Teemmo.NEO.invokeRead(JSON.parse(JSON.stringify(invokeRead_nameHashArray)) as InvokeReadInput)
        //console.log(invokeResp)
        namehash = invokeResp.stack[0].value

        return namehash
    }
}

export default NNSHelper;