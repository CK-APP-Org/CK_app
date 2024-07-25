import{k as A,c as u,h as r,g as H,r as N,w as Q,q as xe,ag as ct,o as dt,E as vt,D as ft,m as gt,ai as ge,aj as Be,ak as bt,p as Le,al as mt,a4 as E}from"./index.3a795f78.js";import{h as z,a as St,Q as Me,b as $e,l as yt,m as ht,d as Z}from"./QBtn.31503470.js";import{Q as _t}from"./QSeparator.16f36955.js";import{Q as wt}from"./QList.b9c37d33.js";import{u as be,a as me}from"./QCard.ae813421.js";import{j as qt,k as Pt,l as Ve,a as Ct}from"./QSelect.faff267b.js";import{s as kt,g as Rt}from"./scroll.8cbac293.js";import{Q as fe}from"./QCheckbox.4ef32505.js";import{u as Tt,a as xt,b as Bt}from"./use-fullscreen.4ebdb7a0.js";var cl=A({name:"QTd",props:{props:Object,autoWidth:Boolean,noHover:Boolean},setup(e,{slots:l}){const n=H(),g=u(()=>"q-td"+(e.autoWidth===!0?" q-table--col-auto-width":"")+(e.noHover===!0?" q-td--no-hover":"")+" ");return()=>{if(e.props===void 0)return r("td",{class:g.value},z(l.default));const i=n.vnode.key,f=(e.props.colsMap!==void 0?e.props.colsMap[i]:null)||e.props.col;if(f===void 0)return;const{row:s}=e.props;return r("td",{class:g.value+f.__tdClass(s),style:f.__tdStyle(s)},z(l.default))}}}),Ot=A({name:"QTh",props:{props:Object,autoWidth:Boolean},emits:["click"],setup(e,{slots:l,emit:n}){const g=H(),{proxy:{$q:i}}=g,f=s=>{n("click",s)};return()=>{if(e.props===void 0)return r("th",{class:e.autoWidth===!0?"q-table--col-auto-width":"",onClick:f},z(l.default));let s,d;const c=g.vnode.key;if(c){if(s=e.props.colsMap[c],s===void 0)return}else s=e.props.col;if(s.sortable===!0){const a=s.align==="right"?"unshift":"push";d=St(l.default,[]),d[a](r(Me,{class:s.__iconClass,name:i.iconSet.table.arrowUp}))}else d=z(l.default);const h={class:s.__thClass+(e.autoWidth===!0?" q-table--col-auto-width":""),style:s.headerStyle,onClick:a=>{s.sortable===!0&&e.props.sort(s),f(a)}};return r("th",h,d)}}});const Ft=["horizontal","vertical","cell","none"];var Dt=A({name:"QMarkupTable",props:{...be,dense:Boolean,flat:Boolean,bordered:Boolean,square:Boolean,wrapCells:Boolean,separator:{type:String,default:"horizontal",validator:e=>Ft.includes(e)}},setup(e,{slots:l}){const n=H(),g=me(e,n.proxy.$q),i=u(()=>`q-markup-table q-table__container q-table__card q-table--${e.separator}-separator`+(g.value===!0?" q-table--dark q-table__card--dark q-dark":"")+(e.dense===!0?" q-table--dense":"")+(e.flat===!0?" q-table--flat":"")+(e.bordered===!0?" q-table--bordered":"")+(e.square===!0?" q-table--square":"")+(e.wrapCells===!1?" q-table--no-wrap":""));return()=>r("div",{class:i.value},[r("table",{class:"q-table"},z(l.default))])}});function je(e,l){return r("div",e,[r("table",{class:"q-table"},l)])}const Lt={list:wt,table:Dt},Mt=["list","table","__qtable"];var $t=A({name:"QVirtualScroll",props:{...qt,type:{type:String,default:"list",validator:e=>Mt.includes(e)},items:{type:Array,default:()=>[]},itemsFn:Function,itemsSize:Number,scrollTarget:kt},setup(e,{slots:l,attrs:n}){let g;const i=N(null),f=u(()=>e.itemsSize>=0&&e.itemsFn!==void 0?parseInt(e.itemsSize,10):Array.isArray(e.items)?e.items.length:0),{virtualScrollSliceRange:s,localResetVirtualScroll:d,padVirtualScroll:c,onVirtualScrollEvt:h}=Pt({virtualScrollLength:f,getVirtualScrollTarget:P,getVirtualScrollEl:q}),a=u(()=>{if(f.value===0)return[];const O=(F,R)=>({index:s.value.from+R,item:F});return e.itemsFn===void 0?e.items.slice(s.value.from,s.value.to).map(O):e.itemsFn(s.value.from,s.value.to-s.value.from).map(O)}),m=u(()=>"q-virtual-scroll q-virtual-scroll"+(e.virtualScrollHorizontal===!0?"--horizontal":"--vertical")+(e.scrollTarget!==void 0?"":" scroll")),w=u(()=>e.scrollTarget!==void 0?{}:{tabindex:0});Q(f,()=>{d()}),Q(()=>e.scrollTarget,()=>{S(),_()});function q(){return i.value.$el||i.value}function P(){return g}function _(){g=Rt(q(),e.scrollTarget),g.addEventListener("scroll",h,xe.passive)}function S(){g!==void 0&&(g.removeEventListener("scroll",h,xe.passive),g=void 0)}function B(){let O=c(e.type==="list"?"div":"tbody",a.value.map(l.default));return l.before!==void 0&&(O=l.before().concat(O)),$e(l.after,O)}return ct(()=>{d()}),dt(()=>{_()}),vt(()=>{_()}),ft(()=>{S()}),gt(()=>{S()}),()=>{if(l.default===void 0){console.error("QVirtualScroll: default scoped slot is required for rendering");return}return e.type==="__qtable"?je({ref:i,class:"q-table__middle "+m.value},B()):r(Lt[e.type],{...n,ref:i,class:[n.class,m.value],...w.value},B)}}});const Vt={xs:2,sm:4,md:6,lg:10,xl:14};function Oe(e,l,n){return{transform:l===!0?`translateX(${n.lang.rtl===!0?"-":""}100%) scale3d(${-e},1,1)`:`scale3d(${e},1,1)`}}var jt=A({name:"QLinearProgress",props:{...be,...yt,value:{type:Number,default:0},buffer:Number,color:String,trackColor:String,reverse:Boolean,stripe:Boolean,indeterminate:Boolean,query:Boolean,rounded:Boolean,animationSpeed:{type:[String,Number],default:2100},instantFeedback:Boolean},setup(e,{slots:l}){const{proxy:n}=H(),g=me(e,n.$q),i=ht(e,Vt),f=u(()=>e.indeterminate===!0||e.query===!0),s=u(()=>e.reverse!==e.query),d=u(()=>({...i.value!==null?i.value:{},"--q-linear-progress-speed":`${e.animationSpeed}ms`})),c=u(()=>"q-linear-progress"+(e.color!==void 0?` text-${e.color}`:"")+(e.reverse===!0||e.query===!0?" q-linear-progress--reverse":"")+(e.rounded===!0?" rounded-borders":"")),h=u(()=>Oe(e.buffer!==void 0?e.buffer:1,s.value,n.$q)),a=u(()=>`with${e.instantFeedback===!0?"out":""}-transition`),m=u(()=>`q-linear-progress__track absolute-full q-linear-progress__track--${a.value} q-linear-progress__track--${g.value===!0?"dark":"light"}`+(e.trackColor!==void 0?` bg-${e.trackColor}`:"")),w=u(()=>Oe(f.value===!0?1:e.value,s.value,n.$q)),q=u(()=>`q-linear-progress__model absolute-full q-linear-progress__model--${a.value} q-linear-progress__model--${f.value===!0?"in":""}determinate`),P=u(()=>({width:`${e.value*100}%`})),_=u(()=>`q-linear-progress__stripe absolute-${e.reverse===!0?"right":"left"} q-linear-progress__stripe--${a.value}`);return()=>{const S=[r("div",{class:m.value,style:h.value}),r("div",{class:q.value,style:w.value})];return e.stripe===!0&&f.value===!1&&S.push(r("div",{class:_.value,style:P.value})),r("div",{class:c.value,style:d.value,role:"progressbar","aria-valuemin":0,"aria-valuemax":1,"aria-valuenow":e.indeterminate===!0?void 0:e.value},$e(l.default,S))}}});function Qt(e,l){return new Date(e)-new Date(l)}const At={sortMethod:Function,binaryStateSort:Boolean,columnSortOrder:{type:String,validator:e=>e==="ad"||e==="da",default:"ad"}};function Et(e,l,n,g){const i=u(()=>{const{sortBy:d}=l.value;return d&&n.value.find(c=>c.name===d)||null}),f=u(()=>e.sortMethod!==void 0?e.sortMethod:(d,c,h)=>{const a=n.value.find(q=>q.name===c);if(a===void 0||a.field===void 0)return d;const m=h===!0?-1:1,w=typeof a.field=="function"?q=>a.field(q):q=>q[a.field];return d.sort((q,P)=>{let _=w(q),S=w(P);return a.rawSort!==void 0?a.rawSort(_,S,q,P)*m:_==null?-1*m:S==null?1*m:a.sort!==void 0?a.sort(_,S,q,P)*m:ge(_)===!0&&ge(S)===!0?(_-S)*m:Be(_)===!0&&Be(S)===!0?Qt(_,S)*m:typeof _=="boolean"&&typeof S=="boolean"?(_-S)*m:([_,S]=[_,S].map(B=>(B+"").toLocaleString().toLowerCase()),_<S?-1*m:_===S?0:m)})});function s(d){let c=e.columnSortOrder;if(bt(d)===!0)d.sortOrder&&(c=d.sortOrder),d=d.name;else{const m=n.value.find(w=>w.name===d);m!==void 0&&m.sortOrder&&(c=m.sortOrder)}let{sortBy:h,descending:a}=l.value;h!==d?(h=d,a=c==="da"):e.binaryStateSort===!0?a=!a:a===!0?c==="ad"?h=null:a=!1:c==="ad"?a=!0:h=null,g({sortBy:h,descending:a,page:1})}return{columnToSort:i,computedSortMethod:f,sort:s}}const Nt={filter:[String,Object],filterMethod:Function};function zt(e,l){const n=u(()=>e.filterMethod!==void 0?e.filterMethod:(g,i,f,s)=>{const d=i?i.toLowerCase():"";return g.filter(c=>f.some(h=>{const a=s(h,c)+"";return(a==="undefined"||a==="null"?"":a.toLowerCase()).indexOf(d)!==-1}))});return Q(()=>e.filter,()=>{Le(()=>{l({page:1},!0)})},{deep:!0}),{computedFilterMethod:n}}function Ht(e,l){for(const n in l)if(l[n]!==e[n])return!1;return!0}function Fe(e){return e.page<1&&(e.page=1),e.rowsPerPage!==void 0&&e.rowsPerPage<1&&(e.rowsPerPage=0),e}const pt={pagination:Object,rowsPerPageOptions:{type:Array,default:()=>[5,7,10,15,20,25,50,0]},"onUpdate:pagination":[Function,Array]};function Ut(e,l){const{props:n,emit:g}=e,i=N(Object.assign({sortBy:null,descending:!1,page:1,rowsPerPage:n.rowsPerPageOptions.length!==0?n.rowsPerPageOptions[0]:5},n.pagination)),f=u(()=>{const a=n["onUpdate:pagination"]!==void 0?{...i.value,...n.pagination}:i.value;return Fe(a)}),s=u(()=>f.value.rowsNumber!==void 0);function d(a){c({pagination:a,filter:n.filter})}function c(a={}){Le(()=>{g("request",{pagination:a.pagination||f.value,filter:a.filter||n.filter,getCellValue:l})})}function h(a,m){const w=Fe({...f.value,...a});if(Ht(f.value,w)===!0){s.value===!0&&m===!0&&d(w);return}if(s.value===!0){d(w);return}n.pagination!==void 0&&n["onUpdate:pagination"]!==void 0?g("update:pagination",w):i.value=w}return{innerPagination:i,computedPagination:f,isServerSide:s,requestServerInteraction:c,setPagination:h}}function It(e,l,n,g,i,f){const{props:s,emit:d,proxy:{$q:c}}=e,h=u(()=>g.value===!0?n.value.rowsNumber||0:f.value),a=u(()=>{const{page:R,rowsPerPage:T}=n.value;return(R-1)*T}),m=u(()=>{const{page:R,rowsPerPage:T}=n.value;return R*T}),w=u(()=>n.value.page===1),q=u(()=>n.value.rowsPerPage===0?1:Math.max(1,Math.ceil(h.value/n.value.rowsPerPage))),P=u(()=>m.value===0?!0:n.value.page>=q.value),_=u(()=>(s.rowsPerPageOptions.includes(l.value.rowsPerPage)?s.rowsPerPageOptions:[l.value.rowsPerPage].concat(s.rowsPerPageOptions)).map(T=>({label:T===0?c.lang.table.allRows:""+T,value:T})));Q(q,(R,T)=>{if(R===T)return;const p=n.value.page;R&&!p?i({page:1}):R<p&&i({page:R})});function S(){i({page:1})}function B(){const{page:R}=n.value;R>1&&i({page:R-1})}function O(){const{page:R,rowsPerPage:T}=n.value;m.value>0&&R*T<h.value&&i({page:R+1})}function F(){i({page:q.value})}return s["onUpdate:pagination"]!==void 0&&d("update:pagination",{...n.value}),{firstRowIndex:a,lastRowIndex:m,isFirstPage:w,isLastPage:P,pagesNumber:q,computedRowsPerPageOptions:_,computedRowsNumber:h,firstPage:S,prevPage:B,nextPage:O,lastPage:F}}const Wt={selection:{type:String,default:"none",validator:e=>["single","multiple","none"].includes(e)},selected:{type:Array,default:()=>[]}},Kt=["update:selected","selection"];function Gt(e,l,n,g){const i=u(()=>{const P={};return e.selected.map(g.value).forEach(_=>{P[_]=!0}),P}),f=u(()=>e.selection!=="none"),s=u(()=>e.selection==="single"),d=u(()=>e.selection==="multiple"),c=u(()=>n.value.length!==0&&n.value.every(P=>i.value[g.value(P)]===!0)),h=u(()=>c.value!==!0&&n.value.some(P=>i.value[g.value(P)]===!0)),a=u(()=>e.selected.length);function m(P){return i.value[P]===!0}function w(){l("update:selected",[])}function q(P,_,S,B){l("selection",{rows:_,added:S,keys:P,evt:B});const O=s.value===!0?S===!0?_:[]:S===!0?e.selected.concat(_):e.selected.filter(F=>P.includes(g.value(F))===!1);l("update:selected",O)}return{hasSelectionMode:f,singleSelection:s,multipleSelection:d,allRowsSelected:c,someRowsSelected:h,rowsSelectedNumber:a,isRowSelected:m,clearSelection:w,updateSelection:q}}function De(e){return Array.isArray(e)?e.slice():[]}const Xt={expanded:Array},Jt=["update:expanded"];function Yt(e,l){const n=N(De(e.expanded));Q(()=>e.expanded,s=>{n.value=De(s)});function g(s){return n.value.includes(s)}function i(s){e.expanded!==void 0?l("update:expanded",s):n.value=s}function f(s,d){const c=n.value.slice(),h=c.indexOf(s);d===!0?h===-1&&(c.push(s),i(c)):h!==-1&&(c.splice(h,1),i(c))}return{isRowExpanded:g,setExpanded:i,updateExpanded:f}}const Zt={visibleColumns:Array};function el(e,l,n){const g=u(()=>{if(e.columns!==void 0)return e.columns;const d=e.rows[0];return d!==void 0?Object.keys(d).map(c=>({name:c,label:c.toUpperCase(),field:c,align:ge(d[c])?"right":"left",sortable:!0})):[]}),i=u(()=>{const{sortBy:d,descending:c}=l.value;return(e.visibleColumns!==void 0?g.value.filter(a=>a.required===!0||e.visibleColumns.includes(a.name)===!0):g.value).map(a=>{const m=a.align||"right",w=`text-${m}`;return{...a,align:m,__iconClass:`q-table__sort-icon q-table__sort-icon--${m}`,__thClass:w+(a.headerClasses!==void 0?" "+a.headerClasses:"")+(a.sortable===!0?" sortable":"")+(a.name===d?` sorted ${c===!0?"sort-desc":""}`:""),__tdStyle:a.style!==void 0?typeof a.style!="function"?()=>a.style:a.style:()=>null,__tdClass:a.classes!==void 0?typeof a.classes!="function"?()=>w+" "+a.classes:q=>w+" "+a.classes(q):()=>w}})}),f=u(()=>{const d={};return i.value.forEach(c=>{d[c.name]=c}),d}),s=u(()=>e.tableColspan!==void 0?e.tableColspan:i.value.length+(n.value===!0?1:0));return{colList:g,computedCols:i,computedColsMap:f,computedColspan:s}}const ee="q-table__bottom row items-center",Qe={};Ve.forEach(e=>{Qe[e]={}});var dl=A({name:"QTable",props:{rows:{type:Array,required:!0},rowKey:{type:[String,Function],default:"id"},columns:Array,loading:Boolean,iconFirstPage:String,iconPrevPage:String,iconNextPage:String,iconLastPage:String,title:String,hideHeader:Boolean,grid:Boolean,gridHeader:Boolean,dense:Boolean,flat:Boolean,bordered:Boolean,square:Boolean,separator:{type:String,default:"horizontal",validator:e=>["horizontal","vertical","cell","none"].includes(e)},wrapCells:Boolean,virtualScroll:Boolean,virtualScrollTarget:{},...Qe,noDataLabel:String,noResultsLabel:String,loadingLabel:String,selectedRowsLabel:Function,rowsPerPageLabel:String,paginationLabel:Function,color:{type:String,default:"grey-8"},titleClass:[String,Array,Object],tableStyle:[String,Array,Object],tableClass:[String,Array,Object],tableHeaderStyle:[String,Array,Object],tableHeaderClass:[String,Array,Object],cardContainerClass:[String,Array,Object],cardContainerStyle:[String,Array,Object],cardStyle:[String,Array,Object],cardClass:[String,Array,Object],hideBottom:Boolean,hideSelectedBanner:Boolean,hideNoData:Boolean,hidePagination:Boolean,onRowClick:Function,onRowDblclick:Function,onRowContextmenu:Function,...be,...Tt,...Zt,...Nt,...pt,...Xt,...Wt,...At},emits:["request","virtualScroll",...xt,...Jt,...Kt],setup(e,{slots:l,emit:n}){const g=H(),{proxy:{$q:i}}=g,f=me(e,i),{inFullscreen:s,toggleFullscreen:d}=Bt(),c=u(()=>typeof e.rowKey=="function"?e.rowKey:t=>t[e.rowKey]),h=N(null),a=N(null),m=u(()=>e.grid!==!0&&e.virtualScroll===!0),w=u(()=>" q-table__card"+(f.value===!0?" q-table__card--dark q-dark":"")+(e.square===!0?" q-table--square":"")+(e.flat===!0?" q-table--flat":"")+(e.bordered===!0?" q-table--bordered":"")),q=u(()=>`q-table__container q-table--${e.separator}-separator column no-wrap`+(e.grid===!0?" q-table--grid":w.value)+(f.value===!0?" q-table--dark":"")+(e.dense===!0?" q-table--dense":"")+(e.wrapCells===!1?" q-table--no-wrap":"")+(s.value===!0?" fullscreen scroll":"")),P=u(()=>q.value+(e.loading===!0?" q-table--loading":""));Q(()=>e.tableStyle+e.tableClass+e.tableHeaderStyle+e.tableHeaderClass+q.value,()=>{m.value===!0&&a.value!==null&&a.value.reset()});const{innerPagination:_,computedPagination:S,isServerSide:B,requestServerInteraction:O,setPagination:F}=Ut(g,V),{computedFilterMethod:R}=zt(e,F),{isRowExpanded:T,setExpanded:p,updateExpanded:Ae}=Yt(e,n),te=u(()=>{let t=e.rows;if(B.value===!0||t.length===0)return t;const{sortBy:o,descending:v}=S.value;return e.filter&&(t=R.value(t,e.filter,D.value,V)),pe.value!==null&&(t=Ue.value(e.rows===t?t.slice():t,o,v)),t}),Se=u(()=>te.value.length),M=u(()=>{let t=te.value;if(B.value===!0)return t;const{rowsPerPage:o}=S.value;return o!==0&&(I.value===0&&e.rows!==t?t.length>W.value&&(t=t.slice(0,W.value)):t=t.slice(I.value,W.value)),t}),{hasSelectionMode:$,singleSelection:Ee,multipleSelection:ye,allRowsSelected:Ne,someRowsSelected:he,rowsSelectedNumber:le,isRowSelected:ae,clearSelection:ze,updateSelection:U}=Gt(e,n,M,c),{colList:He,computedCols:D,computedColsMap:_e,computedColspan:we}=el(e,S,$),{columnToSort:pe,computedSortMethod:Ue,sort:re}=Et(e,S,He,F),{firstRowIndex:I,lastRowIndex:W,isFirstPage:ne,isLastPage:oe,pagesNumber:K,computedRowsPerPageOptions:Ie,computedRowsNumber:G,firstPage:ie,prevPage:se,nextPage:ue,lastPage:ce}=It(g,_,S,B,F,Se),We=u(()=>M.value.length===0),Ke=u(()=>{const t={};return Ve.forEach(o=>{t[o]=e[o]}),t.virtualScrollItemSize===void 0&&(t.virtualScrollItemSize=e.dense===!0?28:48),t});function Ge(){m.value===!0&&a.value.reset()}function Xe(){if(e.grid===!0)return st();const t=e.hideHeader!==!0?Re:null;if(m.value===!0){const v=l["top-row"],b=l["bottom-row"],y={default:k=>Pe(k.item,l.body,k.index)};if(v!==void 0){const k=r("tbody",v({cols:D.value}));y.before=t===null?()=>k:()=>[t()].concat(k)}else t!==null&&(y.before=t);return b!==void 0&&(y.after=()=>r("tbody",b({cols:D.value}))),r($t,{ref:a,class:e.tableClass,style:e.tableStyle,...Ke.value,scrollTarget:e.virtualScrollTarget,items:M.value,type:"__qtable",tableColspan:we.value,onVirtualScroll:Ye},y)}const o=[Ze()];return t!==null&&o.unshift(t()),je({class:["q-table__middle scroll",e.tableClass],style:e.tableStyle},o)}function Je(t,o){if(a.value!==null){a.value.scrollTo(t,o);return}t=parseInt(t,10);const v=h.value.querySelector(`tbody tr:nth-of-type(${t+1})`);if(v!==null){const b=h.value.querySelector(".q-table__middle.scroll"),y=v.offsetTop-e.virtualScrollStickySizeStart,k=y<b.scrollTop?"decrease":"increase";b.scrollTop=y,n("virtualScroll",{index:t,from:0,to:_.value.rowsPerPage-1,direction:k})}}function Ye(t){n("virtualScroll",t)}function qe(){return[r(jt,{class:"q-table__linear-progress",color:e.color,dark:f.value,indeterminate:!0,trackColor:"transparent"})]}function Pe(t,o,v){const b=c.value(t),y=ae(b);if(o!==void 0)return o(Ce({key:b,row:t,pageIndex:v,__trClass:y?"selected":""}));const k=l["body-cell"],C=D.value.map(x=>{const J=l[`body-cell-${x.name}`],Y=J!==void 0?J:k;return Y!==void 0?Y(et({key:b,row:t,pageIndex:v,col:x})):r("td",{class:x.__tdClass(t),style:x.__tdStyle(t)},V(x,t))});if($.value===!0){const x=l["body-selection"],J=x!==void 0?x(tt({key:b,row:t,pageIndex:v})):[r(fe,{modelValue:y,color:e.color,dark:f.value,dense:e.dense,"onUpdate:modelValue":(Y,ut)=>{U([b],[t],Y,ut)}})];C.unshift(r("td",{class:"q-table--col-auto-width"},J))}const L={key:b,class:{selected:y}};return e.onRowClick!==void 0&&(L.class["cursor-pointer"]=!0,L.onClick=x=>{n("rowClick",x,t,v)}),e.onRowDblclick!==void 0&&(L.class["cursor-pointer"]=!0,L.onDblclick=x=>{n("rowDblclick",x,t,v)}),e.onRowContextmenu!==void 0&&(L.class["cursor-pointer"]=!0,L.onContextmenu=x=>{n("rowContextmenu",x,t,v)}),r("tr",L,C)}function Ze(){const t=l.body,o=l["top-row"],v=l["bottom-row"];let b=M.value.map((y,k)=>Pe(y,t,k));return o!==void 0&&(b=o({cols:D.value}).concat(b)),v!==void 0&&(b=b.concat(v({cols:D.value}))),r("tbody",b)}function Ce(t){return de(t),t.cols=t.cols.map(o=>E({...o},"value",()=>V(o,t.row))),t}function et(t){return de(t),E(t,"value",()=>V(t.col,t.row)),t}function tt(t){return de(t),t}function de(t){Object.assign(t,{cols:D.value,colsMap:_e.value,sort:re,rowIndex:I.value+t.pageIndex,color:e.color,dark:f.value,dense:e.dense}),$.value===!0&&E(t,"selected",()=>ae(t.key),(o,v)=>{U([t.key],[t.row],o,v)}),E(t,"expand",()=>T(t.key),o=>{Ae(t.key,o)})}function V(t,o){const v=typeof t.field=="function"?t.field(o):o[t.field];return t.format!==void 0?t.format(v,o):v}const j=u(()=>({pagination:S.value,pagesNumber:K.value,isFirstPage:ne.value,isLastPage:oe.value,firstPage:ie,prevPage:se,nextPage:ue,lastPage:ce,inFullscreen:s.value,toggleFullscreen:d}));function lt(){const t=l.top,o=l["top-left"],v=l["top-right"],b=l["top-selection"],y=$.value===!0&&b!==void 0&&le.value>0,k="q-table__top relative-position row items-center";if(t!==void 0)return r("div",{class:k},[t(j.value)]);let C;if(y===!0?C=b(j.value).slice():(C=[],o!==void 0?C.push(r("div",{class:"q-table__control"},[o(j.value)])):e.title&&C.push(r("div",{class:"q-table__control"},[r("div",{class:["q-table__title",e.titleClass]},e.title)]))),v!==void 0&&(C.push(r("div",{class:"q-table__separator col"})),C.push(r("div",{class:"q-table__control"},[v(j.value)]))),C.length!==0)return r("div",{class:k},C)}const ke=u(()=>he.value===!0?null:Ne.value);function Re(){const t=at();return e.loading===!0&&l.loading===void 0&&t.push(r("tr",{class:"q-table__progress"},[r("th",{class:"relative-position",colspan:we.value},qe())])),r("thead",t)}function at(){const t=l.header,o=l["header-cell"];if(t!==void 0)return t(ve({header:!0})).slice();const v=D.value.map(b=>{const y=l[`header-cell-${b.name}`],k=y!==void 0?y:o,C=ve({col:b});return k!==void 0?k(C):r(Ot,{key:b.name,props:C},()=>b.label)});if(Ee.value===!0&&e.grid!==!0)v.unshift(r("th",{class:"q-table--col-auto-width"}," "));else if(ye.value===!0){const b=l["header-selection"],y=b!==void 0?b(ve({})):[r(fe,{color:e.color,modelValue:ke.value,dark:f.value,dense:e.dense,"onUpdate:modelValue":Te})];v.unshift(r("th",{class:"q-table--col-auto-width"},y))}return[r("tr",{class:e.tableHeaderClass,style:e.tableHeaderStyle},v)]}function ve(t){return Object.assign(t,{cols:D.value,sort:re,colsMap:_e.value,color:e.color,dark:f.value,dense:e.dense}),ye.value===!0&&E(t,"selected",()=>ke.value,Te),t}function Te(t){he.value===!0&&(t=!1),U(M.value.map(c.value),M.value,t)}const X=u(()=>{const t=[e.iconFirstPage||i.iconSet.table.firstPage,e.iconPrevPage||i.iconSet.table.prevPage,e.iconNextPage||i.iconSet.table.nextPage,e.iconLastPage||i.iconSet.table.lastPage];return i.lang.rtl===!0?t.reverse():t});function rt(){if(e.hideBottom===!0)return;if(We.value===!0){if(e.hideNoData===!0)return;const v=e.loading===!0?e.loadingLabel||i.lang.table.loading:e.filter?e.noResultsLabel||i.lang.table.noResults:e.noDataLabel||i.lang.table.noData,b=l["no-data"],y=b!==void 0?[b({message:v,icon:i.iconSet.table.warning,filter:e.filter})]:[r(Me,{class:"q-table__bottom-nodata-icon",name:i.iconSet.table.warning}),v];return r("div",{class:ee+" q-table__bottom--nodata"},y)}const t=l.bottom;if(t!==void 0)return r("div",{class:ee},[t(j.value)]);const o=e.hideSelectedBanner!==!0&&$.value===!0&&le.value>0?[r("div",{class:"q-table__control"},[r("div",[(e.selectedRowsLabel||i.lang.table.selectedRecords)(le.value)])])]:[];if(e.hidePagination!==!0)return r("div",{class:ee+" justify-end"},ot(o));if(o.length!==0)return r("div",{class:ee},o)}function nt(t){F({page:1,rowsPerPage:t.value})}function ot(t){let o;const{rowsPerPage:v}=S.value,b=e.paginationLabel||i.lang.table.pagination,y=l.pagination,k=e.rowsPerPageOptions.length>1;if(t.push(r("div",{class:"q-table__separator col"})),k===!0&&t.push(r("div",{class:"q-table__control"},[r("span",{class:"q-table__bottom-item"},[e.rowsPerPageLabel||i.lang.table.recordsPerPage]),r(Ct,{class:"q-table__select inline q-table__bottom-item",color:e.color,modelValue:v,options:Ie.value,displayValue:v===0?i.lang.table.allRows:v,dark:f.value,borderless:!0,dense:!0,optionsDense:!0,optionsCover:!0,"onUpdate:modelValue":nt})])),y!==void 0)o=y(j.value);else if(o=[r("span",v!==0?{class:"q-table__bottom-item"}:{},[v?b(I.value+1,Math.min(W.value,G.value),G.value):b(1,Se.value,G.value)])],v!==0&&K.value>1){const C={color:e.color,round:!0,dense:!0,flat:!0};e.dense===!0&&(C.size="sm"),K.value>2&&o.push(r(Z,{key:"pgFirst",...C,icon:X.value[0],disable:ne.value,onClick:ie})),o.push(r(Z,{key:"pgPrev",...C,icon:X.value[1],disable:ne.value,onClick:se}),r(Z,{key:"pgNext",...C,icon:X.value[2],disable:oe.value,onClick:ue})),K.value>2&&o.push(r(Z,{key:"pgLast",...C,icon:X.value[3],disable:oe.value,onClick:ce}))}return t.push(r("div",{class:"q-table__control"},o)),t}function it(){const t=e.gridHeader===!0?[r("table",{class:"q-table"},[Re()])]:e.loading===!0&&l.loading===void 0?qe():void 0;return r("div",{class:"q-table__middle"},t)}function st(){const t=l.item!==void 0?l.item:o=>{const v=o.cols.map(y=>r("div",{class:"q-table__grid-item-row"},[r("div",{class:"q-table__grid-item-title"},[y.label]),r("div",{class:"q-table__grid-item-value"},[y.value])]));if($.value===!0){const y=l["body-selection"],k=y!==void 0?y(o):[r(fe,{modelValue:o.selected,color:e.color,dark:f.value,dense:e.dense,"onUpdate:modelValue":(C,L)=>{U([o.key],[o.row],C,L)}})];v.unshift(r("div",{class:"q-table__grid-item-row"},k),r(_t,{dark:f.value}))}const b={class:["q-table__grid-item-card"+w.value,e.cardClass],style:e.cardStyle};return(e.onRowClick!==void 0||e.onRowDblclick!==void 0)&&(b.class[0]+=" cursor-pointer",e.onRowClick!==void 0&&(b.onClick=y=>{n("RowClick",y,o.row,o.pageIndex)}),e.onRowDblclick!==void 0&&(b.onDblclick=y=>{n("RowDblclick",y,o.row,o.pageIndex)})),r("div",{class:"q-table__grid-item col-xs-12 col-sm-6 col-md-4 col-lg-3"+(o.selected===!0?" q-table__grid-item--selected":"")},[r("div",b,v)])};return r("div",{class:["q-table__grid-content row",e.cardContainerClass],style:e.cardContainerStyle},M.value.map((o,v)=>t(Ce({key:c.value(o),row:o,pageIndex:v}))))}return Object.assign(g.proxy,{requestServerInteraction:O,setPagination:F,firstPage:ie,prevPage:se,nextPage:ue,lastPage:ce,isRowSelected:ae,clearSelection:ze,isRowExpanded:T,setExpanded:p,sort:re,resetVirtualScroll:Ge,scrollTo:Je,getCellValue:V}),mt(g.proxy,{filteredSortedRows:()=>te.value,computedRows:()=>M.value,computedRowsNumber:()=>G.value}),()=>{const t=[lt()],o={ref:h,class:P.value};return e.grid===!0?t.push(it()):Object.assign(o,{class:[o.class,e.cardClass],style:e.cardStyle}),t.push(Xe(),rt()),e.loading===!0&&l.loading!==void 0&&t.push(l.loading()),r("div",o,t)}}});export{dl as Q,cl as a,Ot as b};
