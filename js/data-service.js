/**
 * JuliFor3D - Capa de datos unificada (Supabase + Modo Demo sin conexión)
 * -------------------------------------------------------------------------
 * Si `SUPABASE_URL` y `SUPABASE_ANON_KEY` están configurados en `config.js`,
 * todas las operaciones se conectan en vivo con Supabase (Database, Storage y Auth).
 * Si están vacíos, opera en modo demostración con datos realistas en localStorage.
 */

(function () {
  const cfg = window.JULIFOR_CONFIG || {};

  const STORAGE_KEYS = {
    CATEGORIES: "julifor3d_demo_categories_v1",
    PRODUCTS: "julifor3d_demo_products_v1",
    IDEAS: "julifor3d_demo_ideas_v1",
    DEMO_ADMIN: "julifor3d_demo_admin_session_v1"
  };

  const DEFAULT_CATEGORIES = [
    { id: "cat-figuras", name: "Figuras", slug: "figuras", created_at: "2026-01-10T12:00:00Z" },
    { id: "cat-decoracion", name: "Decoración", slug: "decoracion", created_at: "2026-01-10T12:01:00Z" },
    { id: "cat-soportes", name: "Soportes y hogar", slug: "soportes-y-hogar", created_at: "2026-01-10T12:02:00Z" },
    { id: "cat-llaveros", name: "Llaveros", slug: "llaveros", created_at: "2026-01-10T12:03:00Z" }
  ];

  const DEFAULT_PRODUCTS = [
    {
      id: "prod-lobo-jf",
      name: "Figura Coleccionable Lobo JF (Multicolor)",
      description:
        "Nuestra mascota oficial impresa en 3D multicolor de alta precisión en PLA+ premium. Ideal para escritorios, setups gamer y coleccionistas. Altura aproximada: 16 cm con base estable.",
      price_cop: 95000,
      category_id: "cat-figuras",
      category_name: "Figuras",
      image_url: "assets/mascota.jpeg",
      image_path: null,
      active: true,
      created_at: "2026-02-01T15:00:00Z"
    },
    {
      id: "prod-dragon-articulado",
      name: "Dragón Articulado Azul Neón",
      description:
        "Figura articulada flexible impresa de una sola pieza (print-in-place) en filamento PLA+ seda azul eléctrico y negro. Largo aproximado de 32 cm, acabado brillante y movimiento suave.",
      price_cop: 68000,
      category_id: "cat-figuras",
      category_name: "Figuras",
      image_url: "assets/demo/dragon-articulado.svg",
      image_path: null,
      active: true,
      created_at: "2026-02-02T15:00:00Z"
    },
    {
      id: "prod-jarron-voronoi",
      name: "Jarrón Geométrico Espiral",
      description:
        "Florero decorativo de estilo minimalista con costillas espirales y textura Voronoi. Perfecto para flores secas o decoración moderna en sala y oficina. Disponible en negro mate, blanco o azul neón.",
      price_cop: 52000,
      category_id: "cat-decoracion",
      category_name: "Decoración",
      image_url: "assets/demo/jarron-voronoi.svg",
      image_path: null,
      active: true,
      created_at: "2026-02-03T15:00:00Z"
    },
    {
      id: "prod-lampara-luna",
      name: "Lámpara Luna Litofanía Personalizable",
      description:
        "Esfera lunar impresa en 3D con textura hiperrealista de cráteres y base geométrica minimalista. Incluye luz LED cálida o fría. También podemos personalizarla con tu fotografía en litofanía.",
      price_cop: 85000,
      category_id: "cat-decoracion",
      category_name: "Decoración",
      image_url: "assets/demo/lampara-luna.svg",
      image_path: null,
      active: true,
      created_at: "2026-02-04T15:00:00Z"
    },
    {
      id: "prod-soporte-celular",
      name: "Base Organizador de Escritorio + Celular",
      description:
        "Soporte ergonómico para celular con ranura para cable de carga y compartimento modular para esferos, memorias USB o tarjetas. Fabricado en PLA+ resistente en combinación negro y azul.",
      price_cop: 42000,
      category_id: "cat-soportes",
      category_name: "Soportes y hogar",
      image_url: "assets/demo/soporte-celular.svg",
      image_path: null,
      active: true,
      created_at: "2026-02-05T15:00:00Z"
    },
    {
      id: "prod-soporte-audifonos",
      name: "Soporte Gamer para Audífonos Hex",
      description:
        "Base hexagonal robusta con soporte superior curvo para cuidar la diadema de tus audífonos. Se puede personalizar con tu gamertag o iniciales en relieve multicolor.",
      price_cop: 48000,
      category_id: "cat-soportes",
      category_name: "Soportes y hogar",
      image_url: "assets/demo/soporte-audifonos.svg",
      image_path: null,
      active: true,
      created_at: "2026-02-06T15:00:00Z"
    },
    {
      id: "prod-llavero-cubo",
      name: "Llavero Cubo 3D Personalizado",
      description:
        "Llavero estilo cubo isométrico con tus iniciales o logotipo en tres caras a dos o tres colores. Incluye argolla metálica reforzada. Ideal para regalos o detalles corporativos.",
      price_cop: 18000,
      category_id: "cat-llaveros",
      category_name: "Llaveros",
      image_url: "assets/demo/llavero-cubo-jf.svg",
      image_path: null,
      active: true,
      created_at: "2026-02-07T15:00:00Z"
    },
    {
      id: "prod-llavero-placa",
      name: "Llavero Placa Nombre / QR Multicolor",
      description:
        "Placa en relieve multicolor con tu nombre, marca o código QR funcional (Instagram, WhatsApp o Wi-Fi). Liviano, resistente al uso diario y completamente a tu gusto.",
      price_cop: 15000,
      category_id: "cat-llaveros",
      category_name: "Llaveros",
      image_url: "assets/demo/llavero-placa-nfc.svg",
      image_path: null,
      active: true,
      created_at: "2026-02-08T15:00:00Z"
    }
  ];

  const DEFAULT_IDEAS = [
    {
      id: "idea-demo-1",
      client_name: "Camila Rodríguez",
      contact: "312 456 7890",
      description:
        "Quisiera un soporte para control de PS5 con el nombre 'CAMI' en relieve en la base y detalles en azul neón y blanco.",
      approx_size: "18 cm de alto",
      colors: "Negro mate, azul neón y blanco",
      is_multicolor: true,
      file_url: null,
      file_path: null,
      file_name: "referencia-soporte-ps5.png",
      status: "nueva",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
    },
    {
      id: "idea-demo-2",
      client_name: "Andrés Felipe Gómez",
      contact: "andres.gomez@ejemplo.co",
      description:
        "Necesito imprimir 15 llaveros con el logo de mi barbería en Bogotá para entregar a clientes VIP.",
      approx_size: "5.5 cm x 3.5 cm",
      colors: "Negro y dorado / azul",
      is_multicolor: true,
      file_url: null,
      file_path: null,
      file_name: "logo-barberia.pdf",
      status: "cotizada",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString()
    }
  ];

  // Determinar si Supabase está configurado
  const isLiveMode = Boolean(
    cfg.SUPABASE_URL &&
      cfg.SUPABASE_URL.trim() !== "" &&
      cfg.SUPABASE_ANON_KEY &&
      cfg.SUPABASE_ANON_KEY.trim() !== "" &&
      window.supabase &&
      typeof window.supabase.createClient === "function"
  );

  let supabaseClient = null;
  if (isLiveMode) {
    supabaseClient = window.supabase.createClient(
      cfg.SUPABASE_URL.trim(),
      cfg.SUPABASE_ANON_KEY.trim()
    );
  }

  // Utilidades internas
  function slugify(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function sanitizeFilename(name) {
    const parts = String(name || "archivo").split(".");
    const ext = parts.length > 1 ? "." + parts.pop().toLowerCase().replace(/[^a-z0-9]/g, "") : "";
    const base = slugify(parts.join(".")) || "archivo";
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}${ext}`;
  }

  function generateId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function readLocal(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return JSON.parse(JSON.stringify(fallback));
      }
      return JSON.parse(raw);
    } catch {
      return JSON.parse(JSON.stringify(fallback));
    }
  }

  function writeLocal(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn("No se pudo guardar en localStorage:", err);
    }
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("No se pudo leer el archivo seleccionado."));
      reader.readAsDataURL(file);
    });
  }

  function formatCOP(value) {
    const num = Number(value) || 0;
    return "$" + num.toLocaleString("es-CO") + " COP";
  }

  function buildWhatsAppUrl(message) {
    const phone = cfg.WHATSAPP_NUMBER || "573007709585";
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  function formatDate(isoString) {
    if (!isoString) return "";
    try {
      return new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  }

  // Enriquecer productos con nombre de categoría
  function attachCategoryNames(products, categories) {
    const map = new Map(categories.map((c) => [c.id, c.name]));
    return products.map((p) => ({
      ...p,
      category_name:
        (p.categories && p.categories.name) ||
        map.get(p.category_id) ||
        p.category_name ||
        "Sin categoría"
    }));
  }

  // =========================================================================
  // API PÚBLICA Y ADMINISTRATIVA
  // =========================================================================

  const DataService = {
    isLiveMode,
    config: cfg,
    formatCOP,
    formatDate,
    buildWhatsAppUrl,
    slugify,

    // ---- AUTENTICACIÓN ----
    async getSession() {
      if (isLiveMode) {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        return data.session;
      }
      const demo = localStorage.getItem(STORAGE_KEYS.DEMO_ADMIN);
      return demo ? JSON.parse(demo) : null;
    },

    async signIn(email, password) {
      if (isLiveMode) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (error) throw error;
        return data.session;
      }
      const session = {
        user: { email: email ? email.trim() : "admin@julifor3d.demo" },
        isDemo: true
      };
      localStorage.setItem(STORAGE_KEYS.DEMO_ADMIN, JSON.stringify(session));
      return session;
    },

    async signOut() {
      if (isLiveMode) {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        return;
      }
      localStorage.removeItem(STORAGE_KEYS.DEMO_ADMIN);
    },

    onAuthStateChange(callback) {
      if (isLiveMode) {
        return supabaseClient.auth.onAuthStateChange((_event, session) => {
          callback(session);
        });
      }
      return { data: { subscription: { unsubscribe() {} } } };
    },

    // ---- CATEGORÍAS ----
    async getCategories() {
      if (isLiveMode) {
        const { data, error } = await supabaseClient
          .from("categories")
          .select("*")
          .order("name", { ascending: true });
        if (error) throw error;
        return data || [];
      }
      return readLocal(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    },

    async createCategory(name) {
      const cleanName = String(name || "").trim();
      if (!cleanName) throw new Error("Ingresa un nombre para la categoría.");
      const slug = slugify(cleanName);

      if (isLiveMode) {
        const { data, error } = await supabaseClient
          .from("categories")
          .insert([{ name: cleanName, slug }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      const categories = readLocal(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      if (categories.some((c) => c.name.toLowerCase() === cleanName.toLowerCase())) {
        throw new Error("Ya existe una categoría con ese nombre.");
      }
      const created = {
        id: generateId("cat"),
        name: cleanName,
        slug,
        created_at: new Date().toISOString()
      };
      categories.push(created);
      writeLocal(STORAGE_KEYS.CATEGORIES, categories);
      return created;
    },

    async deleteCategory(id) {
      if (isLiveMode) {
        const { error } = await supabaseClient.from("categories").delete().eq("id", id);
        if (error) throw error;
        return true;
      }
      const categories = readLocal(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES).filter(
        (c) => c.id !== id
      );
      writeLocal(STORAGE_KEYS.CATEGORIES, categories);

      // Desasociar categoría de productos demo que la usaban
      const products = readLocal(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS).map((p) =>
        p.category_id === id ? { ...p, category_id: null, category_name: "Sin categoría" } : p
      );
      writeLocal(STORAGE_KEYS.PRODUCTS, products);
      return true;
    },

    // ---- PRODUCTOS ----
    async getPublicProducts() {
      if (isLiveMode) {
        const { data, error } = await supabaseClient
          .from("products")
          .select("*, categories(id, name, slug)")
          .eq("active", true)
          .order("created_at", { ascending: false });
        if (error) throw error;
        const categories = await this.getCategories();
        return attachCategoryNames(data || [], categories);
      }

      const categories = readLocal(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      const products = readLocal(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS).filter(
        (p) => p.active !== false
      );
      return attachCategoryNames(products, categories);
    },

    async getAllProducts() {
      if (isLiveMode) {
        const { data, error } = await supabaseClient
          .from("products")
          .select("*, categories(id, name, slug)")
          .order("created_at", { ascending: false });
        if (error) throw error;
        const categories = await this.getCategories();
        return attachCategoryNames(data || [], categories);
      }

      const categories = readLocal(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      const products = readLocal(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
      return attachCategoryNames(products, categories);
    },

    async uploadProductImage(file) {
      if (!file) return { image_url: null, image_path: null };

      if (isLiveMode) {
        const bucket = cfg.STORAGE_BUCKET_PRODUCTS || "productos";
        const filePath = sanitizeFilename(file.name);
        const { error: uploadError } = await supabaseClient.storage
          .from(bucket)
          .upload(filePath, file, { cacheControl: "3600", upsert: false });
        if (uploadError) throw uploadError;

        const { data: publicData } = supabaseClient.storage
          .from(bucket)
          .getPublicUrl(filePath);
        return {
          image_url: publicData.publicUrl,
          image_path: filePath
        };
      }

      // En modo demo guardamos Data URL si el archivo es razonable (< 2 MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error("En modo demo la imagen debe pesar menos de 2 MB.");
      }
      const dataUrl = await fileToDataUrl(file);
      return {
        image_url: dataUrl,
        image_path: `demo/${file.name}`
      };
    },

    async createProduct(payload, imageFile) {
      let imageInfo = {
        image_url: payload.image_url || "assets/demo/llavero-cubo-jf.svg",
        image_path: payload.image_path || null
      };

      if (imageFile) {
        imageInfo = await this.uploadProductImage(imageFile);
      }

      const record = {
        name: String(payload.name || "").trim(),
        description: String(payload.description || "").trim(),
        price_cop: Math.max(0, parseInt(payload.price_cop, 10) || 0),
        category_id: payload.category_id || null,
        image_url: imageInfo.image_url,
        image_path: imageInfo.image_path,
        active: payload.active !== false
      };

      if (isLiveMode) {
        const { data, error } = await supabaseClient
          .from("products")
          .insert([record])
          .select("*, categories(id, name, slug)")
          .single();
        if (error) throw error;
        return data;
      }

      const products = readLocal(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
      const categories = readLocal(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      const cat = categories.find((c) => c.id === record.category_id);
      const created = {
        ...record,
        id: generateId("prod"),
        category_name: cat ? cat.name : "Sin categoría",
        created_at: new Date().toISOString()
      };
      products.unshift(created);
      writeLocal(STORAGE_KEYS.PRODUCTS, products);
      return created;
    },

    async updateProduct(id, payload, imageFile) {
      let updates = {
        name: String(payload.name || "").trim(),
        description: String(payload.description || "").trim(),
        price_cop: Math.max(0, parseInt(payload.price_cop, 10) || 0),
        category_id: payload.category_id || null,
        active: payload.active !== false
      };

      if (imageFile) {
        const uploaded = await this.uploadProductImage(imageFile);
        updates.image_url = uploaded.image_url;
        updates.image_path = uploaded.image_path;
      }

      if (isLiveMode) {
        const { data, error } = await supabaseClient
          .from("products")
          .update(updates)
          .eq("id", id)
          .select("*, categories(id, name, slug)")
          .single();
        if (error) throw error;
        return data;
      }

      const products = readLocal(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
      const categories = readLocal(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      const cat = categories.find((c) => c.id === updates.category_id);

      const updatedList = products.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          ...updates,
          category_name: cat ? cat.name : "Sin categoría",
          updated_at: new Date().toISOString()
        };
      });
      writeLocal(STORAGE_KEYS.PRODUCTS, updatedList);
      return updatedList.find((p) => p.id === id);
    },

    async toggleProductActive(id, active) {
      if (isLiveMode) {
        const { data, error } = await supabaseClient
          .from("products")
          .update({ active: Boolean(active) })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      const products = readLocal(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS).map((p) =>
        p.id === id ? { ...p, active: Boolean(active) } : p
      );
      writeLocal(STORAGE_KEYS.PRODUCTS, products);
      return products.find((p) => p.id === id);
    },

    async deleteProduct(id, imagePath) {
      if (isLiveMode) {
        const { error } = await supabaseClient.from("products").delete().eq("id", id);
        if (error) throw error;

        if (imagePath) {
          const bucket = cfg.STORAGE_BUCKET_PRODUCTS || "productos";
          await supabaseClient.storage.from(bucket).remove([imagePath]);
        }
        return true;
      }

      const products = readLocal(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS).filter(
        (p) => p.id !== id
      );
      writeLocal(STORAGE_KEYS.PRODUCTS, products);
      return true;
    },

    // ---- IDEAS DE CLIENTES ----
    async submitIdea(payload, file) {
      let fileMeta = {
        file_url: null,
        file_path: null,
        file_name: null
      };

      if (file) {
        if (isLiveMode) {
          const bucket = cfg.STORAGE_BUCKET_IDEAS || "ideas-clientes";
          const filePath = sanitizeFilename(file.name);
          const { error: uploadError } = await supabaseClient.storage
            .from(bucket)
            .upload(filePath, file, { cacheControl: "3600", upsert: false });
          if (uploadError) throw uploadError;

          fileMeta = {
            file_url: null,
            file_path: filePath,
            file_name: file.name
          };
        } else {
          // Simulación offline: si es imagen pequeña guardamos vista previa local
          let previewUrl = null;
          if (file.type && file.type.startsWith("image/") && file.size <= 1.5 * 1024 * 1024) {
            try {
              previewUrl = await fileToDataUrl(file);
            } catch {
              previewUrl = null;
            }
          }
          fileMeta = {
            file_url: previewUrl,
            file_path: null,
            file_name: file.name
          };
        }
      }

      const record = {
        client_name: String(payload.client_name || "").trim(),
        contact: String(payload.contact || "").trim(),
        description: String(payload.description || "").trim(),
        approx_size: String(payload.approx_size || "").trim(),
        colors: String(payload.colors || "").trim(),
        is_multicolor: Boolean(payload.is_multicolor),
        file_url: fileMeta.file_url,
        file_path: fileMeta.file_path,
        file_name: fileMeta.file_name,
        status: "nueva"
      };

      if (isLiveMode) {
        // No pedimos .select() porque el visitante anónimo solo tiene permiso INSERT por RLS
        const { error } = await supabaseClient.from("ideas").insert([record]);
        if (error) throw error;
        return { ...record, demo: false };
      }

      // Simular latencia ligera de red para una UX natural
      await new Promise((r) => setTimeout(r, 450));
      const ideas = readLocal(STORAGE_KEYS.IDEAS, DEFAULT_IDEAS);
      const created = {
        ...record,
        id: generateId("idea"),
        created_at: new Date().toISOString()
      };
      ideas.unshift(created);
      writeLocal(STORAGE_KEYS.IDEAS, ideas);
      return { ...created, demo: true };
    },

    async getIdeas() {
      if (isLiveMode) {
        const { data, error } = await supabaseClient
          .from("ideas")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      }
      return readLocal(STORAGE_KEYS.IDEAS, DEFAULT_IDEAS);
    },

    async updateIdeaStatus(id, status) {
      const allowed = ["nueva", "cotizada", "en producción", "entregada"];
      if (!allowed.includes(status)) {
        throw new Error("Estado no válido.");
      }

      if (isLiveMode) {
        const { data, error } = await supabaseClient
          .from("ideas")
          .update({ status })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      const ideas = readLocal(STORAGE_KEYS.IDEAS, DEFAULT_IDEAS).map((item) =>
        item.id === id ? { ...item, status, updated_at: new Date().toISOString() } : item
      );
      writeLocal(STORAGE_KEYS.IDEAS, ideas);
      return ideas.find((i) => i.id === id);
    },

    async getIdeaFileUrl(idea) {
      if (!idea) return null;
      if (isLiveMode && idea.file_path) {
        const bucket = cfg.STORAGE_BUCKET_IDEAS || "ideas-clientes";
        const { data, error } = await supabaseClient.storage
          .from(bucket)
          .createSignedUrl(idea.file_path, 3600);
        if (error) throw error;
        return data.signedUrl;
      }
      return idea.file_url || null;
    }
  };

  window.JuliForData = DataService;
})();
