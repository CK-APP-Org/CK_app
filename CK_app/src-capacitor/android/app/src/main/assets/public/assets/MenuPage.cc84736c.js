import{b as i,Q as c}from"./QCard.ae813421.js";import{d}from"./QBtn.31503470.js";import{Q as _}from"./QCardActions.4cdd3666.js";import{Q as f}from"./QDialog.87a95078.js";import{Q as h}from"./QPage.77fe52b4.js";import{C as m}from"./ClosePopup.6260040f.js";import{_ as g,I as w,N as x,K as o,f as t,$ as y,L as s,M as n,a0 as p,y as H}from"./index.3a795f78.js";import"./scroll.8cbac293.js";const b={data(){return{openHour:8,closeHour:16,showDialog:!1}},computed:{statusLabel(){const e=new Date().getHours();return e>=this.openHour&&e<this.closeHour?"\u71DF\u696D\u4E2D":"\u5DF2\u6B47\u696D"},statusColor(){const e=new Date().getHours();return e>=this.openHour&&e<this.closeHour?"green":"red"},cardStyle(){const e=new Date().getHours();return e>=this.openHour&&e<this.closeHour?{}:{opacity:.5}}}},D=s("div",{class:"title"},"\u71B1\u98DF\u90E8",-1),Q=s("img",{src:"https://i.imgur.com/ncM6IAg.jpeg",style:{height:"265px","max-width":"800px"}},null,-1),v=s("div",{class:"text-h6"},"\u71B1\u98DF\u90E8\u71DF\u696D\u6642\u9593",-1),C=s("br",null,null,-1),V=s("br",null,null,-1);function S(r,e,B,M,l,a){return w(),x(h,{class:"flex justify-center"},{default:o(()=>[t(c,{style:y(a.cardStyle)},{default:o(()=>[t(i,{style:{height:"45px",width:"350px"}},{default:o(()=>[D]),_:1}),Q,t(d,{class:"absolute-top-right status-btn",label:a.statusLabel,icon:"info",size:"12px",padding:"sm",color:a.statusColor,unelevated:"",onClick:e[0]||(e[0]=u=>l.showDialog=!0)},null,8,["label","color"])]),_:1},8,["style"]),t(f,{modelValue:l.showDialog,"onUpdate:modelValue":e[1]||(e[1]=u=>l.showDialog=u)},{default:o(()=>[t(c,null,{default:o(()=>[t(i,null,{default:o(()=>[v,s("p",null,[n(" \u71B1\u98DF\u90E8\u71DF\u696D\u6642\u9593\u70BA\u6BCF\u65E5 "+p(l.openHour)+":00 \u5230 "+p(l.closeHour)+":00",1),C,n(" (\u8A3B\uFF1A\u5BE6\u969B\u71DF\u696D\u8CC7\u8A0A\u4F9D\u71B1\u98DF\u90E8\u516C\u544A\u70BA\u6E96\uFF0C"),V,n("\u672C\u8EDF\u9AD4\u4E0D\u8CA0\u4EFB\u4F55\u6CD5\u5F8B\u8CAC\u4EFB) ")])]),_:1}),t(_,{align:"right"},{default:o(()=>[H(t(d,{flat:"",label:"\u95DC\u9589",color:"primary"},null,512),[[m]])]),_:1})]),_:1})]),_:1},8,["modelValue"])]),_:1})}var K=g(b,[["render",S]]);export{K as default};
