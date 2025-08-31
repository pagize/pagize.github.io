/**
 * SPA GitHub Pages
 * @copyright (c) 2016 Rafael Pedicini, (c) 2020 Sixcious
 * @preserve
 */
(()=>{const n=window.location;if("/"===n.search[1]){const a=n.search.slice(1).split("&").map(function(n){return n.replace(/~and~/g,"&")}).join("?");window.history.replaceState(null,null,n.pathname.slice(0,-1)+a+n.hash)}})();