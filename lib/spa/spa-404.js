/**
 * SPA GitHub Pages
 * @copyright (c) 2016 Rafael Pedicini, (c) 2020 Six
 * @preserve
 */
(()=>{const e=window.location;e.replace(e.protocol+"//"+e.hostname+(e.port?":"+e.port:"")+e.pathname.split("/").slice(0,1).join("/")+"/?/"+e.pathname.slice(1).split("/").slice(0).join("/").replace(/&/g,"~and~")+(e.search?"&"+e.search.slice(1).replace(/&/g,"~and~"):"")+e.hash)})();