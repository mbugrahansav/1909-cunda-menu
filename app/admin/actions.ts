"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createCategory, createProduct, deleteCategory, deleteProduct, toggleProduct, updateProduct } from "@/lib/db";
import { createSession, destroySession, isAuthenticated, passwordMatches } from "@/lib/auth";

function text(form: FormData, key: string) { return String(form.get(key) || "").trim(); }
function integer(form: FormData, key: string) { return Number.parseInt(String(form.get(key)), 10); }
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
  const data = { categoryId: integer(form, "categoryId"), name: text(form, "name"), description: text(form, "description"), price: integer(form, "price") };
  if (data.name && data.categoryId > 0 && data.price >= 0) await createProduct(data);
  refresh();
}

export async function updateProductAction(form: FormData) {
  await guard();
  const id = integer(form, "id");
  const data = { categoryId: integer(form, "categoryId"), name: text(form, "name"), description: text(form, "description"), price: integer(form, "price") };
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
