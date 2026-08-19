import{b as N,a as M,r as c,j as t}from"./index-B_N2oUID.js";function F(a,o){const e=(o||"moderate").toLowerCase(),n=new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),r=a.trim().toLowerCase();return/^(hi|hello|hey|yo|help|thanks|thank you|what is floboard|who are you)[.!?]*$/i.test(r)?`Hello — I'm **FloAI**, the advisor built into FloBoard.

We can talk normally, or I can analyze a stock, coin, or FX pair. Market answers follow your **${e.toUpperCase()}** risk mode.`:/gold|gc=f|silver|si=f|xau|xag|metal/i.test(r)?`### FloAI [${e.toUpperCase()} MODE] · ${n}

**Gold / Precious Metals**

As a ${e} investor, gold is ${e==="aggressive"?"a momentum sleeve — watch breakouts against DXY":e==="conservative"?"a 5–10% capital-preservation hedge":"a 5–8% portfolio hedge"}. Watch Treasury yields and the dollar for direction.`:/btc|bitcoin|eth|ethereum|sol|solana|crypto/i.test(r)?`### FloAI [${e.toUpperCase()} MODE] · ${n}

**Bitcoin / Crypto**

${e==="aggressive"?"A 15–20% core L1 sleeve (BTC, ETH, SOL) with breakout entries can fit an aggressive book.":e==="conservative"?"Keep crypto under 3% and prefer BTC only. Treasuries stay the core.":"A 5–10% DCA sleeve with quarterly rebalancing is the moderate path."}`:/aapl|nvda|msft|tsla|stock|share|equity/i.test(r)?`### FloAI [${e.toUpperCase()} MODE] · ${n}

**Equities**

${e==="aggressive"?"Overweight AI / semiconductor leaders and enter on volume breakouts.":e==="conservative"?"Favor dividend aristocrats and keep a large fixed-income cushion.":"Core index exposure via SPY/QQQ, topped up with quality mega-caps."}`:/eurusd|usdjpy|forex|fx|currency|dollar|dxy/i.test(r)?`### FloAI [${e.toUpperCase()} MODE] · ${n}

**Forex**

${e==="aggressive"?"Trade momentum around central-bank events and carry trends.":e==="conservative"?"Avoid speculative FX. Use currency only as a hedge for international holdings.":"Track G10 majors with DXY. Pair domestic equities with international ETFs."}`:`### FloAI [${e.toUpperCase()} MODE] · ${n}

**Market outlook**

Based on your ${e} profile:
${e==="aggressive"?`- High-beta growth and AI infrastructure
- Accept volatility for upside
- Watch breakouts and volume`:e==="conservative"?`- Capital preservation and dividends
- Large sovereign-debt sleeve
- Defensive sectors (staples, utilities)`:`- Balanced 60/40-style mix
- Core index funds + quality mega-caps
- Quarterly rebalance`}`}function I(a){return a.split(`
`).map((o,e)=>{const n=o.startsWith("### ")?o.slice(4):null,r=(n??o).split("**").map((l,d)=>d%2===1?t.jsx("strong",{children:l},d):l);return n?t.jsx("div",{style:{fontWeight:700,fontSize:15,marginBottom:6},children:r},e):t.jsxs("span",{children:[r,e<a.split(`
`).length-1?`
`:""]},e)})}const P=["What is the outlook for gold?","Should I buy Bitcoin?","How is the S&P 500 looking?","Explain EUR/USD this week"];function O(){const{settings:a,updateSetting:o}=N(),{data:e}=M(),[n,r]=c.useState([]),[l,d]=c.useState(""),[p,m]=c.useState(!1),y=c.useRef(null);c.useEffect(()=>{var s;(s=y.current)==null||s.scrollIntoView({behavior:"smooth"})},[n,p]),c.useEffect(()=>{a.clearChatKey>0&&r([])},[a.clearChatKey]);const g=async s=>{var k,x,b,$,j,C;const i=(s??l).trim();if(!i||p)return;d(""),r(u=>[...u,{role:"user",content:i}]),m(!0);const A=/gold|silver|metal|btc|bitcoin|eth|crypto|stock|share|equity|forex|fx|dollar|dxy|yield|bond|oil|nasdaq|s&p|invest|buy|sell|portfolio|nvda|aapl|tsla/i.test(i)?`[${a.riskProfile.toUpperCase()} MODE] `:"";if(a.geminiApiKey.trim())try{const u=Object.entries(e).slice(0,20).map(([h,f])=>`${h}: $${f.regularMarketPrice} (${f.regularMarketChangePercent>=0?"+":""}${f.regularMarketChangePercent.toFixed(2)}%)`).join(`
`),S=`You are FloAI, FloBoard's market assistant. Speak naturally for ordinary conversation. When the user asks about markets, assets, or investing, rewrite and analyze through a ${a.riskProfile.toUpperCase()} risk lens. Never ask for bank logins, deposits, or personal financial account details. Educational only — not financial advice.

Live snapshot:
${u}`,E=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(a.geminiApiKey.trim())}`,v=await(await fetch(E,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system_instruction:{parts:[{text:S}]},contents:[{role:"user",parts:[{text:`${A}${i}`}]}],generationConfig:{maxOutputTokens:1024}})})).json(),w=(j=($=(b=(x=(k=v.candidates)==null?void 0:k[0])==null?void 0:x.content)==null?void 0:b.parts)==null?void 0:$[0])==null?void 0:j.text;if(w){r(h=>[...h,{role:"assistant",content:w}]),m(!1);return}if((C=v.error)!=null&&C.message){r(h=>[...h,{role:"assistant",content:`Error from Google Gemini API: ${v.error.message}`}]),m(!1);return}}catch{}setTimeout(()=>{r(u=>[...u,{role:"assistant",content:F(i,a.riskProfile)}]),m(!1)},400)};return t.jsxs("div",{className:"chat",children:[t.jsx("div",{className:"chat-thread",children:t.jsxs("div",{className:"chat-inner",children:[n.length===0&&t.jsxs("div",{className:"chat-empty",children:[t.jsx("div",{className:"empty-icon",children:"✦"}),t.jsx("h3",{children:"Ask FloAI anything"}),t.jsxs("p",{className:"muted",children:["Normal chat stays natural. Market questions follow your ",a.riskProfile," mode."]}),t.jsx("div",{className:"suggest",children:P.map(s=>t.jsx("button",{type:"button",onClick:()=>g(s),children:s},s))})]}),n.map((s,i)=>t.jsx("div",{className:`bubble ${s.role==="user"?"user":"ai"}`,children:I(s.content)},i)),p&&t.jsx("div",{className:"bubble ai",children:t.jsx("div",{className:"spinner",style:{width:16,height:16}})}),t.jsx("div",{ref:y})]})}),t.jsx("div",{className:"chat-input",children:t.jsxs("div",{className:"chat-box",children:[t.jsx("div",{className:"seg",style:{flexShrink:0},children:["conservative","moderate","aggressive"].map(s=>t.jsx("button",{type:"button",className:`seg-btn gain ${a.riskProfile===s?"active":""}`,onClick:()=>o("riskProfile",s),children:s.slice(0,3).toUpperCase()},s))}),t.jsx("input",{className:"field",value:l,onChange:s=>d(s.target.value),onKeyDown:s=>s.key==="Enter"&&g(),placeholder:"Ask about markets, or just say hi…"}),t.jsx("button",{className:"btn btn-primary",onClick:()=>g(),disabled:p||!l.trim(),children:"Send"})]})})]})}export{O as default};
