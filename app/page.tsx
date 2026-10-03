import Image from "next/image";
import { getCategories } from "@/lib/db";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("tr-TR");

export default async function MenuPage() {
  const categories = await getCategories();
  return (
    <main className="menu-page">
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
