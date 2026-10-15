
const state = {
  products: [],
  filter: "all",
  sort: "featured",
  visible: 10,
  bag: 0,
  query: ""
};

const $ = s => document.querySelector(s);
const money = n => "৳" + Number(n || 0).toLocaleString("en-BD");

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  }[c]));
}

function normalize(p) {
  const current = Number(p.original_price ?? p.price ?? 0);
  const old = Number(p.price ?? 0);
  const name = p.name_bn || p.name || "প্রোডাক্ট";
  let category = "all";

  if (/শাড়ি|শাড়ি|saree/i.test(name)) category = "saree";
  else if (/থ্রি[\\s-]?পিস|থ্রিপিস|three[\\s-]?piece/i.test(name)) category = "three-piece";

  const images = Array.isArray(p.images)
    ? p.images.filter(x => typeof x === "string" && /^https?:\/\//i.test(x))
    : [];

  let colors = [];
  if (p.color_sizes && typeof p.color_sizes === "object") colors = Object.keys(p.color_sizes);
  if (!colors.length && p.color_images && typeof p.color_images === "object") colors = Object.keys(p.color_images);

  return {
    ...p,
    id: String(p.id ?? p.slug ?? name),
    name,
    current,
    old: old > current ? old : null,
    discount: old > current ? Math.round((old - current) / old * 100) : 0,
    category,
    images,
    colors
  };
}

function card(p) {
  const image = p.images[0];
  const colors = p.colors.slice(0, 3).map(c => `<span>${esc(c)}</span>`).join("");

  return `
    <article class="product-card">
      <div class="product-image-wrap">
        ${image
          ? `<img class="product-image" src="${esc(image)}" alt="${esc(p.name)}" loading="lazy">`
          : `<div class="sample-art"><span>RUPAI</span></div>`}
        ${p.discount ? `<span class="product-badge">${p.discount}% ছাড়</span>` : ""}
        <button class="quick-add" data-add="${esc(p.id)}">ব্যাগে যোগ করুন +</button>
      </div>
      <div class="product-info">
        <div class="product-category">${p.category === "saree" ? "SAREE" : p.category === "three-piece" ? "THREE-PIECE" : "RUPAI COLLECTION"}</div>
        <h3 class="product-name">${esc(p.name)}</h3>
        <div class="prices">
          <span class="current-price">${money(p.current)}</span>
          ${p.old ? `<span class="old-price">${money(p.old)}</span><span class="discount">${p.discount}% OFF</span>` : ""}
        </div>
        <div class="color-list">${colors}</div>
      </div>
    </article>`;
}


    function renderHeroProducts() {
          const host = document.querySelector("#heroProductCollage");
        
          if (!host || !state.products.length) return;
        
          const featured = state.products
            .filter(p => Array.isArray(p.images) && p.images.length > 0)
            .slice(0, 4);
        
          if (!featured.length) return;
        
          host.innerHTML = featured.map(p => {
            const image = p.images[0];
            const discount = Number(p.discount) > 0
              ? `<span class="hero-product-discount">-${Number(p.discount)}%</span>`
              : "";
        
            const oldPrice = p.old > p.current
              ? `<del>${money(p.old)}</del>`
              : "";
        
            return `
              <article class="hero-product-card">
                <img
                  src="${esc(image)}"
                  alt="${esc(p.name)}"
                  loading="eager"
                >
                ${discount}
                <div class="hero-product-price">
                  <span>${money(p.current)}</span>
                  ${oldPrice}
                </div>
              </article>
            `;
          }).join("");
        }


function render() {
        const query = state.query.trim().toLocaleLowerCase("bn");
      
        const aliases = {
          "saree": ["শাড়ি", "শাড়ি", "saree", "sari"],
          "শাড়ি": ["শাড়ি", "শাড়ি", "saree", "sari"],
          "শাড়ি": ["শাড়ি", "শাড়ি", "saree", "sari"],
          "three piece": ["থ্রি-পিস", "থ্রিপিস", "three piece", "three-piece"],
          "three-piece": ["থ্রি-পিস", "থ্রিপিস", "three piece", "three-piece"],
          "থ্রি-পিস": ["থ্রি-পিস", "থ্রিপিস", "three piece", "three-piece"]
        };
      
        const terms = aliases[query] || [query];
      
        let list = state.products.filter(p => {
          const categoryMatch =
            state.filter === "all" || p.category === state.filter;
      
          const searchable = [
            p.name,
            p.name_bn,
            p.slug,
            p.id,
            p.category,
            ...(p.colors || []),
            p.current,
            p.old,
            p.price,
            p.original_price
          ].join(" ").toLocaleLowerCase("bn");
      
          const queryMatch =
            !query || terms.some(term => searchable.includes(term));
      
          return categoryMatch && queryMatch;
        });
      
        if (state.sort === "low") {
          list.sort((a, b) => a.current - b.current);
        }
      
        if (state.sort === "high") {
          list.sort((a, b) => b.current - a.current);
        }
      
        $("#productGrid").innerHTML =
          list.slice(0, state.visible).map(card).join("") ||
          '<div class="empty">কোনো প্রোডাক্ট পাওয়া যায়নি। অন্য নামে চেষ্টা করুন।</div>';
      
        $("#productCount").textContent = query
          ? `${list.length}টি সার্চ ফলাফল`
          : `${list.length}টি প্রোডাক্ট`;
      
        $("#moreBtn").hidden = state.visible >= list.length;
      }


async function loadProducts() {
  $("#apiStatus").textContent = "আসল প্রোডাক্ট লোড হচ্ছে...";
  try {
    const response = await fetch("https://rupai-api.rupaishopbd.workers.dev/products");
    if (!response.ok) throw new Error("API error: " + response.status);
    const result = await response.json();
    if (!result.success || !Array.isArray(result.products)) throw new Error("Invalid product response");

    state.products = result.products.map(normalize);
    renderHeroProducts();
    state.visible = 10;
    $("#apiStatus").textContent = `লাইভ ক্যাটালগ · ${state.products.length}টি প্রোডাক্ট`;
    render();
  } catch (error) {
    console.error("Product loading failed:", error);
    $("#apiStatus").textContent = "প্রোডাক্ট লোড করা যায়নি। পেজ রিফ্রেশ করে আবার চেষ্টা করো।";
    $("#productGrid").innerHTML = '<div class="empty">এই মুহূর্তে প্রোডাক্ট লোড করা যাচ্ছে না।</div>';
    $("#productCount").textContent = "0টি প্রোডাক্ট";
    $("#moreBtn").hidden = true;
  }
}

$("#year").textContent = new Date().getFullYear();

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    state.filter = button.dataset.filter;
    state.visible = 10;
    render();
  });
});

