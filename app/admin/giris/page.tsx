import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { loginAction } from "../actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ hata?: string }> }) {
  if (await isAuthenticated()) redirect("/admin");
  const { hata } = await searchParams;
  return (
    <main className="login-page">
      <div className="login-card">
        <a href="/" className="back-link">← Menüye dön</a>
        <div className="login-logo">1909</div>
        <p className="eyebrow">Yönetim paneli</p>
        <h1>Tekrar hoş geldiniz.</h1>
        <p className="muted">Menünüzü yönetmek için şifrenizi girin.</p>
        <form action={loginAction} className="stack-form">
          <label>Şifre<input type="password" name="password" autoFocus required placeholder="••••••••" /></label>
          {hata && <p className="form-error">Şifre doğru değil. Tekrar deneyin.</p>}
          <button className="primary-button">Panele giriş yap</button>
        </form>
      </div>
    </main>
  );
}
