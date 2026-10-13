"use client";

import { useEffect, useRef, useState, type FormEvent, type PointerEvent } from "react";
import type { AppearanceSettings, Category, Product } from "@/lib/types";
import { addProductAction, deleteCategoryAction, deleteProductAction, reorderCategoriesAction, reorderProductsAction, toggleProductAction, updateAppearanceAction, updateCategoryAction, updateProductAction } from "./actions";

const colorPalette = ["#FAF9F6", "#FFFFFF", "#E0DBC5", "#D8C8B4", "#C5B29C", "#C9D1C3", "#D6E1E8", "#E5CBC5", "#182019", "#7D0001"];

export function AppearanceEditor({ settings }: { settings: AppearanceSettings }) {
  const [colors, setColors] = useState(settings);
  const [savedColors, setSavedColors] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const hasChanges = JSON.stringify(colors) !== JSON.stringify(savedColors);

  function setColor(key: keyof AppearanceSettings, value: string) {
    setColors((current) => ({ ...current, [key]: value.toUpperCase() }));
    setMessage("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updateAppearanceAction(new FormData(event.currentTarget));
      setSavedColors(colors);
      setMessage("Renkler canlı menüye uygulandı.");
    } catch {
      setMessage("Renkler kaydedilemedi. Tekrar deneyin.");
    } finally { setSaving(false); }
  }

  const fields: { key: keyof AppearanceSettings; label: string; help: string }[] = [
    { key: "headerBackground", label: "Banner / header", help: "Logo ve sloganın arkasındaki alan" },
    { key: "navBackground", label: "Kategori menüsü", help: "Yatay kategori çubuğunun zemini" },
    { key: "menuBackground", label: "Menü zemini", help: "Kategori ve ürünlerin bulunduğu ana alan" },
    { key: "footerBackground", label: "Footer zemini", help: "Sayfanın en altındaki alanın arka planı" },
    { key: "categoryTextColor", label: "Menü başlıkları rengi", help: "Yatay menü çubuğundaki kategori bağlantıları" },
    { key: "sectionHeadingColor", label: "Kategori başlıkları rengi", help: "Menü içindeki büyük kategori başlıkları" },
    { key: "footerTextColor", label: "Footer yazıları", help: "Footer içindeki 1909 ve bilgi metni" },
  ];

  return <div className="appearance-editor">
    <form className="appearance-controls" onSubmit={save}>
      {fields.map((field) => <fieldset className="color-field" key={field.key}>
        <legend>{field.label}</legend>
        <p>{field.help}</p>
        <div className="color-palette">
          {colorPalette.map((color) => <button
            type="button"
            key={color}
            className={colors[field.key] === color ? "selected" : ""}
            style={{ backgroundColor: color }}
            onClick={() => setColor(field.key, color)}
            aria-label={`${field.label}: ${color}`}
            title={color}
          />)}
        </div>
        <div className="custom-color">
          <input type="color" value={colors[field.key]} onChange={(event) => setColor(field.key, event.target.value)}/>
          <input name={field.key} value={colors[field.key]} readOnly aria-label={`${field.label} renk kodu`}/>
        </div>
      </fieldset>)}
      <div className="appearance-actions">
        <button type="button" className="icon-button" disabled={!hasChanges} onClick={() => { setColors(savedColors); setMessage(""); }}>Değişiklikleri geri al</button>
        <button className="primary-button" disabled={!hasChanges || saving}>{saving ? "Kaydediliyor..." : "Renkleri kaydet"}</button>
      </div>
      {message && <p className="appearance-message">{message}</p>}
    </form>
    <div className="appearance-preview-wrap">
      <div className="preview-heading"><span>Canlı önizleme</span>{hasChanges && <em>Kaydedilmedi</em>}</div>
      <div className="appearance-preview">
        <div className="preview-brand" style={{ backgroundColor: colors.headerBackground }}>
          <strong>1909</strong><span>KOKTEYL VE YEMEK</span>
        </div>
        <div className="preview-nav" style={{ backgroundColor: colors.navBackground, color: colors.categoryTextColor }}><span>KOKTEYLLER</span><i style={{ color: colors.sectionHeadingColor }}>◆</i><span>YEMEKLER</span><i style={{ color: colors.sectionHeadingColor }}>◆</i><span>İÇECEKLER</span></div>
        <div className="preview-menu" style={{ backgroundColor: colors.menuBackground }}>
          <div><small>01</small><h3 style={{ color: colors.sectionHeadingColor }}>İmza Kokteyller</h3></div>
          <div className="preview-products"><p><b>REYHAN</b><span/><strong>650 ₺</strong></p><em>Reyhan, cin, limon ve narenciye</em><p><b>LOKAL</b><span/><strong>650 ₺</strong></p></div>
        </div>
        <div className="preview-footer" style={{ backgroundColor: colors.footerBackground, color: colors.footerTextColor }}><strong>1909</strong><span>FİYATLARIMIZA KDV DAHİLDİR.</span></div>
      </div>
      <p className="preview-note">Menünün anlık önizlemesidir. Değişiklikler kaydedilmeden canlı menü değişmez.</p>
    </div>
  </div>;
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [orderedCategories, setOrderedCategories] = useState(categories);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const orderRef = useRef(categories);
  const draggingIdRef = useRef<number | null>(null);

  useEffect(() => { setOrderedCategories(categories); orderRef.current = categories; }, [categories]);

  function startDragging(id: number) {
    draggingIdRef.current = id;
    setDraggingId(id);
  }

  function moveDraggedCategory(overId: number) {
    const activeId = draggingIdRef.current;
    if (activeId === null || activeId === overId) return;
    setOrderedCategories((current) => {
      const from = current.findIndex((category) => category.id === activeId);
      const to = current.findIndex((category) => category.id === overId);
      if (from < 0 || to < 0) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      orderRef.current = next;
      return next;
    });
  }

  async function saveOrder() {
    if (draggingIdRef.current === null) return;
    draggingIdRef.current = null;
    setDraggingId(null);
    const form = new FormData();
    form.set("categoryOrder", JSON.stringify(orderRef.current.map((category) => category.id)));
    await reorderCategoriesAction(form);
  }

  function moveWithPointer(event: PointerEvent<HTMLSpanElement>) {
    if (event.pointerType === "mouse" || draggingIdRef.current === null) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-category-id]");
    if (target?.dataset.categoryId) moveDraggedCategory(Number(target.dataset.categoryId));
  }

  return <div className="category-list">
    {orderedCategories.map((category) => <div
      className={`category-row ${draggingId === category.id ? "is-dragging" : ""}`}
      key={category.id}
      data-category-id={category.id}
      draggable={editingId !== category.id}
      onDragStart={(event) => { startDragging(category.id); event.dataTransfer.effectAllowed = "move"; }}
      onDragOver={(event) => { event.preventDefault(); moveDraggedCategory(category.id); }}
      onDrop={(event) => { event.preventDefault(); void saveOrder(); }}
      onDragEnd={() => { if (draggingIdRef.current !== null) void saveOrder(); }}
    >
      <span
        className="category-drag-handle"
        aria-hidden="true"
        title="Sıralamak için sürükleyin"
        draggable={editingId !== category.id}
        onDragStart={(event) => { event.stopPropagation(); startDragging(category.id); event.dataTransfer.effectAllowed = "move"; }}
        onPointerDown={(event) => { if (event.pointerType !== "mouse") { event.currentTarget.setPointerCapture(event.pointerId); startDragging(category.id); } }}
        onPointerMove={moveWithPointer}
        onPointerUp={(event) => { if (event.pointerType !== "mouse") void saveOrder(); }}
        onPointerCancel={() => { draggingIdRef.current = null; setDraggingId(null); }}
      >⠿</span>
      {editingId === category.id ? <form className="category-edit-form" action={async (data) => { await updateCategoryAction(data); setEditingId(null); }}>
        <input type="hidden" name="id" value={category.id}/>
        <input name="name" defaultValue={category.name} required autoFocus aria-label="Kategori adı"/>
        <button className="secondary-button">Kaydet</button>
        <button type="button" className="icon-button" onClick={() => setEditingId(null)}>Vazgeç</button>
      </form> : <>
        <div className="category-row-name"><strong>{category.name}</strong><span>{category.products.length} ürün</span></div>
        <div className="category-row-actions">
          <button type="button" className="icon-button" onClick={() => setEditingId(category.id)}>Düzenle</button>
          <span className={`category-delete-control ${category.products.length ? "has-tooltip" : ""}`} data-tooltip="Ürüne sahip kategoriler silinemez">
            <form action={deleteCategoryAction}>
              <input type="hidden" name="id" value={category.id}/>
              <button className="category-delete-button" disabled={category.products.length > 0} aria-label={`${category.name} kategorisini sil`}>×</button>
            </form>
          </span>
        </div>
      </>}
    </div>)}
  </div>;
}

