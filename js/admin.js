/**
 * JuliFor3D — Lógica del Panel Administrativo (admin.html)
 */

(function () {
  const DS = window.JuliForData;

  const state = {
    session: null,
    activeTab: "productos",
    categories: [],
    products: [],
    ideas: [],
    ideasFilter: "all",
    editingProduct: null
  };

  const els = {
    adminDemoBanner: document.getElementById("adminDemoBanner"),
    authScreen: document.getElementById("authScreen"),
    authDemoBox: document.getElementById("authDemoBox"),
    enterDemoBtn: document.getElementById("enterDemoBtn"),
    loginForm: document.getElementById("loginForm"),
    loginEmail: document.getElementById("loginEmail"),
    loginPassword: document.getElementById("loginPassword"),
    loginSubmitBtn: document.getElementById("loginSubmitBtn"),
    loginError: document.getElementById("loginError"),

    adminShell: document.getElementById("adminShell"),
    adminUserEmail: document.getElementById("adminUserEmail"),
    logoutBtn: document.getElementById("logoutBtn"),

    statTotalProducts: document.getElementById("statTotalProducts"),
    statActiveProducts: document.getElementById("statActiveProducts"),
    statCategories: document.getElementById("statCategories"),
    statNewIdeas: document.getElementById("statNewIdeas"),

    tabCountProducts: document.getElementById("tabCountProducts"),
    tabCountCategories: document.getElementById("tabCountCategories"),
    tabCountIdeas: document.getElementById("tabCountIdeas"),

    // Productos
    newProductBtn: document.getElementById("newProductBtn"),
    adminProductsGrid: document.getElementById("adminProductsGrid"),
    productFormModal: document.getElementById("productFormModal"),
    closeProductModalBtn: document.getElementById("closeProductModalBtn"),
    cancelProductModalBtn: document.getElementById("cancelProductModalBtn"),
    productModalHeading: document.getElementById("productModalHeading"),
    productForm: document.getElementById("productForm"),
    prodId: document.getElementById("prodId"),
    prodName: document.getElementById("prodName"),
    prodCategory: document.getElementById("prodCategory"),
    prodPrice: document.getElementById("prodPrice"),
    prodDesc: document.getElementById("prodDesc"),
    prodImage: document.getElementById("prodImage"),
    prodImagePreviewBox: document.getElementById("prodImagePreviewBox"),
    prodImagePreview: document.getElementById("prodImagePreview"),
    prodActive: document.getElementById("prodActive"),
    saveProductBtn: document.getElementById("saveProductBtn"),

    // Categorías
    createCategoryForm: document.getElementById("createCategoryForm"),
    newCategoryName: document.getElementById("newCategoryName"),
    createCategoryBtn: document.getElementById("createCategoryBtn"),
    categoriesList: document.getElementById("categoriesList"),

    // Ideas
    ideasStatusFilter: document.getElementById("ideasStatusFilter"),
    ideasList: document.getElementById("ideasList"),

    toastContainer: document.getElementById("toastContainer")
  };

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    els.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(20px)";
      toast.style.transition = "all 0.25s ease";
      setTimeout(() => toast.remove(), 260);
    }, 3400);
  }

  function statusClass(status) {
    if (status === "cotizada") return "status-cotizada";
    if (status === "en producción") return "status-en-produccion";
    if (status === "entregada") return "status-entregada";
    return "status-nueva";
  }

  // ---- Vistas Auth vs Panel ----
  async function applySession(session) {
    state.session = session;
    if (session) {
      els.authScreen.classList.add("hidden");
      els.adminShell.classList.remove("hidden");
      els.adminUserEmail.textContent =
        (session.user && session.user.email) || "Administrador";
      await refreshAllData();
    } else {
      els.adminShell.classList.add("hidden");
      els.authScreen.classList.remove("hidden");
    }
  }

  async function refreshAllData() {
    try {
      const [categories, products, ideas] = await Promise.all([
        DS.getCategories(),
        DS.getAllProducts(),
        DS.getIdeas()
      ]);
      state.categories = categories;
      state.products = products;
      state.ideas = ideas;

      updateStats();
      renderProducts();
      renderCategories();
      renderIdeas();
    } catch (err) {
      console.error("Error cargando datos del panel:", err);
      showToast(err.message || "Error al cargar los datos.", "error");
    }
  }

  function updateStats() {
    const totalProd = state.products.length;
    const activeProd = state.products.filter((p) => p.active !== false).length;
    const totalCat = state.categories.length;
    const newIdeas = state.ideas.filter((i) => i.status === "nueva").length;

    els.statTotalProducts.textContent = totalProd;
    els.statActiveProducts.textContent = activeProd;
    els.statCategories.textContent = totalCat;
    els.statNewIdeas.textContent = newIdeas;

    els.tabCountProducts.textContent = totalProd;
    els.tabCountCategories.textContent = totalCat;
    els.tabCountIdeas.textContent = state.ideas.length;
  }

  // ---- Pestañas ----
  function initTabs() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.tab;
        state.activeTab = target;

        document.querySelectorAll(".tab-btn").forEach((b) => {
          const isActive = b.dataset.tab === target;
          b.classList.toggle("active", isActive);
          b.setAttribute("aria-selected", String(isActive));
        });

        document.querySelectorAll(".tab-panel").forEach((panel) => {
          panel.classList.toggle("hidden", panel.id !== `panel-${target}`);
        });
      });
    });
  }

  // =========================================================================
  // PESTAÑA 1: PRODUCTOS
  // =========================================================================

  function renderProducts() {
    if (state.products.length === 0) {
      els.adminProductsGrid.innerHTML = `
        <div class="catalog-empty">
          <h3>Aún no hay productos registrados</h3>
          <p>Haz clic en "+ Nuevo producto" para agregar tu primera creación al catálogo.</p>
        </div>
      `;
      return;
    }

    els.adminProductsGrid.innerHTML = state.products
      .map((prod) => {
        const isActive = prod.active !== false;
        const imgSrc = prod.image_url || "assets/demo/llavero-cubo-jf.svg";
        return `
          <article class="neon-card admin-product-card ${isActive ? "" : "is-hidden"}">
            <div class="admin-product-media">
              <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(prod.name)}" loading="lazy" />
              <span class="visibility-badge ${isActive ? "visible" : "oculto"}">
                ${isActive ? "Visible" : "Oculto"}
              </span>
            </div>
            <div class="admin-product-body">
              <h3 class="admin-product-title">${escapeHtml(prod.name)}</h3>
              <div class="admin-product-meta">
                <span>${escapeHtml(prod.category_name)}</span>
                <strong style="color: var(--neon-cyan);">${escapeHtml(DS.formatCOP(prod.price_cop))}</strong>
              </div>
              <p class="admin-product-desc">${escapeHtml(prod.description || "Sin descripción.")}</p>
              <div class="admin-product-actions">
                <button type="button" class="btn btn-secondary btn-sm" data-action="edit" data-id="${escapeHtml(prod.id)}">
                  Editar
                </button>
                <button type="button" class="btn btn-ghost btn-sm" data-action="toggle" data-id="${escapeHtml(prod.id)}">
                  ${isActive ? "Ocultar" : "Mostrar"}
                </button>
                <button type="button" class="btn btn-danger btn-sm" data-action="delete" data-id="${escapeHtml(prod.id)}">
                  Eliminar
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    els.adminProductsGrid.querySelectorAll("button[data-action]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        const product = state.products.find((p) => p.id === id);
        if (!product) return;

        if (action === "edit") {
          openProductModal(product);
        } else if (action === "toggle") {
          const nextActive = !(product.active !== false);
          btn.disabled = true;
          try {
            await DS.toggleProductActive(product.id, nextActive);
            showToast(
              nextActive ? "Producto visible en el catálogo." : "Producto ocultado del catálogo.",
              "success"
            );
            await refreshAllData();
          } catch (err) {
            showToast(err.message || "No se pudo cambiar la visibilidad.", "error");
            btn.disabled = false;
          }
        } else if (action === "delete") {
          const ok = window.confirm(`¿Eliminar definitivamente el producto "${product.name}"?`);
          if (!ok) return;
          btn.disabled = true;
          try {
            await DS.deleteProduct(product.id, product.image_path);
            showToast("Producto eliminado.", "success");
            await refreshAllData();
          } catch (err) {
            showToast(err.message || "No se pudo eliminar el producto.", "error");
            btn.disabled = false;
          }
        }
      });
    });
  }

  function populateCategorySelect(selectedId) {
    const options = [
      `<option value="">Sin categoría</option>`,
      ...state.categories.map(
        (c) =>
          `<option value="${escapeHtml(c.id)}" ${c.id === selectedId ? "selected" : ""}>${escapeHtml(c.name)}</option>`
      )
    ];
    els.prodCategory.innerHTML = options.join("");
  }

  function openProductModal(product = null) {
    state.editingProduct = product;
    els.productForm.reset();

    if (product) {
      els.productModalHeading.textContent = "Editar producto";
      els.prodId.value = product.id;
      els.prodName.value = product.name || "";
      els.prodPrice.value = product.price_cop || 0;
      els.prodDesc.value = product.description || "";
      els.prodActive.checked = product.active !== false;
      populateCategorySelect(product.category_id || "");

      if (product.image_url) {
        els.prodImagePreview.src = product.image_url;
        els.prodImagePreviewBox.classList.remove("hidden");
      } else {
        els.prodImagePreviewBox.classList.add("hidden");
      }
    } else {
      els.productModalHeading.textContent = "Nuevo producto";
      els.prodId.value = "";
      els.prodActive.checked = true;
      populateCategorySelect(state.categories[0] ? state.categories[0].id : "");
      els.prodImagePreviewBox.classList.add("hidden");
      els.prodImagePreview.src = "";
    }

    els.productFormModal.classList.add("open");
    els.productFormModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    els.prodName.focus();
  }

  function closeProductModal() {
    els.productFormModal.classList.remove("open");
    els.productFormModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    state.editingProduct = null;
  }

  function initProductModal() {
    els.newProductBtn.addEventListener("click", () => openProductModal(null));
    els.closeProductModalBtn.addEventListener("click", closeProductModal);
    els.cancelProductModalBtn.addEventListener("click", closeProductModal);

    els.productFormModal.addEventListener("click", (e) => {
      if (e.target === els.productFormModal) closeProductModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && els.productFormModal.classList.contains("open")) {
        closeProductModal();
      }
    });

    els.prodImage.addEventListener("change", () => {
      const file = els.prodImage.files && els.prodImage.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        els.prodImagePreview.src = reader.result;
        els.prodImagePreviewBox.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    });

    els.productForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = els.prodName.value.trim();
      const price = parseInt(els.prodPrice.value, 10);

      if (!name) {
        showToast("Ingresa el nombre del producto.", "error");
        return;
      }
      if (Number.isNaN(price) || price < 0) {
        showToast("Ingresa un precio válido en COP.", "error");
        return;
      }

      const payload = {
        name,
        category_id: els.prodCategory.value || null,
        price_cop: price,
        description: els.prodDesc.value.trim(),
        active: els.prodActive.checked
      };
      const imageFile = els.prodImage.files && els.prodImage.files[0] ? els.prodImage.files[0] : null;

      els.saveProductBtn.disabled = true;
      els.saveProductBtn.textContent = "Guardando...";

      try {
        if (state.editingProduct) {
          await DS.updateProduct(state.editingProduct.id, payload, imageFile);
          showToast("Producto actualizado correctamente.", "success");
        } else {
          await DS.createProduct(payload, imageFile);
          showToast("Producto creado correctamente.", "success");
        }
        closeProductModal();
        await refreshAllData();
      } catch (err) {
        console.error("Error guardando producto:", err);
        showToast(err.message || "Error al guardar el producto.", "error");
      } finally {
        els.saveProductBtn.disabled = false;
        els.saveProductBtn.textContent = "Guardar producto";
      }
    });
  }

  // =========================================================================
  // PESTAÑA 2: CATEGORÍAS
  // =========================================================================

  function renderCategories() {
    if (state.categories.length === 0) {
      els.categoriesList.innerHTML = `
        <div class="catalog-empty">
          <h3>No hay categorías creadas</h3>
          <p>Crea categorías como Figuras, Decoración, Soportes y hogar o Llaveros.</p>
        </div>
      `;
      return;
    }

    els.categoriesList.innerHTML = state.categories
      .map((cat) => {
        const count = state.products.filter((p) => p.category_id === cat.id).length;
        return `
          <div class="neon-card category-row">
            <div>
              <h3>${escapeHtml(cat.name)}</h3>
              <small>${count} ${count === 1 ? "producto" : "productos"}</small>
            </div>
            <button type="button" class="btn btn-danger btn-sm" data-delete-cat="${escapeHtml(cat.id)}">
              Eliminar
            </button>
          </div>
        `;
      })
      .join("");

    els.categoriesList.querySelectorAll("button[data-delete-cat]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.deleteCat;
        const cat = state.categories.find((c) => c.id === id);
        if (!cat) return;
        const ok = window.confirm(
          `¿Eliminar la categoría "${cat.name}"? Los productos asociados quedarán sin categoría.`
        );
        if (!ok) return;

        btn.disabled = true;
        try {
          await DS.deleteCategory(id);
          showToast(`Categoría "${cat.name}" eliminada.`, "success");
          await refreshAllData();
        } catch (err) {
          showToast(err.message || "No se pudo eliminar la categoría.", "error");
          btn.disabled = false;
        }
      });
    });
  }

  function initCategoriesForm() {
    els.createCategoryForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = els.newCategoryName.value.trim();
      if (!name) return;

      els.createCategoryBtn.disabled = true;
      try {
        await DS.createCategory(name);
        els.newCategoryName.value = "";
        showToast(`Categoría "${name}" creada.`, "success");
        await refreshAllData();
      } catch (err) {
        showToast(err.message || "No se pudo crear la categoría.", "error");
      } finally {
        els.createCategoryBtn.disabled = false;
      }
    });
  }

  // =========================================================================
  // PESTAÑA 3: IDEAS DE CLIENTES
  // =========================================================================

  function buildContactQuickLink(contact, clientName) {
    const raw = String(contact || "").trim();
    if (!raw) return "";
    if (raw.includes("@")) {
      return `<a href="mailto:${encodeURIComponent(raw)}?subject=${encodeURIComponent("Cotización JuliFor3D")}" class="btn btn-ghost btn-sm">Enviar correo</a>`;
    }
    const digits = raw.replace(/\D/g, "");
    if (digits.length >= 7) {
      const phone = digits.startsWith("57") ? digits : `57${digits}`;
      const msg = `Hola ${clientName || ""}, te escribimos de JuliFor3D respecto a la idea 3D que nos enviaste en nuestra página web.`;
      return `<a href="https://wa.me/${phone}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm">Responder por WhatsApp</a>`;
    }
    return "";
  }

  function renderIdeas() {
    const filtered = state.ideas.filter(
      (idea) => state.ideasFilter === "all" || idea.status === state.ideasFilter
    );

    if (filtered.length === 0) {
      els.ideasList.innerHTML = `
        <div class="catalog-empty">
          <h3>No hay ideas en este estado</h3>
          <p>Cuando los clientes envíen solicitudes desde el formulario "Mi idea", aparecerán aquí automáticamente.</p>
        </div>
      `;
      return;
    }

    const statuses = ["nueva", "cotizada", "en producción", "entregada"];

    els.ideasList.innerHTML = filtered
      .map((idea) => {
        const hasAttachment = Boolean(idea.file_path || idea.file_url || idea.file_name);
        const canDownload = Boolean(idea.file_path || idea.file_url);
        const contactBtn = buildContactQuickLink(idea.contact, idea.client_name);

        return `
          <article class="neon-card idea-card">
            <div class="idea-card-head">
              <div class="idea-client">
                <h3>${escapeHtml(idea.client_name)}</h3>
                <div class="idea-contact-line">
                  <span>${escapeHtml(idea.contact)}</span>
                  <span class="idea-date">${escapeHtml(DS.formatDate(idea.created_at))}</span>
                </div>
              </div>

              <div class="idea-status-wrap">
                <span class="status-badge ${statusClass(idea.status)}">${escapeHtml(idea.status)}</span>
                <select class="status-select" data-idea-status="${escapeHtml(idea.id)}" aria-label="Cambiar estado de solicitud">
                  ${statuses
                    .map(
                      (st) =>
                        `<option value="${st}" ${idea.status === st ? "selected" : ""}>${st}</option>`
                    )
                    .join("")}
                </select>
              </div>
            </div>

            <div class="idea-desc">${escapeHtml(idea.description)}</div>

            <div class="idea-specs">
              <span class="spec-chip"><strong>Tamaño:</strong> ${escapeHtml(idea.approx_size || "No especificado")}</span>
              <span class="spec-chip"><strong>Colores:</strong> ${escapeHtml(idea.colors || "No especificado")}</span>
              <span class="spec-chip ${idea.is_multicolor ? "multicolor" : ""}">
                <strong>Multicolor:</strong> ${idea.is_multicolor ? "Sí (Multicolor)" : "No"}
              </span>
            </div>

            <div class="idea-footer">
              <div>
                ${
                  hasAttachment
                    ? canDownload
                      ? `<button type="button" class="btn btn-secondary btn-sm" data-open-file="${escapeHtml(idea.id)}">
                           📎 Ver / descargar archivo (${escapeHtml(idea.file_name || "adjunto")})
                         </button>`
                      : `<span class="spec-chip">📎 Adjunto (demo): <strong>${escapeHtml(idea.file_name)}</strong></span>`
                    : `<span class="idea-date">Sin archivo adjunto</span>`
                }
              </div>

              <div>${contactBtn}</div>
            </div>
          </article>
        `;
      })
      .join("");

    // Listeners de cambio de estado
    els.ideasList.querySelectorAll("select[data-idea-status]").forEach((sel) => {
      sel.addEventListener("change", async () => {
        const id = sel.dataset.ideaStatus;
        const nextStatus = sel.value;
        sel.disabled = true;
        try {
          await DS.updateIdeaStatus(id, nextStatus);
          showToast(`Estado actualizado a "${nextStatus}".`, "success");
          await refreshAllData();
        } catch (err) {
          showToast(err.message || "No se pudo actualizar el estado.", "error");
          sel.disabled = false;
        }
      });
    });

    // Listeners de apertura/descarga de archivo adjunto
    els.ideasList.querySelectorAll("button[data-open-file]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.openFile;
        const idea = state.ideas.find((i) => i.id === id);
        if (!idea) return;

        btn.disabled = true;
        try {
          const url = await DS.getIdeaFileUrl(idea);
          if (!url) {
            showToast("No hay enlace disponible para este archivo.", "error");
          } else {
            window.open(url, "_blank", "noopener,noreferrer");
          }
        } catch (err) {
          showToast(err.message || "No se pudo obtener el archivo adjunto.", "error");
        } finally {
          btn.disabled = false;
        }
      });
    });
  }

  function initIdeasFilters() {
    els.ideasStatusFilter.querySelectorAll(".filter-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.ideasFilter = btn.dataset.status;
        els.ideasStatusFilter.querySelectorAll(".filter-pill").forEach((b) => {
          b.classList.toggle("active", b.dataset.status === state.ideasFilter);
        });
        renderIdeas();
      });
    });
  }

  // =========================================================================
  // AUTH E INICIALIZACIÓN
  // =========================================================================

  function initAuthHandlers() {
    if (!DS.isLiveMode) {
      els.adminDemoBanner.classList.remove("hidden");
      els.authDemoBox.classList.remove("hidden");
    }

    els.enterDemoBtn.addEventListener("click", async () => {
      const session = await DS.signIn("demo@julifor3d.com", "demo");
      showToast("Sesión de demostración iniciada.", "success");
      await applySession(session);
    });

    els.loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      els.loginError.classList.remove("show");

      const email = els.loginEmail.value.trim();
      const password = els.loginPassword.value;

      if (!email || !password) {
        els.loginError.textContent = "Ingresa tu correo electrónico y contraseña.";
        els.loginError.classList.add("show");
        return;
      }

      els.loginSubmitBtn.disabled = true;
      els.loginSubmitBtn.textContent = "Verificando...";

      try {
        const session = await DS.signIn(email, password);
        showToast("¡Bienvenido al panel de JuliFor3D!", "success");
        await applySession(session);
      } catch (err) {
        els.loginError.textContent =
          err.message === "Invalid login credentials"
            ? "Correo o contraseña incorrectos."
            : err.message || "Error al iniciar sesión.";
        els.loginError.classList.add("show");
      } finally {
        els.loginSubmitBtn.disabled = false;
        els.loginSubmitBtn.textContent = "Iniciar sesión";
      }
    });

    els.logoutBtn.addEventListener("click", async () => {
      await DS.signOut();
      showToast("Sesión cerrada.", "info");
      await applySession(null);
    });
  }

  async function init() {
    initTabs();
    initAuthHandlers();
    initProductModal();
    initCategoriesForm();
    initIdeasFilters();

    try {
      const session = await DS.getSession();
      await applySession(session);
    } catch (err) {
      console.error("Error verificando sesión:", err);
      await applySession(null);
    }

    DS.onAuthStateChange((session) => {
      applySession(session);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