document.querySelectorAll(".category[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b.dataset.filter === state.filter));
    state.visible = 10;
    render();
    $("#products").scrollIntoView({ behavior: "smooth" });
  });
});

$("#sortSelect").addEventListener("change", event => {
  state.sort = event.target.value;
  render();
});

$("#moreBtn").addEventListener("click", () => {
  state.visible += 10;
  render();
});

$("#productGrid").addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  state.bag++;
  $("#bagCount").textContent = state.bag;
  toast("প্রোডাক্ট ব্যাগে যোগ হয়েছে। অর্ডার সিস্টেম এখনো যুক্ত হয়নি।");
});

$("#bagBtn").addEventListener("click", () => toast("শপিং ব্যাগ ও চেকআউট পরের ধাপে যুক্ত হবে।"));

function closeSearch() {
  $("#searchControl").classList.remove("open");
  $("#searchBtn").setAttribute("aria-expanded", "false");
  $("#searchInput").value = "";
  state.query = "";
  state.visible = 10;
  render();
}

$("#searchBtn").addEventListener("click", () => {
  const control = $("#searchControl");
  const opening = !control.classList.contains("open");
  control.classList.toggle("open", opening);
  $("#searchBtn").setAttribute("aria-expanded", String(opening));
  if (opening) {
    setTimeout(() => $("#searchInput").focus(), 120);
  } else {
    closeSearch();
  }
});

$("#searchForm").addEventListener("submit", event => event.preventDefault());
$("#searchInput").addEventListener("input", event => {
  state.query = event.target.value;
  state.visible = 10;
  render();
});
$("#searchClose").addEventListener("click", closeSearch);

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && $("#searchControl").classList.contains("open")) {
    closeSearch();
    $("#searchBtn").focus();
  }
});

$("#menuBtn").addEventListener("click", () => $("#nav").classList.toggle("open"));

let toastTimer;
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 2600);
}

loadProducts();
