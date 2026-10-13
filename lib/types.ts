export type Product = {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  calories: number | null;
  allergens: string;
  price: number;
  isVisible: boolean;
  isAvailable: boolean;
  sortOrder: number;
};

export type Category = {
  id: number;
  name: string;
  sortOrder: number;
  products: Product[];
};

export type AppearanceSettings = {
  headerBackground: string;
  navBackground: string;
  menuBackground: string;
  footerBackground: string;
  categoryTextColor: string;
  sectionHeadingColor: string;
  footerTextColor: string;
};
