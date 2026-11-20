/**
 * JuliFor3D — Lógica de la página pública (index.html)
 */

(function () {
  const DS = window.JuliForData;

  const state = {
    categories: [],
    products: [],
    selectedCategory: "all",
    searchQuery: "",
    selectedFile: null
  };

  // Referencias del DOM
  const els = {
    demoBanner: document.getElementById("demoBanner"),
    navToggle: document.getElementById("navToggle"),
    navLinks: document.getElementById("navLinks"),
    catalogSearch: document.getElementById("catalogSearch"),
    categoryFilters: document.getElementById("categoryFilters"),
    catalogGrid: document.getElementById("catalogGrid"),

    // Modal producto
    productModal: document.getElementById("productModal"),
    modalCloseBtn: document.getElementById("modalCloseBtn"),
    modalProductImg: document.getElementById("modalProductImg"),
    modalProductCat: document.getElementById("modalProductCat"),
    modalProductTitle: document.getElementById("modalProductTitle"),
    modalProductPrice: document.getElementById("modalProductPrice"),
    modalProductDesc: document.getElementById("modalProductDesc"),
    modalWhatsappBtn: document.getElementById("modalWhatsappBtn"),

    // Formulario Mi idea
    ideaForm: document.getElementById("ideaForm"),
    ideaFile: document.getElementById("ideaFile"),
    fileDropzone: document.getElementById("fileDropzone"),
    fileSelectedPill: document.getElementById("fileSelectedPill"),
    fileSelectedName: document.getElementById("fileSelectedName"),
    fileClearBtn: document.getElementById("fileClearBtn"),
    ideaSubmitBtn: document.getElementById("ideaSubmitBtn"),
    ideaFeedback: document.getElementById("ideaFeedback"),

    toastContainer: document.getElementById("toastContainer")
  };

  // Utilidad anti-XSS
  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showToast(message, type = "info") {
    if (!els.toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    els.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(20px)";
      toast.style.transition = "all 0.25s ease";
      setTimeout(() => toast.remove(), 260);
    }, 3600);
  }

  // ---- Navbar móvil ----
  function initNavbar() {
    if (!els.navToggle || !els.navLinks) return;

    els.navToggle.addEventListener("click", () => {
      const isOpen = els.navLinks.classList.toggle("open");
      els.navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    els.navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        els.navLinks.classList.remove("open");
        els.navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---- Catálogo ----
  async function loadCatalog() {
    try {
      const [categories, products] = await Promise.all([
        DS.getCategories(),
        DS.getPublicProducts()
      ]);
      state.categories = categories;
      state.products = products;
      renderCategoryFilters();
      renderCatalog();
    } catch (err) {
      console.error("Error cargando catálogo:", err);
      els.catalogGrid.innerHTML = `
        <div class="catalog-empty">
          <h3>No pudimos cargar el catálogo</h3>
          <p>Verifica tu conexión o configuración de Supabase e intenta recargar la página.</p>
        </div>
      `;
    }
  }

  function renderCategoryFilters() {
    const buttons = [
      { id: "all", name: "Todos" },
      ...state.categories.map((c) => ({ id: c.id, name: c.name }))
    ];

    els.categoryFilters.innerHTML = buttons
      .map(
        (cat) => `
          <button
            type="button"
            class="filter-pill ${state.selectedCategory === cat.id ? "active" : ""}"
            data-category="${escapeHtml(cat.id)}"
          >
            ${escapeHtml(cat.name)}
          </button>
        `
      )
      .join("");

    els.categoryFilters.querySelectorAll(".filter-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedCategory = btn.dataset.category;
        renderCategoryFilters();
        renderCatalog();
      });
    });
  }

  function renderCatalog() {
    const q = state.searchQuery.trim().toLowerCase();

    const filtered = state.products.filter((prod) => {
      const matchesCat =
        state.selectedCategory === "all" ||
        prod.category_id === state.selectedCategory;
      const matchesText =
        !q ||
        (prod.name || "").toLowerCase().includes(q) ||
        (prod.description || "").toLowerCase().includes(q) ||
        (prod.category_name || "").toLowerCase().includes(q);
      return matchesCat && matchesText;
    });

    if (filtered.length === 0) {
      els.catalogGrid.innerHTML = `
        <div class="catalog-empty">
          <h3>No encontramos productos con ese filtro</h3>
          <p>Prueba otra palabra clave, selecciona "Todos" o cuéntanos tu idea personalizada más abajo.</p>
        </div>
      `;
      return;
    }

    els.catalogGrid.innerHTML = filtered
      .map((prod) => {
        const imgSrc = prod.image_url || "assets/demo/llavero-cubo-jf.svg";
        return `
          <article class="neon-card product-card" tabindex="0" role="button" data-product-id="${escapeHtml(prod.id)}" aria-label="Ver detalles de ${escapeHtml(prod.name)}">
            <div class="product-thumb-wrap">
              <img
                src="${escapeHtml(imgSrc)}"
                alt="${escapeHtml(prod.name)}"
                class="product-thumb"
                loading="lazy"
              />
              <span class="product-category-badge">${escapeHtml(prod.category_name)}</span>
            </div>
            <div class="product-body">
              <h3 class="product-name">${escapeHtml(prod.name)}</h3>
              <div class="product-footer">
                <span class="product-price">${escapeHtml(DS.formatCOP(prod.price_cop))}</span>
                <span class="product-more">Ver detalle →</span>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    els.catalogGrid.querySelectorAll(".product-card").forEach((card) => {
      const open = () => {
        const product = state.products.find((p) => p.id === card.dataset.productId);
        if (product) openProductModal(product);
      };
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
    });
  }

  // ---- Modal de producto ----
  function openProductModal(product) {
    const priceText = DS.formatCOP(product.price_cop);
    const imgSrc = product.image_url || "assets/demo/llavero-cubo-jf.svg";

    els.modalProductImg.src = imgSrc;
    els.modalProductImg.alt = product.name || "Producto JuliFor3D";
    els.modalProductCat.textContent = product.category_name || "Catálogo";
    els.modalProductTitle.textContent = product.name || "";
    els.modalProductPrice.textContent = priceText;
    els.modalProductDesc.textContent =
      product.description || "Producto fabricado con impresión 3D de alta precisión en Bogotá.";

    const waMessage = `Hola JuliFor3D! Me interesa pedir el producto "${product.name}" (${priceText}). ¿Cómo coordinamos el pedido en Bogotá?`;
    els.modalWhatsappBtn.href = DS.buildWhatsAppUrl(waMessage);

    els.productModal.classList.add("open");
    els.productModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    els.modalCloseBtn.focus();
  }

  function closeProductModal() {
    els.productModal.classList.remove("open");
    els.productModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function initModal() {
    els.modalCloseBtn.addEventListener("click", closeProductModal);
    els.productModal.addEventListener("click", (e) => {
      if (e.target === els.productModal) closeProductModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && els.productModal.classList.contains("open")) {
        closeProductModal();
      }
    });
  }

  // ---- Formulario Mi Idea ----
  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function validateReferenceFile(file) {
    if (!file) return null;
    const maxBytes = 25 * 1024 * 1024; // 25 MB
    if (file.size > maxBytes) {
      return "El archivo supera el tamaño máximo permitido de 25 MB.";
    }
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    const isImage = file.type && file.type.startsWith("image/");
    const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf", ".stl"];
    if (!isImage && !allowedExts.includes(ext)) {
      return "Formato no soportado. Sube una imagen, un PDF o un archivo .STL.";
    }
    return null;
  }

  function setSelectedFile(file) {
    if (!file) {
      state.selectedFile = null;
      els.ideaFile.value = "";
      els.fileSelectedPill.classList.add("hidden");
      els.fileSelectedName.textContent = "";
      return;
    }

    const errMsg = validateReferenceFile(file);
    if (errMsg) {
      showToast(errMsg, "error");
      setSelectedFile(null);
      return;
    }

    state.selectedFile = file;
    els.fileSelectedName.textContent = `${file.name} (${formatBytes(file.size)})`;
    els.fileSelectedPill.classList.remove("hidden");
  }

  function showFormFeedback(htmlMessage, type) {
    els.ideaFeedback.innerHTML = htmlMessage;
    els.ideaFeedback.className = `form-feedback show ${type}`;
  }

  function initIdeaForm() {
    els.ideaFile.addEventListener("change", () => {
      const file = els.ideaFile.files && els.ideaFile.files[0];
      setSelectedFile(file || null);
    });

    els.fileClearBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedFile(null);
    });

    ["dragenter", "dragover"].forEach((evt) => {
      els.fileDropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        els.fileDropzone.classList.add("dragover");
      });
    });

    ["dragleave", "drop"].forEach((evt) => {
      els.fileDropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        els.fileDropzone.classList.remove("dragover");
      });
    });

    els.fileDropzone.addEventListener("drop", (e) => {
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) setSelectedFile(file);
    });

    els.ideaForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      els.ideaFeedback.className = "form-feedback";

      const fd = new FormData(els.ideaForm);
      const client_name = String(fd.get("client_name") || "").trim();
      const contact = String(fd.get("contact") || "").trim();
      const description = String(fd.get("description") || "").trim();
      const approx_size = String(fd.get("approx_size") || "").trim();
      const colors = String(fd.get("colors") || "").trim();
      const is_multicolor = Boolean(document.getElementById("ideaMulticolor").checked);

      if (!client_name || !contact || !description) {
        showFormFeedback(
          "Por favor completa los campos obligatorios: <strong>Nombre</strong>, <strong>WhatsApp o correo</strong> y <strong>Descripción de la idea</strong>.",
          "error"
        );
        return;
      }

      els.ideaSubmitBtn.disabled = true;
      els.ideaSubmitBtn.textContent = "Enviando tu idea...";

      try {
        const result = await DS.submitIdea(
          {
            client_name,
            contact,
            description,
            approx_size,
            colors,
            is_multicolor
          },
          state.selectedFile
        );

        const waSummary = `Hola JuliFor3D! Acabo de enviar mi idea en la web.\nNombre: ${client_name}\nIdea: ${description}\nTamaño: ${approx_size || "Por definir"}\nColores: ${colors || "Por definir"} (${is_multicolor ? "Multicolor" : "Un color"})`;
        const waLink = DS.buildWhatsAppUrl(waSummary);

        const modeNote = result.demo
          ? "<br><small style='opacity:0.85;'>(Modo demostración: solicitud guardada localmente para pruebas; también puedes revisarla en admin.html.)</small>"
          : "";

        showFormFeedback(
          `<strong>¡Recibimos tu idea, ${escapeHtml(client_name)}!</strong> Pronto te contactaremos para cotizar tu proyecto.${modeNote}
           <div style="margin-top:12px;">
             <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm">
               Adelantar charla por WhatsApp
             </a>
           </div>`,
          "success"
        );

        showToast("¡Idea enviada correctamente!", "success");
        els.ideaForm.reset();
        setSelectedFile(null);
      } catch (err) {
        console.error("Error enviando idea:", err);
        showFormFeedback(
          `Ocurrió un problema al enviar tu solicitud: ${escapeHtml(err.message || "Intenta nuevamente o escríbenos por WhatsApp.")}`,
          "error"
        );
      } finally {
        els.ideaSubmitBtn.disabled = false;
        els.ideaSubmitBtn.textContent = "Enviar mi idea para cotizar";
      }
    });
  }

  // ---- Inicialización ----
  function init() {
    if (!DS.isLiveMode && els.demoBanner) {
      els.demoBanner.classList.remove("hidden");
    }

    initNavbar();
    initModal();
    initIdeaForm();

    if (els.catalogSearch) {
      els.catalogSearch.addEventListener("input", (e) => {
        state.searchQuery = e.target.value;
        renderCatalog();
      });
    }

    loadCatalog();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
