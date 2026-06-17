import{useState,useRef}from'react'
  type Method="GET"|"POST"|"PUT"|"PATCH"|"DELETE"
  interface Header{key:string;value:string}
  interface Req{method:Method;url:string;body:string;headers:Header[];ts:number;status:number;time:number}
  const MC:{[m in Method]:string}={GET:"#22c55e",POST:"#0ea5e9",PUT:"#f59e0b",PATCH:"#a855f7",DELETE:"#ef4444"}
  export default function App(){
    const[method,setMethod]=useState<Method>("GET")
    const[url,setUrl]=useState("https://jsonplaceholder.typicode.com/posts/1")
    const[body,setBody]=useState("")
    const[headers,setHeaders]=useState<Header[]>([{key:"Content-Type",value:"application/json"}])
    const[response,setResponse]=useState<{status:number;body:string;headers:Record<string,string>;time:number}|null>(null)
    const[loading,setLoading]=useState(false)
    const[history,setHistory]=useState<Req[]>([])
    const[tab,setTab]=useState<"body"|"headers"|"response">("body")
    const abortRef=useRef<AbortController|null>(null)
    const send=async()=>{
      if(!url.trim())return
      abortRef.current?.abort();abortRef.current=new AbortController()
      setLoading(true);setTab("response");const t0=Date.now()
      try{
        const h:HeadersInit={}
        headers.filter(h2=>h2.key&&h2.value).forEach(h2=>{h[h2.key]=h2.value})
        const opts:RequestInit={method,headers:h,signal:abortRef.current.signal}
        if(body&&method!=="GET")opts.body=body
        const res=await fetch(url,opts)
        const elapsed=Date.now()-t0
        const respHeaders:Record<string,string>={}
        res.headers.forEach((v,k)=>{respHeaders[k]=v})
        const text=await res.text()
        let pretty=text
        try{pretty=JSON.stringify(JSON.parse(text),null,2)}catch{}
        setResponse({status:res.status,body:pretty,headers:respHeaders,time:elapsed})
        setHistory(h3=>[{method,url,body,headers,ts:Date.now(),status:res.status,time:elapsed},...h3.slice(0,9)])
      }catch(e){if((e as Error).name!=="AbortError"){setResponse({status:0,body:"Error: "+(e as Error).message,headers:{},time:Date.now()-t0})}}
      setLoading(false)
    }
    const addHeader=()=>setHeaders(h=>[...h,{key:"",value:""}])
    const upd=(i:number,k:"key"|"value",v:string)=>setHeaders(h=>h.map((x,j)=>j===i?{...x,[k]:v}:x))
    const SC=(s:number)=>s>=200&&s<300?"#22c55e":s>=300&&s<400?"#f59e0b":s>=400?"#ef4444":"#94a3b8"
    return(
      <div style={{minHeight:"100vh",fontFamily:"Inter,system-ui,sans-serif",color:"#e2e8f0",padding:"2rem"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <h1 style={{fontWeight:800,fontSize:"1.75rem",marginBottom:"1.5rem",color:"#f8fafc"}}>🔧 API Tester</h1>
          <div style={{display:"flex",gap:"0.5rem",marginBottom:"1rem",flexWrap:"wrap"}}>
            {(["GET","POST","PUT","PATCH","DELETE"] as Method[]).map(m=><button key={m} onClick={()=>setMethod(m)} style={{padding:"0.35rem 0.75rem",background:method===m?MC[m]:"#1e293b",color:method===m?"#fff":"#94a3b8",border:"none",borderRadius:6,cursor:"pointer",fontWeight:700,fontSize:"0.8rem"}}>{m}</button>)}
          </div>
          <div style={{display:"flex",gap:"0.75rem",marginBottom:"1rem"}}>
            <input value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="https://api.example.com/endpoint" style={{flex:1,background:"#111827",border:"1px solid #334155",borderRadius:8,padding:"0.65rem 1rem",color:"#e2e8f0",outline:"none",fontSize:"0.9rem",fontFamily:"JetBrains Mono,monospace"}}/>
            <button onClick={send} disabled={loading} style={{padding:"0.65rem 1.5rem",background:loading?"#1e293b":"#0ea5e9",color:loading?"#475569":"#fff",border:"none",borderRadius:8,cursor:loading?"not-allowed":"pointer",fontWeight:700,fontSize:"0.9rem",minWidth:90}}>{loading?"...":"Send"}</button>
          </div>
          <div style={{display:"flex",gap:"0.5rem",marginBottom:"0.75rem"}}>
            {(["body","headers","response"] as const).map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:"0.3rem 0.9rem",background:tab===t?"#1e40af":"#1e293b",color:tab===t?"#93c5fd":"#94a3b8",border:"none",borderRadius:6,cursor:"pointer",fontWeight:600,fontSize:"0.82rem",textTransform:"capitalize"}}>{t}{t==="response"&&response?(" · "+(response.status||"err")):""}
            </button>)}
          </div>
          {tab==="body"&&<textarea value={body} onChange={e=>setBody(e.target.value)} rows={8} placeholder='{"key": "value"}' style={{width:"100%",background:"#111827",border:"1px solid #334155",borderRadius:8,padding:"0.75rem",color:"#e2e8f0",outline:"none",fontFamily:"JetBrains Mono,monospace",fontSize:"0.82rem",resize:"vertical"}}/>}
          {tab==="headers"&&(
            <div style={{background:"#111827",border:"1px solid #1e293b",borderRadius:8,padding:"1rem"}}>
              {headers.map((h,i)=>(
                <div key={i} style={{display:"flex",gap:"0.5rem",marginBottom:"0.5rem"}}>
                  <input value={h.key} onChange={e=>upd(i,"key",e.target.value)} placeholder="Header name" style={{flex:1,background:"#0f172a",border:"1px solid #334155",borderRadius:6,padding:"0.4rem 0.6rem",color:"#e2e8f0",outline:"none",fontSize:"0.82rem"}}/>
                  <input value={h.value} onChange={e=>upd(i,"value",e.target.value)} placeholder="Value" style={{flex:2,background:"#0f172a",border:"1px solid #334155",borderRadius:6,padding:"0.4rem 0.6rem",color:"#e2e8f0",outline:"none",fontSize:"0.82rem"}}/>
                  <button onClick={()=>setHeaders(h2=>h2.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:"1rem"}}>×</button>
                </div>
              ))}
              <button onClick={addHeader} style={{padding:"0.35rem 0.9rem",background:"#1e293b",color:"#94a3b8",border:"1px solid #334155",borderRadius:6,cursor:"pointer",fontSize:"0.82rem"}}>+ Add Header</button>
            </div>
          )}
          {tab==="response"&&response&&(
            <div style={{background:"#111827",border:"1px solid #1e293b",borderRadius:8,overflow:"hidden"}}>
              <div style={{display:"flex",gap:"1rem",alignItems:"center",padding:"0.6rem 1rem",borderBottom:"1px solid #1e293b"}}>
                <span style={{fontWeight:700,color:SC(response.status),fontSize:"1rem"}}>{response.status||"Error"}</span>
                <span style={{color:"#475569",fontSize:"0.82rem"}}>{response.time}ms</span>
              </div>
              <pre style={{padding:"1rem",margin:0,overflowX:"auto",fontSize:"0.78rem",fontFamily:"JetBrains Mono,monospace",color:"#86efac",lineHeight:1.7,maxHeight:380}}>{response.body}</pre>
            </div>
          )}
          {tab==="response"&&!response&&<div style={{padding:"3rem",textAlign:"center",color:"#475569",background:"#111827",borderRadius:8,border:"1px solid #1e293b"}}>Send a request to see the response</div>}
        </div>
      </div>
    )
  }