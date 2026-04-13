const chips = document.querySelectorAll(".chip");
const cards = document.querySelectorAll(".product-card");
const addButtons = document.querySelectorAll(".add-to-cart");
const quickButtons = document.querySelectorAll(".quick-btn");
const productLinks = document.querySelectorAll(".product-link");
const cartCount = document.getElementById("cartCount");
const cartPanel = document.getElementById("cartPanel");
const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartSubtotal = document.getElementById("cartSubtotal");
const openCart = document.querySelector(".cart-trigger");
const closeCartNodes = document.querySelectorAll("[data-close-cart]");
const menuTrigger = document.querySelector(".menu-trigger");
const mobileMenu = document.getElementById("mobileMenu");
const categoriesModal = document.getElementById("categoriesListModal");
const categoriesPanel = document.querySelector(".categories-list-panel");
const openCategoriesNodes = document.querySelectorAll("[data-open-categories]");
const closeCategoriesNodes = document.querySelectorAll("[data-close-categories]");
const carousel = document.getElementById("mainCarousel");
const track = document.querySelector(".carousel-track");
const slides = document.querySelectorAll(".carousel-slide");
const dots = document.querySelectorAll(".dot");
const quickPreview = document.getElementById("quickPreview");
const productDetail = document.getElementById("productDetail");
const previewBrand = document.getElementById("previewBrand");
const previewTitle = document.getElementById("previewTitle");
const previewPrice = document.getElementById("previewPrice");
const previewDescription = document.getElementById("previewDescription");
const previewImage = document.getElementById("previewImage");
const previewAddToBag = document.getElementById("previewAddToBag");
const openDetailFromPreview = document.getElementById("openDetailFromPreview");
const detailBrand = document.getElementById("detailBrand");
const detailTitle = document.getElementById("detailTitle");
const detailPrice = document.getElementById("detailPrice");
const detailDescription = document.getElementById("detailDescription");
const detailSpecs = document.getElementById("detailSpecs");
const detailImage = document.getElementById("detailImage");
const detailAddToBag = document.getElementById("detailAddToBag");
const closeQuick = document.querySelectorAll("[data-close-modal]");
const closeDetail = document.querySelectorAll("[data-close-detail]");
const timeDays = document.getElementById("timeDays");
const timeHours = document.getElementById("timeHours");
const timeMinutes = document.getElementById("timeMinutes");
const timeSeconds = document.getElementById("timeSeconds");

let count = 0;
let currentSlide = 0;
let autoplayTimer = null;
let touchStartX = 0;
let touchEndX = 0;
let activeProductCard = null;
const cartState = new Map();
const offerEndDate = new Date(Date.now() + ((2 * 24 + 5) * 60 + 56) * 60 * 1000 + 14 * 1000);

menuTrigger?.addEventListener("click", () => {
  if (!mobileMenu) {
    return;
  }
  closeCategoriesList();
  const isOpen = mobileMenu.classList.toggle("is-open");
  menuTrigger.setAttribute("aria-expanded", String(isOpen));
});

mobileMenu?.querySelectorAll("a, button").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("is-open");
    menuTrigger?.setAttribute("aria-expanded", "false");
  });
});

function openCategoriesList(triggerNode) {
  if (!categoriesModal) {
    return;
  }
  mobileMenu?.classList.remove("is-open");
  menuTrigger?.setAttribute("aria-expanded", "false");

  if (categoriesPanel) {
    if (window.innerWidth > 760 && triggerNode instanceof HTMLElement) {
      const triggerRect = triggerNode.getBoundingClientRect();
      const panelWidth = Math.min(360, window.innerWidth * 0.92);
      const minLeft = 16;
      const maxLeft = window.innerWidth - panelWidth - 16;
      const alignedLeft = Math.max(minLeft, Math.min(triggerRect.left - 18, maxLeft));
      categoriesPanel.style.left = `${alignedLeft}px`;
      categoriesPanel.style.top = `${Math.round(triggerRect.bottom + 10)}px`;
      categoriesPanel.style.right = "auto";
      categoriesPanel.style.transform = "none";
    } else {
      categoriesPanel.style.left = "";
      categoriesPanel.style.top = "";
      categoriesPanel.style.right = "";
      categoriesPanel.style.transform = "";
    }
  }

  categoriesModal.classList.add("is-open");
  categoriesModal.hidden = false;
  categoriesModal.setAttribute("aria-hidden", "false");
}

