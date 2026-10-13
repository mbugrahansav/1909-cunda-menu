import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getAppearanceSettings, getCategories } from "@/lib/db";
import { AddProductForm, AppearanceEditor, CategoryManager, ProductList } from "./components";
import { addCategoryAction, logoutAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAuthenticated())) redirect("/admin/giris");
  const [categories, appearance] = await Promise.all([getCategories(true), getAppearanceSettings()]);
  const products = categories.flatMap((category) => category.products);
  const unavailable = products.filter((product) => !product.isAvailable).length;
  const hidden = products.filter((product) => !product.isVisible).length;
  return (
    <main className="admin-page">
      <aside className="sidebar">
        <a className="admin-logo" href="/admin">1909</a>
        <nav><a className="active" href="#urunler">Ürünler</a><a href="#kategoriler">Kategoriler</a><a href="#kisisellestirme">Kişiselleştirme</a><a href="/" target="_blank">Menüyü görüntüle ↗</a></nav>
        <form action={logoutAction}><button className="text-button">Çıkış yap</button></form>
      </aside>
      <nav className="mobile-admin-nav" aria-label="Mobil yönetim menüsü">
        <a href="#urunler"><span>☰</span>Ürünler</a>
        <a href="#kategoriler"><span>▦</span>Kategoriler</a>
        <a href="#kisisellestirme"><span>◉</span>Görünüm</a>
        <a href="/" target="_blank"><span>↗</span>Menüyü aç</a>
      </nav>
      <div className="admin-main">
        <header className="admin-header"><div><p className="eyebrow">1909 Cunda</p><h1>Menü yönetimi</h1></div><AddProductForm categories={categories}/></header>
        <section className="stat-grid">
          <div><span>Toplam ürün</span><strong>{products.length}</strong></div>
          <div><span>Aktif kategori</span><strong>{categories.length}</strong></div>
          <div><span>Satışa kapalı</span><strong>{unavailable}</strong></div>
          <div><span>Gizli ürün</span><strong>{hidden}</strong></div>
        </section>
        <section id="urunler" className="panel-section">
          <div className="panel-title"><div><p className="eyebrow">Menü</p><h2>Ürünler</h2></div><span>{products.length} ürün</span></div>
          <ProductList categories={categories}/>
        </section>
        <section id="kategoriler" className="panel-section category-manager">
          <div className="panel-title"><div><p className="eyebrow">Düzen</p><h2>Kategoriler</h2></div></div>
          <form action={addCategoryAction} className="inline-form"><input name="name" required placeholder="Yeni kategori adı"/><button className="secondary-button">Kategori ekle</button></form>
          <CategoryManager categories={categories}/>
        </section>
        <section id="kisisellestirme" className="panel-section appearance-section">
          <div className="panel-title"><div><p className="eyebrow">Görünüm</p><h2>Kişiselleştirme</h2></div></div>
          <AppearanceEditor settings={appearance}/>
        </section>
      </div>
    </main>
  );
}
