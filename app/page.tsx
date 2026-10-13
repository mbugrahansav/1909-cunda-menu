import Image from "next/image";
import type { CSSProperties } from "react";
import { getAppearanceSettings, getCategories } from "@/lib/db";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("tr-TR");

export default async function MenuPage() {
  const [categories, appearance] = await Promise.all([getCategories(), getAppearanceSettings()]);
  const menuStyle = {
    "--menu-header-bg": appearance.headerBackground,
    "--menu-nav-bg": appearance.navBackground,
    "--menu-content-bg": appearance.menuBackground,
    "--menu-footer-bg": appearance.footerBackground,
    "--menu-category-text": appearance.categoryTextColor,
    "--menu-section-heading": appearance.sectionHeadingColor,
    "--menu-footer-text": appearance.footerTextColor,
  } as CSSProperties;
  return (
    <main className="menu-page" style={menuStyle}>
      <header className="brand">
        <div className="brand-logo-frame">
          <Image
            className="brand-logo"
            src="/1909-cunda-logo.png"
            alt="1909 Cunda"
            width={2344}
            height={4169}
            priority
          />
        </div>
        <p>KOKTEYL <span style={{fontSize: "14px"}}>ve</span> YEMEK</p>
      </header>
      <div className="category-nav-shell">
        <nav className="category-nav" aria-label="Menü kategorileri">
          {categories.map((category) => <a key={category.id} href={`#kategori-${category.id}`}>{category.name}</a>)}
        </nav>
      </div>
      <div className="menu-content">
        {categories.map((category, index) => (
          <section className="menu-section" id={`kategori-${category.id}`} key={category.id}>
            <div className="section-heading"><span>{String(index + 1).padStart(2, "0")}</span><h2>{category.name}</h2></div>
            <div className="product-list">
              {category.products.map((product) => (
                <article className={`menu-product ${!product.isAvailable ? "sold-out" : ""}`} key={product.id}>
                  <div className="product-line"><h3>{product.name}</h3><span className="dots"/><strong>{money.format(product.price)} ₺</strong></div>
                  {product.description && <p>{product.description}</p>}
                  {(product.calories !== null || product.allergens) && <div className="product-details">
                    {product.calories !== null && <span>{product.calories} kcal</span>}
                    {product.allergens && <span><b>Alerjenler:</b> {product.allergens}</span>}
                  </div>}
                  {!product.isAvailable && <span className="unavailable-label">Şu an mevcut değil</span>}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
      <footer><div className="footer-mark">1909</div><p>Fiyatlarımıza KDV dahildir.</p></footer>
    </main>
  );
}
