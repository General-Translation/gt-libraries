import{jsx as r}from"react/jsx-runtime";import a,{createContext as e,useContext as n,isValidElement as t,useMemo as i,useState as o,useEffect as l,useCallback as c}from"react";import{formatNum as u,formatCurrency as s,formatDateTime as v,isSameLanguage as d,determineLanguage as p,renderContentToString as f}from"generaltranslation";import"xxhashjs";var b=function(){return b=Object.assign||function(r){for(var a,e=1,n=arguments.length;e<n;e++)for(var t in a=arguments[e])Object.prototype.hasOwnProperty.call(a,t)&&(r[t]=a[t]);return r},b.apply(this,arguments)};function h(r,a){var e={};for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&a.indexOf(n)<0&&(e[n]=r[n]);if(null!=r&&"function"==typeof Object.getOwnPropertySymbols){var t=0;for(n=Object.getOwnPropertySymbols(r);t<n.length;t++)a.indexOf(n[t])<0&&Object.prototype.propertyIsEnumerable.call(r,n[t])&&(e[n[t]]=r[n[t]])}return e}function g(r,a,e,n){return new(e||(e=Promise))((function(t,i){function o(r){try{c(n.next(r))}catch(r){i(r)}}function l(r){try{c(n.throw(r))}catch(r){i(r)}}function c(r){var a;r.done?t(r.value):(a=r.value,a instanceof e?a:new e((function(r){r(a)}))).then(o,l)}c((n=n.apply(r,a||[])).next())}))}function m(r,a){var e,n,t,i={label:0,sent:function(){if(1&t[0])throw t[1];return t[1]},trys:[],ops:[]},o=Object.create(("function"==typeof Iterator?Iterator:Object).prototype);return o.next=l(0),o.throw=l(1),o.return=l(2),"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function l(l){return function(c){return function(l){if(e)throw new TypeError("Generator is already executing.");for(;o&&(o=0,l[0]&&(i=0)),i;)try{if(e=1,n&&(t=2&l[0]?n.return:l[0]?n.throw||((t=n.return)&&t.call(n),0):n.next)&&!(t=t.call(n,l[1])).done)return t;switch(n=0,t&&(l=[2&l[0],t.value]),l[0]){case 0:case 1:t=l;break;case 4:return i.label++,{value:l[1],done:!1};case 5:i.label++,n=l[1],l=[0];continue;case 7:l=i.ops.pop(),i.trys.pop();continue;default:if(!(t=i.trys,(t=t.length>0&&t[t.length-1])||6!==l[0]&&2!==l[0])){i=0;continue}if(3===l[0]&&(!t||l[1]>t[0]&&l[1]<t[3])){i.label=l[1];break}if(6===l[0]&&i.label<t[1]){i.label=t[1],t=l;break}if(t&&i.label<t[2]){i.label=t[2],i.ops.push(l);break}t[2]&&i.ops.pop(),i.trys.pop();continue}l=a.call(r,i)}catch(r){l=[6,r],n=0}finally{e=t=0}if(5&l[0])throw l[1];return{value:l[0]?l[1]:void 0,done:!0}}([l,c])}}}"function"==typeof SuppressedError&&SuppressedError;var y=e(void 0);function w(r){void 0===r&&(r="useGTContext() must be used within a <GTProvider>!");var a=n(y);if(void 0===a)throw new Error(r);return a}function O(){return w("useDefaultLocale(): Unable to access default locale outside of a <GTProvider>").defaultLocale}function E(){return w("useLocale(): Unable to access user's locale outside of a <GTProvider>").locale}function T(r){return r&&r.props&&r.props["data-generaltranslation"]?r.props["data-generaltranslation"]:null}var j={variable:"value",number:"n",datetime:"date",currency:"cost"};function k(r){var a,e=(null===(a=r["data-generaltranslation"])||void 0===a?void 0:a.variableType)||"variable";return{variableType:e,variableName:r.name||r["data-gt-variable-name"]||j[e],variableValue:void 0!==r.value?r.value:void 0!==r["data-gt-unformatted-value"]?r["data-gt-unformatted-value"]:void 0!==r.children?r.children:void 0,variableOptions:r.options||r["data-gt-variable-options"]||void 0}}function x(a){var e=void 0===a?{name:"n"}:a,n=e.children,t=e.name,i=void 0===t?"n":t,o=e.value,l=e.options,c=void 0===l?{}:l,s=[E(),O()],v=void 0!==n?n:o;return"number"==typeof(v="string"==typeof v?parseFloat(v):v)&&(v=u({value:v,languages:s,options:c})),r("span",{"data-gt-variable-name":i,"data-gt-variable-type":"number","data-gt-variable-options":JSON.stringify(c),children:v})}function A(a){var e=a.children,n=a.name,t=a.value;return r("span",{"data-gt-variable-name":n,"data-gt-variable-type":"variable",children:void 0!==e?e:t})}function P(a){var e=void 0===a?{name:"cost"}:a,n=e.children,t=e.name,i=void 0===t?"cost":t,o=e.value,l=e.currency,c=void 0===l?"USD":l,u=e.options,v=void 0===u?{}:u,d=[E(),O()],p=void 0!==n&&void 0===o?n:o;return"number"==typeof(p="string"==typeof p?parseFloat(p):p)&&(p=s({value:p,languages:d,currency:c,options:v})),r("span",{"data-gt-variable-name":i,"data-gt-variable-type":"currency","data-gt-variable-options":b({style:"currency",currency:c},v),children:p})}function V(a){var e,n,t=void 0===a?{name:"date"}:a,i=t.children,o=t.name,l=void 0===o?"date":o,c=t.value,u=t.options,s=void 0===u?{}:u,d=[E(),O()],p=void 0!==i&&void 0===c?i:c;return"number"==typeof p||"string"==typeof p?n=new Date(p):p instanceof Date&&(n=p),void 0!==n&&(e=v({value:n,languages:d,options:s}).replace(/[\u200F\u202B\u202E]/g,"")),r("span",{"data-gt-variable-name":l,"data-gt-variable-type":"date","data-gt-variable-options":s,children:e})}function N(r){if(r&&"object"==typeof r&&"string"==typeof r.key){var a=Object.keys(r);if(1===a.length)return!0;if(2===a.length){var e=r;return"string"==typeof e.variable&&["variable","number","date","currency"].includes(e.variable)}}return!1}x.gtTransformation="variable-number",A.gtTransformation="variable-variable",P.gtTransformation="variable-currency",V.gtTransformation="variable-datetime";var L="generaltranslation-locale",G="en",I=["singular","plural","dual","zero","one","two","few","many","other"];var F={};function S(r,e,n){void 0===n&&(n=0);var i=n,o=function(r){var a=r.type,e=r.props,n={id:i+=1},t="function"==typeof a&&a.gtTransformation||"";if(t){var o=t.split("-");if("variable"===o[0]&&(n.variableType=(null==o?void 0:o[1])||"variable"),"plural"===o[0]){var l=Object.entries(e).reduce((function(r,a){var e,n=a[0],t=a[1];return e=n,I.includes(e)&&(r[n]=S(t,n,i)),r}),{});Object.keys(l).length&&(n.branches=l)}if("branch"===o[0]){e.children,e.branch;var c=h(e,["children","branch"]),u=Object.entries(c).reduce((function(r,a){var e=a[0],n=a[1];return r[e]=S(n,e,i),r}),{});Object.keys(u).length&&(n.branches=u)}n.transformation=o[0]}return n};function l(r){if(t(r)){var n=r.props,i=o(r),l=b(b({},n),{"data-generaltranslation":i});return e&&(l.key=e,e=void 0),n.children&&(l.children=c(n.children)),a.cloneElement(r,l)}return r}function c(r){return Array.isArray(r)?(e=void 0,a.Children.map(r,l)):l(r)}return c(r)}function D(r,a,e){var n="",t=null;return"number"==typeof r&&!t&&e&&(n=function(r,a,e){var n=new Intl.PluralRules(a).select(r),t=Math.abs(r);if(0===t&&e.zero)return"zero";if(1===t){if(e.singular)return"singular";if(e.one)return"one"}if("one"===n&&e.singular)return"singular";if(2===t){if(e.dual)return"dual";if(e.two)return"two"}return"two"===n&&e.dual?"dual":e[n]?n:"two"===n&&e.dual?"dual":"two"===n&&e.plural?"plural":"two"===n&&e.other?"other":"few"===n&&e.plural?"plural":"few"===n&&e.other?"other":"many"===n&&e.plural?"plural":"many"===n&&e.other?"other":"other"===n&&e.plural?"plural":""}(r,a,e)),n&&!t&&(t=e[n]),t}function C(a){var e=a.variableType,n=a.variableName,t=a.variableValue,i=a.variableOptions;return"number"===e?r(x,{name:n,value:t,options:i}):"datetime"===e?r(V,{name:n,value:t,options:i}):"currency"===e?r(P,{name:n,value:t,options:i}):r(A,{name:n,value:t})}function U(r){var e,n=r.sourceElement,t=r.targetElement,i=r.variables,o=void 0===i?{}:i,l=r.variablesOptions,c=void 0===l?{}:l,u=r.locales,s=void 0===u?[G]:u,v=n.props,d=v["data-generaltranslation"],p=null==d?void 0:d.transformation;if("plural"===p){var f="number"==typeof o.n?o.n:"number"==typeof n.props.n?n.props.n:n.props["data-gt-n"],h=D(f,s,d.branches||{})||n.props.children,g=D(f,s,t.props["data-generaltranslation"].branches||{})||t.props.children;return a.createElement("span",b(b({},v),{"data-generaltranslation":void 0,children:z({source:h,target:g,variables:o,variablesOptions:c,locales:s})}))}if("branch"===p){var m=v.name,y=v.branch,w=v.children;y=o[m=m||n.props["data-gt-name"]||"branch"]||y||n.props["data-gt-branch-name"];h=(d.branches||{})[y]||w,g=(t.props["data-generaltranslation"].branches||{})[y]||t.props.children;return a.createElement("span",b(b({},v),{"data-generaltranslation":void 0,children:z({source:h,target:g,variables:o,variablesOptions:c,locales:s})}))}return(null==v?void 0:v.children)&&(null===(e=t.props)||void 0===e?void 0:e.children)?a.cloneElement(n,b(b({},v),{"data-generaltranslation":void 0,children:z({source:v.children,target:t.props.children,variables:o,variablesOptions:c,locales:s})})):n}function z(e){var n=e.source,t=e.target,i=e.variables,o=void 0===i?{}:i,l=e.variablesOptions,c=void 0===l?{}:l,u=e.locales,s=void 0===u?[G]:u;if(null==t&&n)return n;if("string"==typeof t)return t;if(Array.isArray(n)&&Array.isArray(t)){var v=n.filter((function(r){if(a.isValidElement(r)){var e=T(r);if(k(r.props),"variable"!==(null==e?void 0:e.transformation))return!0;var n=k(r.props),t=n.variableName,i=n.variableValue,l=n.variableOptions;void 0===o[t]&&(o[t]=i),c[t]=b(b({},c[t]),l)}}));return t.map((function(e,n){if("string"==typeof e)return r(a.Fragment,{children:e},"string_".concat(n));if(N(e))return r(a.Fragment,{children:C({variableType:e.variable||"variable",variableName:e.key,variableValue:o[e.key],variableOptions:c[e.key]})},"var_".concat(n));var t,i=(t=e,v.find((function(r){var a,e,n=T(r);return void 0!==(null==n?void 0:n.id)&&n.id===(null===(e=null===(a=null==t?void 0:t.props)||void 0===a?void 0:a["data-generaltranslation"])||void 0===e?void 0:e.id)})));return i?r(a.Fragment,{children:U({sourceElement:i,targetElement:e,variables:o,variablesOptions:c,locales:s})},"element_".concat(n)):void 0}))}if(t&&"object"==typeof t&&!Array.isArray(t)){var d=N(t)?"variable":"element";if(a.isValidElement(n)){if("element"===d)return U({sourceElement:n,targetElement:t,variables:o,variablesOptions:c,locales:s});var p=T(n);if("variable"===(null==p?void 0:p.transformation)){var f=k(n.props),h=f.variableName,g=f.variableValue,m=f.variableOptions;void 0===o[h]&&(o[h]=g),c[h]=b(b({},c[h]),m)}}if("variable"===d){var y=t;return C({variableType:y.variable||"variable",variableName:y.key,variableValue:o[y.key],variableOptions:c[y.key]})}}}function R(r){var e=r.children,n=r.variables,t=void 0===n?{}:n,i=r.variablesOptions,o=void 0===i?{}:i,l=r.defaultLocale,c=void 0===l?G:l,u=function(r){if(a.isValidElement(r)){var e=T(r);if("variable"===(null==e?void 0:e.transformation)){var n=k(r.props),i=n.variableName,l=n.variableType,u=n.variableValue,v=n.variableOptions;return C({variableName:i,variableType:l,variableValue:u=void 0!==t[i]?t[i]:u,variableOptions:b(b({},o[i]),v)})}if("plural"===(null==e?void 0:e.transformation)){var d="number"==typeof t.n?t.n:"number"==typeof r.props.n?r.props.n:r.props["data-gt-n"],p=e.branches||{};return a.createElement("span",b(b({},r.props),{"data-generaltranslation":void 0,children:s(D(d,[c],p)||r.props.children)}))}if("branch"===(null==e?void 0:e.transformation)){var f=r.props;f.children;var g=f.name,m=f.branch;p=h(f,["children","name","branch"]);return g=g||r.props["data-gt-name"]||"branch",m=t[g]||m||r.props["data-gt-branch-name"],p=e.branches||{},a.createElement("span",b(b({},r.props),{"data-generaltranslation":void 0,children:s(p[m])}))}if(r.props.children)return a.cloneElement(r,b(b({},r.props),{"data-generaltranslation":void 0,children:s(r.props.children)}))}return r},s=function(r){return Array.isArray(r)?a.Children.map(r,u):u(r)};return s(e)}function _(r){void 0===r&&(r="");var a=function(a){return r?"".concat(r,".").concat(a):a},e=w("useGT('".concat(r,"'): No context provided. You're trying to get the t() function on the client, which can only be done inside a <GTProvider>.")).translate;return function(r,n,t){void 0===r&&(r=""),void 0===n&&(n={});var i=a(r),o=e?e(i,n,t):void 0;return o||console.warn("t('".concat(r,"') finding no translation for dictionary item ").concat(i," !")),o}}function q(e){var n=e.children,t=e.id,o=h(e,["children","id"]);if(!t)throw new Error("Client-side <T> with no provided 'id' prop. Children: ".concat(n));var l=o.variables,c=o.variablesOptions,u=w('<T id="'.concat(t,'"> used on the client-side outside of <GTProvider>')).translations,s=_();if(!n)return r(a.Fragment,{children:s(t,b({variables:l},c&&{variablesOptions:c}))},t);var v=E(),p=O(),f=i((function(){return S(n)}),[n]);if(!(!!v&&!d(v,p)))return R({children:f,variables:l,variablesOptions:c,defaultLocale:p});var g=u[t];if(!g||!g.t)throw new Error('<T id="'.concat(t,'"> is used in a client component without a corresponding translation.'));return z({source:f,target:g.t,variables:l,variablesOptions:c,locales:[v,p]})}function B(r,a){void 0===r&&(r=G),void 0===a&&(a=L);var e=o(""),n=e[0],t=e[1];return l((function(){var e=(a?function(r){void 0===r&&(r=L);for(var a=0,e=document.cookie.split("; ");a<e.length;a++){var n=e[a].split("="),t=n[0],i=n[1];if(t===r)return decodeURIComponent(i)}return null}(a):void 0)||navigator.language||(null===navigator||void 0===navigator?void 0:navigator.userLanguage)||r;t(e)}),[r]),n}function J(e){var n=this,t=e.children,i=e.projectID,u=e.dictionary,s=void 0===u?F:u,v=e.dictionaryName,b=void 0===v?"default":v,h=e.locales,w=e.defaultLocale,O=void 0===w?(null==h?void 0:h[0])||G:w,E=e.locale,T=e.cacheURL,j=void 0===T?"https://cache.gtx.dev":T;if(!i&&"https://cache.gtx.dev"===j)throw new Error("gt-react Error: General Translation cloud services require a project ID! Find yours at www.generaltranslation.com/dashboard.");var k=B(O);E=E||k,h&&(E=p([E,k],h)||E);var x=!E||!d(E,O),A=o(j?null:{}),P=A[0],V=A[1];l((function(){P||(x?g(n,void 0,void 0,(function(){var r;return m(this,(function(a){switch(a.label){case 0:return[4,fetch("".concat(j,"/").concat(i,"/").concat(E,"/").concat(b))];case 1:return[4,a.sent().json()];case 2:return r=a.sent(),V(r),[2]}}))})):V({}))}),[P,x]);var N=c((function(r,e,n){void 0===e&&(e={});var t=function(r){if(Array.isArray(r)){if(1===r.length)return{entry:r[0]};if(2===r.length)return{entry:r[0],metadata:r[1]}}return{entry:r}}(function(r,e){if(!e||"string"!=typeof e)throw new Error('Invalid dictionary id: "'.concat(e,'"'));for(var n=r,t=0,i=e.split(".");t<i.length;t++){var o=i[t];if("object"!=typeof n||Array.isArray(n)||a.isValidElement(n))throw new Error('Invalid dictionary id: "'.concat(e,'"'));n=n[o]}return n}(s,r)),i=t.entry,o=t.metadata;if(null!=i){var l,c;e&&(l=e,(null==o?void 0:o.variablesOptions)&&(c=o.variablesOptions)),"function"==typeof n?i=n(e):"function"==typeof i&&(i=i(e));var u=S(i,r);if(!x)return"string"==typeof u?f(u,O,l,c):R({children:u,variables:l,variablesOptions:c,defaultLocale:O});if(P){var v=P[r];return"string"==typeof u?f(v.t,[E,O],l,c):z({source:u,target:v.t,variables:l,variablesOptions:c,locales:[E,O]})}}else console.warn('Dictionary entry with id "'.concat(r,'" is null or undefined'))}),[s,P,x,O]);return r(y.Provider,{value:{translate:N,locale:E,defaultLocale:O,translations:P},children:P&&k?t:void 0})}function M(a){var e=a.children,n=a.n,t=h(a,["children","n"]),i=t["data-generaltranslation"],o=h(t,["data-generaltranslation"]),l=E(),c=O();if("number"!=typeof n)throw new Error('Plural with children "'.concat(e,'" requires "n" option.'));var u=D(n,[l,c],o)||e;return r("span",{"data-generaltranslation":i,"data-gt-n":n,children:u})}function Y(a){var e=a.children,n=a.name,t=void 0===n?"branch":n,i=a.branch,o=h(a,["children","name","branch"]),l=o["data-generaltranslation"],c=h(o,["data-generaltranslation"]),u=i&&void 0!==c[i]?c[i]:e;return r("span",{"data-generaltranslation":l,"data-gt-name":t||"branch","data-gt-branch-name":i,children:u})}M.gtTransformation="plural",Y.gtTransformation="branch";export{Y as Branch,P as Currency,V as DateTime,J as GTProvider,x as Num,M as Plural,q as T,A as Var,O as useDefaultLocale,_ as useGT,E as useLocale};
//# sourceMappingURL=index.esm.js.map
