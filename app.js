// Frontend demo only. Supplier credentials must stay in Cloudflare Worker secrets.
const state={products:[],filter:"all",sort:"featured",visible:10,bag:0};
const $=s=>document.querySelector(s);
const money=n=>"৳"+Number(n||0).toLocaleString("en-BD");
const samples=[
 {id:"demo1",name:"নিশা | গর্জিয়াস এমব্রয়ডারি জর্জেট শাড়ি",category:"saree",original_price:2650,price:2950,colors:["কালো","মেরুন"]},
 {id:"demo2",name:"প্রিমিয়াম এমব্রয়ডারি থ্রি-পিস",category:"three-piece",original_price:1850,price:2200,colors:["ক্রিম","মেরুন"]},
 {id:"demo3",name:"এলিগ্যান্ট পার্টি ওয়্যার শাড়ি",category:"saree",original_price:2350,price:2700,colors:["কালো"]},
 {id:"demo4",name:"ক্লাসিক প্রিন্টেড থ্রি-পিস",category:"three-piece",original_price:1450,price:1750,colors:["নীল","সবুজ"]},
 {id:"demo5",name:"ফেস্টিভ এমব্রয়ডারি শাড়ি",category:"saree",original_price:3200,price:3600,colors:["লাল","মেরুন"]},
 {id:"demo6",name:"সফট জর্জেট থ্রি-পিস",category:"three-piece",original_price:1650,price:1950,colors:["গোলাপি","নীল"]},
 {id:"demo7",name:"রয়্যাল পার্টি শাড়ি",category:"saree",original_price:2850,price:3200,colors:["বেগুনি","কালো"]},
 {id:"demo8",name:"ডেইলি এলিগ্যান্স থ্রি-পিস",category:"three-piece",original_price:1250,price:1500,colors:["সবুজ","ক্রিম"]}
];
function normalize(p){const current=Number(p.original_price??p.price??0),old=Number(p.price??0);return {...p,id:p.id??p.slug,name:p.name_bn??p.name??"প্রোডাক্ট",current,old:old>current?old:null,discount:old>current?Math.round((old-current)/old*100):0,category:p.category??(String(p.name_bn??p.name??"").includes("শাড়ি")?"saree":String(p.name_bn??p.name??"").includes("থ্রি-পিস")?"three-piece":"all")}}
function card(p){const colors=(p.colors||[]).slice(0,3).map(c=>`<span>${esc(c)}</span>`).join("");return `<article class="product-card"><div class="product-image-wrap"><div class="sample-art"><span>RUPAI</span></div>${p.discount?`<span class="product-badge">${p.discount}% ছাড়</span>`:""}<button class="quick-add" data-add="${esc(p.id)}">ব্যাগে যোগ করুন +</button></div><div class="product-info"><div class="product-category">${p.category==="saree"?"SAREE":p.category==="three-piece"?"THREE-PIECE":"RUPAI COLLECTION"}</div><h3 class="product-name">${esc(p.name)}</h3><div class="prices"><span class="current-price">${money(p.current)}</span>${p.old?`<span class="old-price">${money(p.old)}</span><span class="discount">${p.discount}% OFF</span>`:""}</div><div class="color-list">${colors}</div></div></article>`}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function render(){let list=state.products.filter(p=>state.filter==="all"||p.category===state.filter);if(state.sort==="low")list.sort((a,b)=>a.current-b.current);if(state.sort==="high")list.sort((a,b)=>b.current-a.current);$("#productGrid").innerHTML=list.slice(0,state.visible).map(card).join("")||'<div class="empty">এই ক্যাটাগরিতে আপাতত কোনো প্রোডাক্ট নেই।</div>';$("#productCount").textContent=`${list.length}টি প্রোডাক্ট`;$("#moreBtn").hidden=state.visible>=list.length}
state.products=samples.map(normalize);$("#apiStatus").textContent="ডেমো প্রিভিউ — এই কার্ডগুলো নমুনা, লাইভ সাপ্লায়ার ডেটা নয়। Worker সংযুক্ত হলে আসল ছবি ও প্রোডাক্ট দেখানো হবে।";render();$("#year").textContent=new Date().getFullYear();
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");state.filter=b.dataset.filter;state.visible=10;render()}));
document.querySelectorAll(".category[data-filter]").forEach(b=>b.addEventListener("click",()=>{state.filter=b.dataset.filter;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x.dataset.filter===state.filter));state.visible=10;render()}));
$("#sortSelect").addEventListener("change",e=>{state.sort=e.target.value;render()});$("#moreBtn").addEventListener("click",()=>{state.visible+=10;render()});
$("#productGrid").addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(!b)return;state.bag++;$("#bagCount").textContent=state.bag;toast("ডেমো: প্রোডাক্ট ব্যাগে যোগ হয়েছে। অর্ডার সিস্টেম এখনো সংযুক্ত নয়।")});
$("#bagBtn").addEventListener("click",()=>toast("শপিং ব্যাগ ও চেকআউট পরের ধাপে যুক্ত হবে।"));
$("#searchBtn").addEventListener("click",()=>{const q=prompt("কোন প্রোডাক্ট খুঁজছেন?");if(q===null)return;const needle=q.trim().toLowerCase();const matches=state.products.filter(p=>p.name.toLowerCase().includes(needle));$("#productGrid").innerHTML=matches.map(card).join("")||'<div class="empty">কোনো মিল পাওয়া যায়নি।</div>';$("#productCount").textContent=`${matches.length}টি ফলাফল`;$("#moreBtn").hidden=true;$("#products").scrollIntoView()});
$("#menuBtn").addEventListener("click",()=>$("#nav").classList.toggle("open"));
let toastTimer;function toast(t){$("#toast").textContent=t;$("#toast").classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("#toast").classList.remove("show"),2600)}
