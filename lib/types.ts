export type Product = {
  id: number;
  categoryId: number;
  name: string;
  description: string;
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
