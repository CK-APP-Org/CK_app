import{d as V}from"./QBtn.31503470.js";import{Q as B}from"./QSpace.032d8170.js";import{Q as I,b as D}from"./QCard.ae813421.js";import{Q as W}from"./QDialog.87a95078.js";import{Q as R,a as E,b as z}from"./QSelect.faff267b.js";import{Q as K}from"./QInput.97888e3b.js";import{b as A,Q as P,a as G}from"./QItem.8449fe23.js";import{k as J,r as S,c as T,h,g as Y,a4 as X,p as Z,C as N,_ as $,o as ee,a1 as k,I as w,J as q,f as s,K as i,L as v,y as le,M as j,a0 as y,F as O,O as ae,N as te,a5 as ne,$ as H,a6 as oe,a7 as se}from"./index.3a795f78.js";import{Q as ue,a as re}from"./QTable.fea4acab.js";import{C as ce}from"./ClosePopup.6260040f.js";import"./scroll.8cbac293.js";import"./rtl.eb0210c3.js";import"./selection.35dcb10c.js";import"./QSeparator.16f36955.js";import"./QList.b9c37d33.js";import"./QCheckbox.4ef32505.js";import"./use-fullscreen.4ebdb7a0.js";function p(e,c=new WeakMap){if(Object(e)!==e)return e;if(c.has(e))return c.get(e);const u=e instanceof Date?new Date(e):e instanceof RegExp?new RegExp(e.source,e.flags):e instanceof Set?new Set:e instanceof Map?new Map:typeof e.constructor!="function"?Object.create(null):e.prototype!==void 0&&typeof e.prototype.constructor=="function"?e:new e.constructor;if(typeof e.constructor=="function"&&typeof e.valueOf=="function"){const a=e.valueOf();if(Object(a)!==a){const f=new e.constructor(a);return c.set(e,f),f}}return c.set(e,u),e instanceof Set?e.forEach(a=>{u.add(p(a,c))}):e instanceof Map&&e.forEach((a,f)=>{u.set(f,p(a,c))}),Object.assign(u,...Object.keys(e).map(a=>({[a]:p(e[a],c)})))}var ie=J({name:"QPopupEdit",props:{modelValue:{required:!0},title:String,buttons:Boolean,labelSet:String,labelCancel:String,color:{type:String,default:"primary"},validate:{type:Function,default:()=>!0},autoSave:Boolean,cover:{type:Boolean,default:!0},disable:Boolean},emits:["update:modelValue","save","cancel","beforeShow","show","beforeHide","hide"],setup(e,{slots:c,emit:u}){const{proxy:a}=Y(),{$q:f}=a,m=S(null),l=S(""),n=S("");let r=!1;const g=T(()=>X({initialValue:l.value,validate:e.validate,set:Q,cancel:C,updatePosition:x},"value",()=>n.value,b=>{n.value=b}));function Q(){e.validate(n.value)!==!1&&(t()===!0&&(u("save",n.value,l.value),u("update:modelValue",n.value)),o())}function C(){t()===!0&&u("cancel",n.value,l.value),o()}function x(){Z(()=>{m.value.updatePosition()})}function t(){return N(n.value,l.value)===!1}function o(){r=!0,m.value.hide()}function d(){r=!1,l.value=p(e.modelValue),n.value=p(e.modelValue),u("beforeShow")}function _(){u("show")}function M(){r===!1&&t()===!0&&(e.autoSave===!0&&e.validate(n.value)===!0?(u("save",n.value,l.value),u("update:modelValue",n.value)):u("cancel",n.value,l.value)),u("beforeHide")}function F(){u("hide")}function L(){const b=c.default!==void 0?[].concat(c.default(g.value)):[];return e.title&&b.unshift(h("div",{class:"q-dialog__title q-mt-sm q-mb-sm"},e.title)),e.buttons===!0&&b.push(h("div",{class:"q-popup-edit__buttons row justify-center no-wrap"},[h(V,{flat:!0,color:e.color,label:e.labelCancel||f.lang.label.cancel,onClick:C}),h(V,{flat:!0,color:e.color,label:e.labelSet||f.lang.label.set,onClick:Q})])),b}return Object.assign(a,{set:Q,cancel:C,show(b){m.value!==null&&m.value.show(b)},hide(b){m.value!==null&&m.value.hide(b)},updatePosition:x}),()=>{if(e.disable!==!0)return h(R,{ref:m,class:"q-popup-edit",cover:e.cover,onBeforeShow:d,onShow:_,onBeforeHide:M,onHide:F,onEscapeKey:C},L)}}});const de=[{name:"name",required:!0,label:"\u7BC0\u6578",align:"left",field:e=>e.name,classes:"smaller-column"},{name:"Monday",align:"center",label:"\u661F\u671F\u4E00",field:"Monday"},{name:"Tuesday",align:"center",label:"\u661F\u671F\u4E8C",field:"Tuesday"},{name:"Wednesday",align:"center",label:"\u661F\u671F\u4E09",field:"Wednesday"},{name:"Thursday",align:"center",label:"\u661F\u671F\u56DB",field:"Thursday"},{name:"Friday",align:"center",label:"\u661F\u671F\u4E94",field:"Friday"}],U=[{label:"Default",value:"#f4f4f1"},{label:"Red",value:"#FFCCCB"},{label:"Orange",value:"#f5c884"},{label:"Yellow",value:"#FFFFE0"},{label:"Green",value:"#90EE90"},{label:"Blue",value:"#ADD8E6"},{label:"Purple",value:"#e299ff"},{label:"Pink",value:"#ffa1e4"}],fe=["\u570B\u6587","\u6578\u5B78","\u82F1\u6587","\u5730\u7406","\u6B77\u53F2","\u516C\u6C11","\u751F\u7269","\u7269\u7406","\u5316\u5B78","\u5730\u79D1","\u97F3\u6A02","\u7F8E\u8853","\u9AD4\u80B2","\u793E\u5718","\u5176\u4ED6"],me=[217,227],ve={setup(){const e=S(["name","Monday"]),c=["Monday","Tuesday","Wednesday","Thursday","Friday"],u=t=>{e.value=["name",t]},a=T(()=>k.getters.getScheduleData),f=T(()=>k.getters.getUserClass);ee(()=>{a.value.length===0&&k.dispatch("loadSchedule")});const m=(t,o)=>o==="name"?t[o]:t[o]&&t[o].subject?t[o].subject:"",l=(t,o)=>{var d;return o==="name"?"Default":n((d=t[o])==null?void 0:d.color)},n=t=>t&&typeof t=="object"&&t.label?t.label:t||"Default";return{visibleColumns:e,columns:de,scheduleData:a,userClass:f,options:fe,colorOptions:U,getCellColor:l,getCellSubject:m,updateCell:(t,o,d)=>{const _=a.value.indexOf(t);k.dispatch("updateSchedule",{rowIndex:_,colName:o,newValue:d})},getCellNote:(t,o)=>o==="name"?"":t[o]&&t[o].note?t[o].note:"",changeVisibleColumn:u,getDayLabel:t=>({Monday:"\u661F\u671F\u4E00",Tuesday:"\u661F\u671F\u4E8C",Wednesday:"\u661F\u671F\u4E09",Thursday:"\u661F\u671F\u56DB",Friday:"\u661F\u671F\u4E94"})[t]||t,getLabelValue:t=>{const o=U.find(d=>d.label===t);return o?o.value:"#f4f4f1"},getFormattedColor:n,classOptions:me,days:c,isCurrentClass:(t,o)=>{const d=new Date,_=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()],M=d.getHours(),F=["\u4E00","\u4E8C","\u4E09","\u56DB","\u4E94","\u516D","\u4E03"][M-9]||"\u8AB2\u5F8C";return o===_&&t.name===F.toString()},classHelp:S(!1)}}},be={class:"q-pa-md"},ye={class:"row items-center justify-between q-mb-md"},ge={class:"row items-center"},Ce=v("div",{class:"text-h6"},"\u8A2D\u5B9A\u73ED\u7D1A",-1),_e=v("div",{class:"text-h6"},"\u7DE8\u8F2F\u8AB2\u8868",-1),he={class:"text-h5 text-bold"},we={class:"row q-gutter-sm"},Ve={class:"subject-slot"},Se={class:"note-slot"},pe=v("div",{class:"text-h6 q-mb-md"},"\u81EA\u8A02\u8AB2\u8868",-1);function Qe(e,c,u,a,f,m){return w(),q("div",be,[s(ue,{flat:"",bordered:"",title:a.userClass+" \u8AB2\u8868",rows:a.scheduleData,columns:a.columns,"row-key":"name","visible-columns":a.visibleColumns,class:"my-custom-table",separator:"cell","rows-per-page-options":[0],"hide-pagination":"","hide-bottom":""},{top:i(()=>[v("div",ye,[v("div",ge,[s(V,{flat:"",dense:"",round:"",icon:"help",color:"primary",class:"q-mr-sm",onClick:c[0]||(c[0]=l=>a.classHelp=!0)}),s(W,{modelValue:a.classHelp,"onUpdate:modelValue":c[1]||(c[1]=l=>a.classHelp=l)},{default:i(()=>[s(I,null,{default:i(()=>[s(D,{class:"row items-center q-pb-none"},{default:i(()=>[Ce,s(B),le(s(V,{icon:"close",flat:"",round:"",dense:""},null,512),[[ce]])]),_:1}),s(D,null,{default:i(()=>[j(" \u76EE\u524D\u7684\u73ED\u7D1A\u70BA"+y(a.userClass)+"\u3002\u82E5\u8981\u81EA\u8A02\u73ED\u7D1A\u4E26\u532F\u5165\u8A72\u73ED\u8AB2\u8868\uFF0C\u8ACB\u5230\u8A2D\u5B9A\u9801\u9762(\u9EDE\u9078\u53F3\u4E0A\u89D2\u8A2D\u5B9A\u6309\u9215)\u4E2D\u9032\u884C\u7DE8\u8F2F ",1)]),_:1}),s(D,{class:"row items-center q-pb-none"},{default:i(()=>[_e,s(B)]),_:1}),s(D,null,{default:i(()=>[j(" \u82E5\u8981\u81EA\u8A02\u7FA9\u8AB2\u8868\u4EFB\u4F55\u4E00\u7BC0\u7684\u984F\u8272\u3001\u79D1\u76EE\uFF0C\u6216\u52A0\u5165\u8A3B\u89E3\uFF0C\u8ACB\u9EDE\u9078\u8A72\u683C\u9032\u884C\u7DE8\u8F2F ")]),_:1})]),_:1})]),_:1},8,["modelValue"]),v("div",he,y(a.userClass)+" \u8AB2\u8868",1)]),v("div",we,[(w(!0),q(O,null,ae(a.days,l=>(w(),te(V,{key:l,label:a.getDayLabel(l),color:a.visibleColumns.includes(l)?"primary":"grey-7",onClick:n=>a.changeVisibleColumn(l),dense:"",outline:"","no-caps":""},null,8,["label","color","onClick"]))),128))])])]),"body-cell":i(l=>[s(re,{props:l,class:ne([{"split-cell":l.col.name!=="name"},{"thick-border-bottom":l.row.name==="\u4E94"},{"current-class":a.isCurrentClass(l.row,l.col.name)}])},{default:i(()=>[l.col.name!=="name"?(w(),q(O,{key:0},[v("div",{class:"cell-content",style:H({backgroundColor:a.getLabelValue(a.getCellColor(l.row,l.col.name))})},[v("div",Ve,y(a.getCellSubject(l.row,l.col.name)),1),v("div",Se,y(a.getCellNote(l.row,l.col.name)),1)],4),s(ie,{modelValue:l.row[l.col.name],"onUpdate:modelValue":n=>l.row[l.col.name]=n,"auto-save":""},{default:i(n=>[pe,s(E,{options:a.options,modelValue:n.value.subject,"onUpdate:modelValue":[r=>n.value.subject=r,r=>a.updateCell(l.row,l.col.name,{...n.value,subject:r})],label:"\u79D1\u76EE",dense:"","options-dense":"",class:"q-mb-sm"},null,8,["options","modelValue","onUpdate:modelValue"]),s(K,{modelValue:n.value.note,"onUpdate:modelValue":[r=>n.value.note=r,r=>a.updateCell(l.row,l.col.name,{...n.value,note:r})],label:"\u5099\u8A3B",dense:"",class:"q-mb-sm"},null,8,["modelValue","onUpdate:modelValue"]),s(E,{options:a.colorOptions,modelValue:n.value.color,"onUpdate:modelValue":[r=>n.value.color=r,r=>a.updateCell(l.row,l.col.name,{...n.value,color:r.label})],label:"\u984F\u8272",dense:"","options-dense":""},{option:i(({itemProps:r,opt:g})=>[s(A,oe(se(r)),{default:i(()=>[s(P,{side:""},{default:i(()=>[s(z,{style:H({backgroundColor:g.value}),square:"",dense:""},null,8,["style"])]),_:2},1024),s(P,null,{default:i(()=>[s(G,null,{default:i(()=>[j(y(g.label),1)]),_:2},1024)]),_:2},1024)]),_:2},1040)]),_:2},1032,["options","modelValue","onUpdate:modelValue"])]),_:2},1032,["modelValue","onUpdate:modelValue"])],64)):(w(),q(O,{key:1},[j(y(l.row[l.col.name]),1)],64))]),_:2},1032,["props","class"])]),_:1},8,["title","rows","columns","visible-columns"])])}var Re=$(ve,[["render",Qe]]);export{Re as default};
