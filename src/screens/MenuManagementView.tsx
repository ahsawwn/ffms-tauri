import React, { useEffect, useState } from 'react';
import { fetchCategories, fetchProducts, addCategory, deleteCategory, addProduct, deleteProduct, fetchInventory, fetchRecipes } from '../db/posQueries';
import { addRecipeLine, deleteRecipeLine } from '../db/inventoryQueries';
import { CategoryManager } from '../components/menu/CategoryManager';
import { AddProductModal } from '../components/menu/AddProductModal';
import { RecipeEditor } from '../components/inventory/RecipeEditor';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { products, inventoryItems, productRecipes } from '../db/schema';

type Product = typeof products.$inferSelect;
type Inv = typeof inventoryItems.$inferSelect;
type Rec = typeof productRecipes.$inferSelect;

export const MenuManagementView: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Inv[]>([]);
  const [recipes, setRecipes] = useState<Rec[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [recipeProduct, setRecipeProduct] = useState<Product | null>(null);

  const load = async () => {
    const [c, p, i, r] = await Promise.all([fetchCategories(), fetchProducts(), fetchInventory(), fetchRecipes()]);
    setCategories(c); setProducts(p); setInventory(i); setRecipes(r);
  };
  useEffect(() => { void load(); }, []);

  return (
    <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto">
      <h2 className="font-black uppercase text-2xl">Menu Management</h2>
      <CategoryManager categories={categories} onAdd={(d) => void addCategory(d).then(load)} onDelete={(id) => void deleteCategory(id).then(load)} />
      <div className="flex justify-between items-center">
        <h3 className="font-black uppercase text-lg">Products</h3>
        <Button variant="success" onClick={() => setModalOpen(true)}>Add Product</Button>
      </div>
      <div className="brutal-card p-4 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b-3 border-black">
            <th className="p-2 text-left font-black uppercase">Name</th>
            <th className="p-2 text-left font-black uppercase">Category</th>
            <th className="p-2 text-left font-black uppercase">Price</th>
            <th className="p-2 text-left font-black uppercase">Status</th>
            <th className="p-2 text-left font-black uppercase">Actions</th>
          </tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b-2 border-black/20">
                <td className="p-2 font-bold">{p.name}</td>
                <td className="p-2">{categories.find((c) => c.id === p.categoryId)?.name}</td>
                <td className="p-2">PKR {p.price}</td>
                <td className="p-2"><Badge variant={p.isAvailable ? 'lime' : 'orange'}>{p.isAvailable ? 'On' : 'Off'}</Badge></td>
                <td className="p-2 flex gap-2">
                  <Button size="sm" variant="info" onClick={() => setRecipeProduct(p)}>Recipe</Button>
                  <Button size="sm" variant="danger" onClick={() => void deleteProduct(p.id).then(load)}>Del</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddProductModal open={modalOpen} categories={categories} onClose={() => setModalOpen(false)} onSave={(d) => void addProduct(d).then(load)} />
      {recipeProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="brutal-card p-4 bg-[#F4F0EA] w-full max-w-lg flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h2 className="font-black uppercase text-xl">Recipe: {recipeProduct.name}</h2>
              <Button size="sm" variant="danger" onClick={() => setRecipeProduct(null)}>Close</Button>
            </div>
            <RecipeEditor products={products} inventory={inventory} recipes={recipes} initialProductId={recipeProduct.id}
              onAddLine={(pid, iid, qty) => void addRecipeLine({ productId: pid, inventoryItemId: iid, requiredQuantity: qty }).then(load)}
              onDeleteLine={(id) => void deleteRecipeLine(id).then(load)} />
          </div>
        </div>
      )}
    </div>
  );
};