function closeCategoriesList() {
  if (!categoriesModal) {
    return;
  }
  categoriesModal.classList.remove("is-open");
  categoriesModal.hidden = true;
  categoriesModal.setAttribute("aria-hidden", "true");
}

openCategoriesNodes.forEach((node) => {
  node.addEventListener("click", () => {
    openCategoriesList(node);
  });
});

closeCategoriesNodes.forEach((node) => {
  node.addEventListener("click", closeCategoriesList);
});

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((node) => node.classList.remove("is-active"));
    chip.classList.add("is-active");

    const filter = chip.dataset.filter;
    cards.forEach((card) => {
      const match = filter === "all" || card.dataset.category === filter;
      card.style.display = match ? "grid" : "none";
    });
  });
});

function showCartPanel() {
  cartPanel.classList.add("is-open");
  cartPanel.setAttribute("aria-hidden", "false");
}

function hideCartPanel() {
  cartPanel.classList.remove("is-open");
  cartPanel.setAttribute("aria-hidden", "true");
}

addButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".product-card");
    addToBag(card || activeProductCard);
  });
});

openCart?.addEventListener("click", () => {
  if (cartPanel.classList.contains("is-open")) {
    hideCartPanel();
    return;
  }
  showCartPanel();
});

closeCartNodes.forEach((node) => {
  node.addEventListener("click", hideCartPanel);
});

cartItems?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const removeName = target.getAttribute("data-remove-name");
  if (!removeName) {
    return;
  }
  removeFromBag(removeName);
});

