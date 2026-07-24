"use client";

import { useState } from "react";
import type { Category, Product } from "@/lib/types";
import { addProductAction, deleteProductAction, toggleProductAction, updateProductAction } from "./actions";

export function ProductList({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
  const filteredCategories = categories.map((category) => ({
    ...category,
    products: normalizedQuery
      ? category.products.filter((product) => product.name.toLocaleLowerCase("tr-TR").includes(normalizedQuery))
      : category.products,
  })).filter((category) => !normalizedQuery || category.products.length > 0);
  const resultCount = filteredCategories.reduce((total, category) => total + category.products.length, 0);

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
      {filteredCategories.map((category) => (
        <div className="admin-category" key={category.id}>
          <h3>{category.name}<span>{category.products.length}</span></h3>
          <div className="product-table">
            {category.products.map((product) => <ProductEditor key={product.id} product={product} categories={categories}/>)}
            {!category.products.length && <p className="empty-state">Bu kategoride henüz ürün yok.</p>}
          </div>
        </div>
      ))}
      {normalizedQuery && resultCount === 0 && <div className="no-search-result"><strong>Ürün bulunamadı</strong><p>Farklı bir ürün adı deneyin.</p></div>}
    </div>
  </>;
}

export function AddProductForm({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  return <><button className="primary-button" onClick={() => setOpen(true)}>+ Yeni ürün</button>{open && <div className="modal-backdrop" onMouseDown={() => setOpen(false)}><div className="modal" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setOpen(false)}>×</button><p className="eyebrow">Menü</p><h2>Yeni ürün ekle</h2><form action={async (data) => { await addProductAction(data); setOpen(false); }} className="stack-form"><label>Ürün adı<input name="name" required placeholder="Örn. Reyhan"/></label><label>Kategori<select name="categoryId" required>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Fiyat (₺)<input name="price" required type="number" min="0" inputMode="numeric"/></label><label>Açıklama<textarea name="description" rows={3} placeholder="İçerik veya kısa açıklama"/></label><button className="primary-button">Ürünü ekle</button></form></div></div>}</>;
}

export function ProductEditor({ product, categories }: { product: Product; categories: Category[] }) {
  const [editing, setEditing] = useState(false);
  return <div className={`admin-product ${!product.isVisible ? "is-hidden" : ""}`}>
    <div className="product-info"><div className="status-dot" data-active={product.isAvailable && product.isVisible}/><div><strong>{product.name}</strong><p>{product.description || "Açıklama yok"}</p><div className="mobile-badges">{!product.isVisible && <span>Gizli</span>}{!product.isAvailable && <span>Satışa kapalı</span>}</div></div></div>
    <strong className="admin-price">{new Intl.NumberFormat("tr-TR").format(product.price)} ₺</strong>
    <div className="row-actions">
      <form action={toggleProductAction}><input type="hidden" name="id" value={product.id}/><input type="hidden" name="field" value="is_available"/><button className={product.isAvailable ? "icon-button" : "icon-button active"} title="Satış durumunu değiştir">{product.isAvailable ? "Satışı kapat" : "Satışa aç"}</button></form>
      <form action={toggleProductAction}><input type="hidden" name="id" value={product.id}/><input type="hidden" name="field" value="is_visible"/><button className={product.isVisible ? "icon-button" : "icon-button active"}>{product.isVisible ? "Gizle" : "Göster"}</button></form>
      <button className="icon-button" onClick={() => setEditing(true)}>Düzenle</button>
    </div>
    {editing && <div className="modal-backdrop" onMouseDown={() => setEditing(false)}><div className="modal" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setEditing(false)}>×</button><p className="eyebrow">Ürün düzenle</p><h2>{product.name}</h2><form action={async (data) => { await updateProductAction(data); setEditing(false); }} className="stack-form"><input type="hidden" name="id" value={product.id}/><label>Ürün adı<input name="name" required defaultValue={product.name}/></label><label>Kategori<select name="categoryId" defaultValue={product.categoryId}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Fiyat (₺)<input name="price" required type="number" min="0" defaultValue={product.price}/></label><label>Açıklama<textarea name="description" rows={3} defaultValue={product.description}/></label><button className="primary-button">Değişiklikleri kaydet</button></form><form action={deleteProductAction} onSubmit={(event) => { if (!confirm("Bu ürünü kalıcı olarak silmek istediğinize emin misiniz?")) event.preventDefault(); }}><input type="hidden" name="id" value={product.id}/><button className="danger-button">Ürünü kalıcı olarak sil</button></form></div></div>}
  </div>;
}
