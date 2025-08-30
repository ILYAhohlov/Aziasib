import { useState } from "react";
import { Search, Minus, Plus } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { StickyFooter } from "./StickyFooter";
import { ProductModal } from "./ProductModal";
import { Button } from "./ui/button";
import { Screen } from "../App";

interface Product {
  id: string;
  name: string;
  image: string;
  images?: string[];
  price: number;
  category: string;
  minOrder: number;
  unit: string;
  description?: string;
  shelfLife?: string;
  allergens?: string;
}

interface CatalogScreenProps {
  navigateToScreen: (screen: Screen) => void;
  cartItemsCount: number;
  addToCart: (product: Product, quantity: number) => void;
}

// Мокированные данные товаров
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Огурцы свежие",
    image: "https://images.unsplash.com/photo-1560433802-62c9db426a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHZlZ2V0YWJsZXMlMjBjdWN1bWJlcnxlbnwxfHx8fDE3NTY1MzY2NTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    price: 50,
    category: "овощи",
    minOrder: 10,
    unit: "кг",
    description: "Свежие огурцы из Узбекистана. Хрустящие и сочные.",
    shelfLife: "7 дней",
    allergens: "Нет"
  },
  {
    id: "2",
    name: "Яблоки Гала",
    image: "https://images.unsplash.com/photo-1571535911609-4f7afc6af16b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGFwcGxlcyUyMGdhbGElMjByZWR8ZW58MXx8fHwxNzU2NTM2NjY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    price: 120,
    category: "фрукты",
    minOrder: 20,
    unit: "кг",
    description: "Сладкие красные яблоки сорта Гала. Отличное качество.",
    shelfLife: "30 дней",
    allergens: "Нет"
  },
  {
    id: "3",
    name: "Черный перец горошком",
    image: "https://images.unsplash.com/photo-1649952052743-5e8f37c348c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHBlcHBlciUyMHNwaWNlfGVufDF8fHx8MTc1NjUzNjY2OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    price: 280,
    category: "специи",
    minOrder: 1,
    unit: "кг",
    description: "Ароматный черный перец горошком высшего сорта.",
    shelfLife: "2 года",
    allergens: "Нет"
  },
  {
    id: "4",
    name: "Помидоры розовые",
    image: "https://images.unsplash.com/photo-1683008952375-410ae668e6b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHRvbWF0b2VzfGVufDF8fHx8MTc1NjQyNzE5OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    price: 80,
    category: "овощи",
    minOrder: 15,
    unit: "кг",
    description: "Сочные розовые помидоры. Идеальны для салатов.",
    shelfLife: "7 дней",
    allergens: "Нет"
  },
  {
    id: "5",
    name: "Бананы эквадорские",
    image: "https://images.unsplash.com/photo-1745488791982-92e422ca5290?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGJhbmFuYXN8ZW58MXx8fHwxNzU2NTM2Njc0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    price: 90,
    category: "фрукты",
    minOrder: 10,
    unit: "кг",
    description: "Спелые сладкие бананы из Эквадора.",
    shelfLife: "5 дней",
    allergens: "Нет"
  }
];

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onCardClick: (product: Product) => void;
}

function ProductCard({ product, onAddToCart, onCardClick }: ProductCardProps) {
  const [quantity, setQuantity] = useState(product.minOrder);
  const isQuantityValid = quantity >= product.minOrder;

  const increaseQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(prev => prev + product.minOrder);
  };

  const decreaseQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(prev => Math.max(product.minOrder, prev - product.minOrder));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = parseInt(e.target.value) || 0;
    setQuantity(value);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isQuantityValid) {
      onAddToCart(product, quantity);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onCardClick(product)}
    >
      {/* Изображение */}
      <div className="w-full h-48 bg-gray-100">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Информация */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.name}</h3>
          <p className="text-sm text-gray-500 capitalize">{product.category}</p>
        </div>

        <div className="space-y-1">
          <p className="text-green-600 font-semibold text-lg">{product.price} руб/{product.unit}</p>
          <p className="text-gray-600 text-sm">От {product.minOrder} {product.unit}</p>
        </div>

        {/* Выбор количества */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Button
              onClick={decreaseQuantity}
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0 bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
              disabled={quantity <= product.minOrder}
            >
              <Minus className="w-3 h-3" />
            </Button>
            
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              min={product.minOrder}
              step={product.minOrder}
              className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
            
            <Button
              onClick={increaseQuantity}
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0 bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
            >
              <Plus className="w-3 h-3" />
            </Button>
            
            <span className="text-sm text-gray-600">{product.unit}</span>
          </div>
          
          {!isQuantityValid && (
            <p className="text-red-500 text-xs">
              Минимум {product.minOrder} {product.unit}
            </p>
          )}
        </div>

        {/* Кнопка добавить в корзину */}
        <Button
          onClick={handleAddToCart}
          disabled={!isQuantityValid}
          className="w-full bg-green-500 hover:bg-green-600 text-white"
        >
          Добавить {quantity} {product.unit}
        </Button>
      </div>
    </div>
  );
}

export function CatalogScreen({ navigateToScreen, cartItemsCount, addToCart }: CatalogScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Хедер */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-semibold text-center text-gray-900 mb-4">
            Азия-Сибирь - оптовый рынок онлайн
          </h1>
          
          {/* Поисковая строка */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск товаров"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </header>

      {/* Сетка товаров */}
      <main className="px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              onCardClick={handleProductClick}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Товары не найдены</p>
          </div>
        )}
      </main>

      {/* Модал деталей товара */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={true}
          onClose={handleCloseModal}
          onAddToCart={addToCart}
        />
      )}

      {/* Sticky Footer */}
      <StickyFooter 
        navigateToScreen={navigateToScreen} 
        cartItemsCount={cartItemsCount}
        currentScreen="catalog"
      />
    </div>
  );
}