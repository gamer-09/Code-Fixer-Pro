import{b as F,a as I,z as U,r as i,j as s}from"./index-DiOMdxJ0.js";function D(a,l){const e=(l||"moderate").toLowerCase(),r=new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),n=a.trim().toLowerCase();return/^(hi|hello|hey|yo|help|thanks|thank you|what is floboard|who are you)[.!?]*$/i.test(n)?`Hello — I'm **FloAI**, the advisor built into FloBoard.

We can talk normally, or I can analyze a stock, coin, or FX pair. Market answers follow your **${e.toUpperCase()}** risk mode.`:/gold|gc=f|silver|si=f|xau|xag|metal/i.test(n)?`### FloAI [${e.toUpperCase()} MODE] · ${r}

**Gold / Precious Metals**

As a ${e} investor, gold is ${e==="aggressive"?"a momentum sleeve — watch breakouts against DXY":e==="conservative"?"a 5–10% capital-preservation hedge":"a 5–8% portfolio hedge"}. Watch Treasury yields and the dollar for direction.`:/btc|bitcoin|eth|ethereum|sol|solana|crypto/i.test(n)?`### FloAI [${e.toUpperCase()} MODE] · ${r}

**Bitcoin / Crypto**

${e==="aggressive"?"A 15–20% core L1 sleeve (BTC, ETH, SOL) with breakout entries can fit an aggressive book.":e==="conservative"?"Keep crypto under 3% and prefer BTC only. Treasuries stay the core.":"A 5–10% DCA sleeve with quarterly rebalancing is the moderate path."}`:/aapl|nvda|msft|tsla|stock|share|equity/i.test(n)?`### FloAI [${e.toUpperCase()} MODE] · ${r}

**Equities**

${e==="aggressive"?"Overweight AI / semiconductor leaders and enter on volume breakouts.":e==="conservative"?"Favor dividend aristocrats and keep a large fixed-income cushion.":"Core index exposure via SPY/QQQ, topped up with quality mega-caps."}`:/eurusd|usdjpy|forex|fx|currency|dollar|dxy/i.test(n)?`### FloAI [${e.toUpperCase()} MODE] · ${r}

**Forex**

${e==="aggressive"?"Trade momentum around central-bank events and carry trends.":e==="conservative"?"Avoid speculative FX. Use currency only as a hedge for international holdings.":"Track G10 majors with DXY. Pair domestic equities with international ETFs."}`:`### FloAI [${e.toUpperCase()} MODE] · ${r}

**Market outlook**

Based on your ${e} profile:
${e==="aggressive"?`- High-beta growth and AI infrastructure
- Accept volatility for upside
- Watch breakouts and volume`:e==="conservative"?`- Capital preservation and dividends
- Large sovereign-debt sleeve
- Defensive sectors (staples, utilities)`:`- Balanced 60/40-style mix
- Core index funds + quality mega-caps
- Quarterly rebalance`}`}function T(a){return a.split(`
`).map((l,e)=>{const r=l.startsWith("### ")?l.slice(4):null,n=(r??l).split("**").map((d,o)=>o%2===1?s.jsx("strong",{children:d},o):d);return r?s.jsx("div",{style:{fontWeight:700,fontSize:15,marginBottom:6},children:n},e):s.jsxs("span",{children:[n,e<a.split(`
`).length-1?`
`:""]},e)})}const O=["What is the outlook for gold?","Should I buy Bitcoin?","How is the S&P 500 looking?","Explain EUR/USD this week"];function R(){const{settings:a,updateSetting:l}=F(),{data:e}=I(),[r,n]=U(),[d,o]=i.useState([]),[f,k]=i.useState(""),[p,m]=i.useState(!1),x=i.useRef(null),b=i.useRef(r.get("q")??"");i.useEffect(()=>{var t;(t=x.current)==null||t.scrollIntoView({behavior:"smooth"})},[d,p]),i.useEffect(()=>{a.clearChatKey>0&&o([])},[a.clearChatKey]);const g=async t=>{var $,j,C,S,w,A;const c=(t??f).trim();if(!c||p)return;k(""),o(u=>[...u,{role:"user",content:c}]),m(!0);const N=/gold|silver|metal|btc|bitcoin|eth|crypto|stock|share|equity|forex|fx|dollar|dxy|yield|bond|oil|nasdaq|s&p|invest|buy|sell|portfolio|nvda|aapl|tsla/i.test(c)?`[${a.riskProfile.toUpperCase()} MODE] `:"";if(a.geminiApiKey.trim())try{const u=Object.entries(e).slice(0,20).map(([h,y])=>`${h}: $${y.regularMarketPrice} (${y.regularMarketChangePercent>=0?"+":""}${y.regularMarketChangePercent.toFixed(2)}%)`).join(`
`),P=`You are FloAI, FloBoard's market assistant. Speak naturally for ordinary conversation. When the user asks about markets, assets, or investing, rewrite and analyze through a ${a.riskProfile.toUpperCase()} risk lens. Never ask for bank logins, deposits, or personal financial account details. Educational only — not financial advice.

Live snapshot:
${u}`,M=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(a.geminiApiKey.trim())}`,v=await(await fetch(M,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system_instruction:{parts:[{text:P}]},contents:[{role:"user",parts:[{text:`${N}${c}`}]}],generationConfig:{maxOutputTokens:1024}})})).json(),E=(w=(S=(C=(j=($=v.candidates)==null?void 0:$[0])==null?void 0:j.content)==null?void 0:C.parts)==null?void 0:S[0])==null?void 0:w.text;if(E){o(h=>[...h,{role:"assistant",content:E}]),m(!1);return}if((A=v.error)!=null&&A.message){o(h=>[...h,{role:"assistant",content:`Error from Google Gemini API: ${v.error.message}`}]),m(!1);return}}catch{}setTimeout(()=>{o(u=>[...u,{role:"assistant",content:D(c,a.riskProfile)}]),m(!1)},400)};return i.useEffect(()=>{const t=b.current.trim();t&&(b.current="",n({},{replace:!0}),g(t))},[]),s.jsxs("div",{className:"chat",children:[s.jsx("div",{className:"chat-thread",children:s.jsxs("div",{className:"chat-inner",children:[d.length===0&&s.jsxs("div",{className:"chat-empty",children:[s.jsx("div",{className:"empty-icon",children:"✦"}),s.jsx("h3",{children:"Ask FloAI anything"}),s.jsxs("p",{className:"muted",children:["Normal chat stays natural. Market questions follow your ",a.riskProfile," mode."]}),s.jsx("div",{className:"suggest",children:O.map(t=>s.jsx("button",{type:"button",onClick:()=>g(t),children:t},t))})]}),d.map((t,c)=>s.jsx("div",{className:`bubble ${t.role==="user"?"user":"ai"}`,children:T(t.content)},c)),p&&s.jsx("div",{className:"bubble ai",children:s.jsx("div",{className:"spinner",style:{width:16,height:16}})}),s.jsx("div",{ref:x})]})}),s.jsx("div",{className:"chat-input",children:s.jsxs("div",{className:"chat-box",children:[s.jsx("div",{className:"seg",style:{flexShrink:0},children:["conservative","moderate","aggressive"].map(t=>s.jsx("button",{type:"button",className:`seg-btn gain ${a.riskProfile===t?"active":""}`,onClick:()=>l("riskProfile",t),children:t.slice(0,3).toUpperCase()},t))}),s.jsx("input",{className:"field",value:f,onChange:t=>k(t.target.value),onKeyDown:t=>t.key==="Enter"&&g(),placeholder:"Ask about markets, or just say hi…"}),s.jsx("button",{className:"btn btn-primary",onClick:()=>g(),disabled:p||!f.trim(),children:"Send"})]})})]})}export{R as default};