function parsePrice(priceText) {
  const value = Number((priceText || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

function getTotalCount() {
  return [...cartState.values()].reduce((sum, item) => sum + item.quantity, 0);
}

function getSubtotal() {
  return [...cartState.values()].reduce((sum, item) => sum + item.priceValue * item.quantity, 0);
}

function renderCart() {
  if (!cartItems || !cartEmpty || !cartSubtotal) {
    return;
  }

  cartItems.innerHTML = "";
  const entries = [...cartState.values()];
  const isEmpty = entries.length === 0;
  cartEmpty.style.display = isEmpty ? "block" : "none";

  entries.forEach((item) => {
    const row = document.createElement("article");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item-media ${item.visualClass}"></div>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-meta">Cant: ${item.quantity}</p>
        <button class="cart-item-remove" type="button" data-remove-name="${item.name}">Eliminar</button>
      </div>
      <p class="cart-item-price">$${(item.priceValue * item.quantity).toFixed(2)}</p>
    `;
    cartItems.appendChild(row);
  });

  cartSubtotal.textContent = `$${getSubtotal().toFixed(2)}`;
  cartCount.textContent = String(getTotalCount());
}

function addToBag(card) {
  if (!card) {
    return;
  }
  const data = getProductData(card);
  const currentItem = cartState.get(data.name);
  const priceValue = parsePrice(data.price);
  const nextQuantity = currentItem ? currentItem.quantity + 1 : 1;
  cartState.set(data.name, {
    name: data.name,
    priceValue,
    quantity: nextQuantity,
    visualClass: data.visualClass
  });
  count = getTotalCount();
  renderCart();
  showCartPanel();
}

function removeFromBag(name) {
  if (!name || !cartState.has(name)) {
    return;
  }
  cartState.delete(name);
  count = getTotalCount();
  renderCart();
}

function getProductVisualClass(card) {
  const imageNode = card.querySelector(".product-image");
  if (!imageNode) {
    return "";
  }
  const visualClass = [...imageNode.classList].find((className) => className !== "product-image");
  return visualClass || "";
}

function setVisual(el, visualClass) {
  if (!el) {
    return;
  }
  el.className = el.id === "detailImage" ? "detail-main-image" : "modal-image";
  if (visualClass) {
    el.classList.add(visualClass);
  }
}

function getProductData(card) {
  return {
    brand: card.dataset.brand || "",
    name: card.dataset.name || "",
    price: card.dataset.price || "",
    description: card.dataset.description || "",
    specs: (card.dataset.specs || "").split("|").filter(Boolean),
    visualClass: getProductVisualClass(card)
  };
}

function openQuickPreview(card) {
  activeProductCard = card;
  const data = getProductData(card);
  previewBrand.textContent = data.brand;
  previewTitle.textContent = data.name;
  previewPrice.textContent = data.price;
  previewDescription.textContent = data.description;
  setVisual(previewImage, data.visualClass);
  quickPreview.classList.add("is-open");
  quickPreview.setAttribute("aria-hidden", "false");
}

function closeQuickPreview() {
  quickPreview.classList.remove("is-open");
  quickPreview.setAttribute("aria-hidden", "true");
}

function openProductDetail(card) {
  activeProductCard = card;
  const data = getProductData(card);
  detailBrand.textContent = data.brand;
  detailTitle.textContent = data.name;
  detailPrice.textContent = data.price;
  detailDescription.textContent = data.description;
  detailSpecs.innerHTML = "";
  data.specs.forEach((spec) => {
    const li = document.createElement("li");
    li.textContent = spec;
    detailSpecs.appendChild(li);
  });
  setVisual(detailImage, data.visualClass);
  productDetail.classList.add("is-open");
  productDetail.setAttribute("aria-hidden", "false");
}

function closeProductDetail() {
  productDetail.classList.remove("is-open");
  productDetail.setAttribute("aria-hidden", "true");
}

quickButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".product-card");
    if (!card) {
      return;
    }
    openQuickPreview(card);
  });
});

productLinks.forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".product-card");
    if (!card) {
      return;
    }
    openProductDetail(card);
  });
});

closeQuick.forEach((node) => {
  node.addEventListener("click", closeQuickPreview);
});

closeDetail.forEach((node) => {
  node.addEventListener("click", closeProductDetail);
});

previewAddToBag?.addEventListener("click", () => {
  addToBag(activeProductCard);
  closeQuickPreview();
});

openDetailFromPreview?.addEventListener("click", () => {
  if (!activeProductCard) {
    return;
  }
  closeQuickPreview();
  openProductDetail(activeProductCard);
});

detailAddToBag?.addEventListener("click", () => {
  addToBag(activeProductCard);
  closeProductDetail();
});

renderCart();

function updateOfferTimer() {
  if (!timeDays || !timeHours || !timeMinutes || !timeSeconds) {
    return;
  }
  const now = Date.now();
  const diff = Math.max(0, offerEndDate.getTime() - now);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  timeDays.textContent = String(days).padStart(2, "0");
  timeHours.textContent = String(hours).padStart(2, "0");
  timeMinutes.textContent = String(minutes).padStart(2, "0");
  timeSeconds.textContent = String(seconds).padStart(2, "0");
}

updateOfferTimer();
setInterval(updateOfferTimer, 1000);

function goToSlide(index) {
  if (!track || !slides.length || !dots.length) {
    return;
  }

  const total = slides.length;
  currentSlide = (index + total) % total;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === currentSlide);
  });

  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === currentSlide);
  });
}

function startAutoplay() {
  if (!carousel || slides.length < 2) {
    return;
  }
  clearInterval(autoplayTimer);
  autoplayTimer = setInterval(() => {
    goToSlide(currentSlide + 1);
  }, 4800);
}

if (carousel && track && slides.length && dots.length) {
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      goToSlide(index);
      startAutoplay();
    });
  });

  carousel.addEventListener("mouseenter", () => {
    clearInterval(autoplayTimer);
  });

  carousel.addEventListener("mouseleave", startAutoplay);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(autoplayTimer);
      return;
    }
    startAutoplay();
  });

  carousel.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
    clearInterval(autoplayTimer);
  }, { passive: true });

  carousel.addEventListener("touchend", (event) => {
    touchEndX = event.changedTouches[0].clientX;
    const swipeDistance = touchStartX - touchEndX;

    if (Math.abs(swipeDistance) > 40) {
      if (swipeDistance > 0) {
        goToSlide(currentSlide + 1);
      } else {
        goToSlide(currentSlide - 1);
      }
    }

    startAutoplay();
  }, { passive: true });

  goToSlide(0);
  startAutoplay();
}
