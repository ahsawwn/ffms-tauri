import React, { useEffect, useState } from 'react';
import { fetchProducts, fetchInventory, fetchRecipes } from '../db/posQueries';
import { addIngredient, deleteIngredient, restockIngredient } from '../db/inventoryQueries';
import { addRecipeLine, deleteRecipeLine } from '../db/inventoryQueries';
import { StockTable } from '../components/inventory/StockTable';
import { AddIngredientModal } from '../components/inventory/AddIngredientModal';
import { RecipeEditor } from '../components/inventory/RecipeEditor';
import type { products, inventoryItems, productRecipes } from '../db/schema';

type Product = typeof products.$inferSelect;
type Inv = typeof inventoryItems.$inferSelect;
type Rec = typeof productRecipes.$inferSelect;

export const InventoryView: React.FC = () => {
  const [tab, setTab] = useState<'stock' | 'recipe'>('stock');
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Inv[]>([]);
  const [recipes, setRecipes] = useState<Rec[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    const [p, i, r] = await Promise.all([fetchProducts(), fetchInventory(), fetchRecipes()]);
    setProducts(p); setInventory(i); setRecipes(r);
  };
  useEffect(() => { void load(); }, []);

  const handleRestock = (item: Inv) => {
    const amt = Number(prompt(`Restock amount for ${item.name}`) || 0);
    if (amt > 0) { void restockIngredient(item.id, amt).then(load); }
  };

  return (
    <div className="p-4 flex flex-col gap-4 h-full">
      <div className="flex gap-2">
        <button className={`brutal-btn px-4 py-2 ${tab === 'stock' ? 'bg-[#FFE600]' : 'bg-white'}`} onClick={() => setTab('stock')}>Stock</button>
        <button className={`brutal-btn px-4 py-2 ${tab === 'recipe' ? 'bg-[#FFE600]' : 'bg-white'}`} onClick={() => setTab('recipe')}>Recipes</button>
        {tab === 'stock' && <button className="brutal-btn px-4 py-2 bg-[#A3E635]" onClick={() => setModalOpen(true)}>Add Ingredient</button>}
      </div>
      {tab === 'stock' && (
        <StockTable items={inventory} onRestock={handleRestock} onDelete={(id) => void deleteIngredient(id).then(load)} />
      )}
      {tab === 'recipe' && (
        <RecipeEditor
          products={products}
          inventory={inventory}
          recipes={recipes}
          onAddLine={(pid, iid, qty) => void addRecipeLine({ productId: pid, inventoryItemId: iid, requiredQuantity: qty }).then(load)}
          onDeleteLine={(id) => void deleteRecipeLine(id).then(load)}
        />
      )}
      <AddIngredientModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={(data) => void addIngredient(data).then(load)} />
    </div>
  );
};