export function ProductList({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState("");
  const [orderedCategories, setOrderedCategories] = useState(categories);
  const [openCategories, setOpenCategories] = useState<Set<number>>(() => new Set(categories[0] ? [categories[0].id] : []));
  const [draggingProductId, setDraggingProductId] = useState<number | null>(null);
  const productOrderRef = useRef(categories);
  const draggingProductRef = useRef<{ categoryId: number; productId: number } | null>(null);

  useEffect(() => { setOrderedCategories(categories); productOrderRef.current = categories; }, [categories]);

  const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
  const filteredCategories = orderedCategories.map((category) => ({
    ...category,
    products: normalizedQuery
      ? category.products.filter((product) => product.name.toLocaleLowerCase("tr-TR").includes(normalizedQuery))
      : category.products,
  })).filter((category) => !normalizedQuery || category.products.length > 0);
  const resultCount = filteredCategories.reduce((total, category) => total + category.products.length, 0);

  function toggleCategory(id: number) {
    setOpenCategories((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function startProductDrag(categoryId: number, productId: number) {
    draggingProductRef.current = { categoryId, productId };
    setDraggingProductId(productId);
  }

  function moveProduct(categoryId: number, overProductId: number) {
    const active = draggingProductRef.current;
    if (!active || active.categoryId !== categoryId || active.productId === overProductId) return;
    setOrderedCategories((current) => {
      const next = current.map((category) => {
        if (category.id !== categoryId) return category;
        const products = [...category.products];
        const from = products.findIndex((product) => product.id === active.productId);
        const to = products.findIndex((product) => product.id === overProductId);
        if (from < 0 || to < 0) return category;
        const [moved] = products.splice(from, 1);
        products.splice(to, 0, moved);
        return { ...category, products };
      });
      productOrderRef.current = next;
      return next;
    });
  }

  async function persistProductOrder(categoryId: number) {
    if (!draggingProductRef.current) return;
    draggingProductRef.current = null;
    setDraggingProductId(null);
    const category = productOrderRef.current.find((item) => item.id === categoryId);
    if (!category) return;
    const form = new FormData();
    form.set("categoryId", String(categoryId));
    form.set("productOrder", JSON.stringify(category.products.map((product) => product.id)));
    await reorderProductsAction(form);
  }

  async function sortProductsByPrice(categoryId: number, direction: "asc" | "desc") {
    const category = productOrderRef.current.find((item) => item.id === categoryId);
    if (!category) return;
    const sortedProducts = [...category.products].sort((a, b) => direction === "asc" ? a.price - b.price : b.price - a.price);
    const next = productOrderRef.current.map((item) => item.id === categoryId ? { ...item, products: sortedProducts } : item);
    productOrderRef.current = next;
    setOrderedCategories(next);
    const form = new FormData();
    form.set("categoryId", String(categoryId));
    form.set("productOrder", JSON.stringify(sortedProducts.map((product) => product.id)));
    await reorderProductsAction(form);
  }

  function moveProductWithPointer(event: PointerEvent<HTMLSpanElement>, categoryId: number) {
    if (event.pointerType === "mouse" || !draggingProductRef.current) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-product-id]");
    if (target?.dataset.productId) moveProduct(categoryId, Number(target.dataset.productId));
  }

  return <>
    <div className="product-search">
      <span aria-hidden="true">⌕</span>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Ürün adıyla ara..."
        aria-label="Ürün adıyla filtrele"
      />
      {query && <button type="button" onClick={() => setQuery("")} aria-label="Aramayı temizle">×</button>}
    </div>
    {normalizedQuery && <p className="search-result">{resultCount} ürün bulundu</p>}
    <div className="category-groups">
      {filteredCategories.map((category) => {
        const isOpen = Boolean(normalizedQuery) || openCategories.has(category.id);
        return <div className={`admin-category ${isOpen ? "is-open" : ""}`} key={category.id}>
          <div className="accordion-header">
            <button type="button" className="accordion-toggle" onClick={() => toggleCategory(category.id)} aria-expanded={isOpen} aria-controls={`urunler-${category.id}`}>
              <span className="accordion-chevron" aria-hidden="true"/><strong>{category.name}</strong><em>{category.products.length} ürün</em>
            </button>
            <div className="price-sort" aria-label={`${category.name} fiyat sıralaması`}>
              <span>Fiyata göre sırala</span>
              <button type="button" onClick={() => void sortProductsByPrice(category.id, "asc")} title="Fiyatı artan sırala" aria-label="Fiyatı artan sırala">₺ ↑</button>
              <button type="button" onClick={() => void sortProductsByPrice(category.id, "desc")} title="Fiyatı azalan sırala" aria-label="Fiyatı azalan sırala">₺ ↓</button>
            </div>
          </div>
          {isOpen && <div className="product-table accordion-content" id={`urunler-${category.id}`}>
            {category.products.map((product) => <div className={`product-sort-row ${draggingProductId === product.id ? "is-dragging" : ""}`} key={product.id} data-product-id={product.id} onDragOver={(event) => { event.preventDefault(); moveProduct(category.id, product.id); }} onDrop={(event) => { event.preventDefault(); void persistProductOrder(category.id); }}>
              <span className="product-drag-handle" draggable title="Ürünü sıralamak için sürükleyin" aria-label={`${product.name} ürününü sırala`} onDragStart={(event) => { startProductDrag(category.id, product.id); event.dataTransfer.effectAllowed = "move"; }} onDragEnd={() => { if (draggingProductRef.current) void persistProductOrder(category.id); }} onPointerDown={(event) => { if (event.pointerType !== "mouse") { event.currentTarget.setPointerCapture(event.pointerId); startProductDrag(category.id, product.id); } }} onPointerMove={(event) => moveProductWithPointer(event, category.id)} onPointerUp={(event) => { if (event.pointerType !== "mouse") void persistProductOrder(category.id); }} onPointerCancel={() => { draggingProductRef.current = null; setDraggingProductId(null); }}>⠿</span>
              <ProductEditor product={product} categories={orderedCategories}/>
            </div>)}
            {!category.products.length && <p className="empty-state">Bu kategoride henüz ürün yok.</p>}
          </div>}
        </div>;
      })}
      {normalizedQuery && resultCount === 0 && <div className="no-search-result"><strong>Ürün bulunamadı</strong><p>Farklı bir ürün adı deneyin.</p></div>}
    </div>
  </>;
}

export function AddProductForm({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  return <><button className="primary-button" onClick={() => setOpen(true)}>+ Yeni ürün</button>{open && <div className="modal-backdrop" onMouseDown={() => setOpen(false)}><div className="modal" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setOpen(false)}>×</button><p className="eyebrow">Menü</p><h2>Yeni ürün ekle</h2><form action={async (data) => { await addProductAction(data); setOpen(false); }} className="stack-form"><label>Ürün adı<input name="name" required placeholder="Örn. Reyhan"/></label><label>Kategori<select name="categoryId" required>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Fiyat (₺)<input name="price" required type="number" min="0" inputMode="numeric"/></label><label>Açıklama<textarea name="description" rows={3} placeholder="İçerik veya kısa açıklama"/></label><div className="form-row"><label>Kalori (kcal)<input name="calories" type="number" min="0" inputMode="numeric" placeholder="Örn. 850"/></label><label>Alerjen maddeler<input name="allergens" type="text" placeholder="Örn. süt, badem, gluten"/></label></div><button className="primary-button">Ürünü ekle</button></form></div></div>}</>;
}

export function ProductEditor({ product, categories }: { product: Product; categories: Category[] }) {
  const [editing, setEditing] = useState(false);
  return <div className={`admin-product ${!product.isVisible ? "is-hidden" : ""}`}>
    <div className="product-info"><div className="status-dot" data-active={product.isAvailable && product.isVisible}/><div><strong>{product.name}</strong><p>{product.description || "Açıklama yok"}</p>{(product.calories !== null || product.allergens) && <div className="admin-product-details">{product.calories !== null && <span>{product.calories} kcal</span>}{product.allergens && <span><b>Alerjenler:</b> {product.allergens}</span>}</div>}<div className="mobile-badges">{!product.isVisible && <span>Gizli</span>}{!product.isAvailable && <span>Satışa kapalı</span>}</div></div></div>
    <strong className="admin-price">{new Intl.NumberFormat("tr-TR").format(product.price)} ₺</strong>
    <div className="row-actions">
      <form action={toggleProductAction}><input type="hidden" name="id" value={product.id}/><input type="hidden" name="field" value="is_available"/><button className={product.isAvailable ? "icon-button" : "icon-button active"} title="Satış durumunu değiştir">{product.isAvailable ? "Satışı kapat" : "Satışa aç"}</button></form>
      <form action={toggleProductAction}><input type="hidden" name="id" value={product.id}/><input type="hidden" name="field" value="is_visible"/><button className={product.isVisible ? "icon-button" : "icon-button active"}>{product.isVisible ? "Gizle" : "Göster"}</button></form>
      <button className="icon-button" onClick={() => setEditing(true)}>Düzenle</button>
    </div>
    {editing && <div className="modal-backdrop" onMouseDown={() => setEditing(false)}><div className="modal" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setEditing(false)}>×</button><p className="eyebrow">Ürün düzenle</p><h2>{product.name}</h2><form action={async (data) => { await updateProductAction(data); setEditing(false); }} className="stack-form"><input type="hidden" name="id" value={product.id}/><label>Ürün adı<input name="name" required defaultValue={product.name}/></label><label>Kategori<select name="categoryId" defaultValue={product.categoryId}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Fiyat (₺)<input name="price" required type="number" min="0" defaultValue={product.price}/></label><label>Açıklama<textarea name="description" rows={3} defaultValue={product.description}/></label><div className="form-row"><label>Kalori (kcal)<input name="calories" type="number" min="0" inputMode="numeric" defaultValue={product.calories ?? ""} placeholder="Örn. 850"/></label><label>Alerjen maddeler<input name="allergens" type="text" defaultValue={product.allergens} placeholder="Örn. süt, badem, gluten"/></label></div><button className="primary-button">Değişiklikleri kaydet</button></form><form action={deleteProductAction} onSubmit={(event) => { if (!confirm("Bu ürünü kalıcı olarak silmek istediğinize emin misiniz?")) event.preventDefault(); }}><input type="hidden" name="id" value={product.id}/><button className="danger-button">Ürünü kalıcı olarak sil</button></form></div></div>}
  </div>;
}
