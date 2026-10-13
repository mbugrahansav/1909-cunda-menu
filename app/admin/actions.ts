"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createCategory, createProduct, deleteCategory, deleteProduct, reorderCategories, reorderProducts, toggleProduct, updateAppearanceSettings, updateCategory, updateProduct } from "@/lib/db";
import { createSession, destroySession, isAuthenticated, passwordMatches } from "@/lib/auth";

function text(form: FormData, key: string) { return String(form.get(key) || "").trim(); }
function integer(form: FormData, key: string) { return Number.parseInt(String(form.get(key)), 10); }
function optionalInteger(form: FormData, key: string) {
  const value = text(form, key);
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}
async function guard() { if (!(await isAuthenticated())) redirect("/admin/giris"); }
function refresh() { revalidatePath("/"); revalidatePath("/admin"); }

export async function loginAction(form: FormData) {
  if (!passwordMatches(text(form, "password"))) redirect("/admin/giris?hata=1");
  await createSession();
  redirect("/admin");
}

export async function logoutAction() { await destroySession(); redirect("/admin/giris"); }

export async function addProductAction(form: FormData) {
  await guard();
  const data = { categoryId: integer(form, "categoryId"), name: text(form, "name"), description: text(form, "description"), calories: optionalInteger(form, "calories"), allergens: text(form, "allergens"), price: integer(form, "price") };
  if (data.name && data.categoryId > 0 && data.price >= 0) await createProduct(data);
  refresh();
}

export async function updateProductAction(form: FormData) {
  await guard();
  const id = integer(form, "id");
  const data = { categoryId: integer(form, "categoryId"), name: text(form, "name"), description: text(form, "description"), calories: optionalInteger(form, "calories"), allergens: text(form, "allergens"), price: integer(form, "price") };
  if (id > 0 && data.name && data.categoryId > 0 && data.price >= 0) await updateProduct(id, data);
  refresh();
}

export async function toggleProductAction(form: FormData) {
  await guard();
  const field = text(form, "field");
  if (field === "is_visible" || field === "is_available") await toggleProduct(integer(form, "id"), field);
  refresh();
}

export async function deleteProductAction(form: FormData) { await guard(); await deleteProduct(integer(form, "id")); refresh(); }
export async function addCategoryAction(form: FormData) { await guard(); const name = text(form, "name"); if (name) await createCategory(name); refresh(); }
export async function deleteCategoryAction(form: FormData) { await guard(); await deleteCategory(integer(form, "id")); refresh(); }
export async function updateCategoryAction(form: FormData) {
  await guard();
  const id = integer(form, "id");
  const name = text(form, "name");
  if (id > 0 && name) await updateCategory(id, name);
  refresh();
}
export async function reorderCategoriesAction(form: FormData) {
  await guard();
  let ids: unknown;
  try { ids = JSON.parse(text(form, "categoryOrder")); } catch { return; }
  if (!Array.isArray(ids) || !ids.every((id) => Number.isInteger(id) && id > 0) || new Set(ids).size !== ids.length) return;
  await reorderCategories(ids);
  refresh();
}
export async function reorderProductsAction(form: FormData) {
  await guard();
  const categoryId = integer(form, "categoryId");
  let ids: unknown;
  try { ids = JSON.parse(text(form, "productOrder")); } catch { return; }
  if (categoryId < 1 || !Array.isArray(ids) || !ids.every((id) => Number.isInteger(id) && id > 0) || new Set(ids).size !== ids.length) return;
  await reorderProducts(categoryId, ids);
  refresh();
}

export async function updateAppearanceAction(form: FormData) {
  await guard();
  const settings = {
    headerBackground: text(form, "headerBackground"),
    navBackground: text(form, "navBackground"),
    menuBackground: text(form, "menuBackground"),
    footerBackground: text(form, "footerBackground"),
    categoryTextColor: text(form, "categoryTextColor"),
    sectionHeadingColor: text(form, "sectionHeadingColor"),
    footerTextColor: text(form, "footerTextColor"),
  };
  const isHexColor = (value: string) => /^#[0-9a-f]{6}$/i.test(value);
  if (!Object.values(settings).every(isHexColor)) throw new Error("Geçersiz renk değeri.");
  await updateAppearanceSettings(settings);
  refresh();
  return { success: true };
}
