import { useState } from "react";
import { Search, Upload, Edit, Trash2, Plus, LogOut } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { StickyFooter } from "./StickyFooter";
import { Button } from "./ui/button";
import { Screen } from "../App";

interface AdminScreenProps {
  navigateToScreen: (screen: Screen) => void;
  cartItemsCount: number;
  onLogout: () => void;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  minOrder: number;
  description: string;
  shelfLife: string;
  allergens: string;
  image: string;
}

interface Order {
  id: string;
  items: string;
  phone: string;
  address: string;
  comments: string;
  status: "Принят" | "В доставке" | "Завершен";
  amount: number;
}

// Мокированные данные
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Огурцы свежие",
    category: "овощи",
    price: 50,
    minOrder: 10,
    description: "Свежие огурцы из Узбекистана",
    shelfLife: "7 дней",
    allergens: "Нет",
    image: "https://images.unsplash.com/photo-1560433802-62c9db426a4d"
  },
  {
    id: "2",
    name: "Яблоки Гала",
    category: "фрукты",
    price: 120,
    minOrder: 20,
    description: "Сладкие красные яблоки",
    shelfLife: "30 дней",
    allergens: "Нет",
    image: "https://images.unsplash.com/photo-1571535911609-4f7afc6af16b"
  }
];

const mockOrders: Order[] = [
  {
    id: "1001",
    items: "Огурцы 10кг, Яблоки 20кг",
    phone: "+7 (999) 123-45-67",
    address: "г. Новосибирск, ул. Ленина, 1",
    comments: "Доставить утром",
    status: "Принят",
    amount: 2900
  },
  {
    id: "1002",
    items: "Помидоры 15кг",
    phone: "+7 (999) 987-65-43",
    address: "г. Новосибирск, пр. Маркса, 10",
    comments: "",
    status: "В доставке",
    amount: 1200
  }
];

interface ProductFormData {
  name: string;
  category: string;
  price: string;
  minOrder: string;
  description: string;
  shelfLife: string;
  allergens: string;
  images: File[];
}

export function AdminScreen({ navigateToScreen, cartItemsCount, onLogout }: AdminScreenProps) {
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [productForm, setProductForm] = useState<ProductFormData>({
    name: "",
    category: "овощи",
    price: "",
    minOrder: "",
    description: "",
    shelfLife: "",
    allergens: "",
    images: []
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3);
    setProductForm(prev => ({ ...prev, images: files }));
  };

  const handleProductSubmit = () => {
    if (!productForm.name || !productForm.price || !productForm.minOrder) {
      alert("Заполните обязательные поля");
      return;
    }

    const productData = {
      id: editingProduct?.id || Date.now().toString(),
      name: productForm.name,
      category: productForm.category,
      price: parseInt(productForm.price),
      minOrder: parseInt(productForm.minOrder),
      description: productForm.description,
      shelfLife: productForm.shelfLife,
      allergens: productForm.allergens,
      image: "https://images.unsplash.com/photo-1560433802-62c9db426a4d" // Мокированное изображение
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? productData : p));
      setEditingProduct(null);
    } else {
      setProducts(prev => [...prev, productData]);
    }

    // Сброс формы
    setProductForm({
      name: "",
      category: "овощи",
      price: "",
      minOrder: "",
      description: "",
      shelfLife: "",
      allergens: "",
      images: []
    });

    alert("Товар успешно сохранен!");
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      minOrder: product.minOrder.toString(),
      description: product.description,
      shelfLife: product.shelfLife,
      allergens: product.allergens,
      images: []
    });
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Удалить товар?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Хедер */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Админ дашборд
            </h1>
            
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <LogOut className="w-4 h-4" />
              <span>Выйти</span>
            </Button>
          </div>
          
          {/* Вкладки */}
          <div className="flex space-x-2">
            <Button
              onClick={() => setActiveTab("products")}
              className={`flex-1 ${activeTab === "products" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Товары
            </Button>
            <Button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 ${activeTab === "orders" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Заказы
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Форма добавления/редактирования товара */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                {editingProduct ? "Редактировать товар" : "Добавить товар"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название *
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="овощи">Овощи</option>
                    <option value="фрукты">Фрукты</option>
                    <option value="специи">Специи</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цена (руб/кг) *
                  </label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Мин. объем (кг) *
                  </label>
                  <input
                    type="number"
                    value={productForm.minOrder}
                    onChange={(e) => setProductForm(prev => ({ ...prev, minOrder: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full h-20 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Срок хранения
                  </label>
                  <input
                    type="text"
                    value={productForm.shelfLife}
                    onChange={(e) => setProductForm(prev => ({ ...prev, shelfLife: e.target.value }))}
                    placeholder="7 дней"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Аллергены
                  </label>
                  <input
                    type="text"
                    value={productForm.allergens}
                    onChange={(e) => setProductForm(prev => ({ ...prev, allergens: e.target.value }))}
                    placeholder="Нет"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Фото (до 3 штук)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">Выбрать изображения</span>
                    </label>
                    {productForm.images.length > 0 && (
                      <span className="text-sm text-gray-600">
                        {productForm.images.length} файл(ов) выбрано
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <Button
                  onClick={handleProductSubmit}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {editingProduct ? "Сохранить" : "Добавить"}
                </Button>
                
                {editingProduct && (
                  <Button
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({
                        name: "",
                        category: "овощи",
                        price: "",
                        minOrder: "",
                        description: "",
                        shelfLife: "",
                        allergens: "",
                        images: []
                      });
                    }}
                    variant="outline"
                  >
                    Отмена
                  </Button>
                )}
              </div>
            </div>

            {/* Список товаров */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
                <h3 className="font-semibold text-gray-900">Товары</h3>
                
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Поиск"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Все</option>
                    <option value="овощи">Овощи</option>
                    <option value="фрукты">Фрукты</option>
                    <option value="специи">Специи</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200">
                    <tr className="text-left">
                      <th className="pb-2">Фото</th>
                      <th className="pb-2">Название</th>
                      <th className="pb-2">Категория</th>
                      <th className="pb-2">Цена</th>
                      <th className="pb-2">Мин. объем</th>
                      <th className="pb-2">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <tr key={product.id} className="border-b border-gray-100">
                        <td className="py-2">
                          <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                            <ImageWithFallback
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="py-2 font-medium">{product.name}</td>
                        <td className="py-2 capitalize">{product.category}</td>
                        <td className="py-2">{product.price} руб/кг</td>
                        <td className="py-2">{product.minOrder} кг</td>
                        <td className="py-2">
                          <div className="flex space-x-1">
                            <Button
                              onClick={() => handleEditProduct(product)}
                              variant="outline"
                              size="sm"
                              className="p-1"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteProduct(product.id)}
                              variant="outline"
                              size="sm"
                              className="p-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Заказы</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200">
                  <tr className="text-left">
                    <th className="pb-2">ID</th>
                    <th className="pb-2">Товары</th>
                    <th className="pb-2">Телефон</th>
                    <th className="pb-2">Адрес</th>
                    <th className="pb-2">Статус</th>
                    <th className="pb-2">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-gray-100">
                      <td className="py-2 font-medium">#{order.id}</td>
                      <td className="py-2">{order.items}</td>
                      <td className="py-2">{order.phone}</td>
                      <td className="py-2 max-w-xs truncate">{order.address}</td>
                      <td className="py-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as Order["status"])}
                          className={`text-xs px-2 py-1 rounded-full border-0 ${
                            order.status === "Принят" ? "bg-yellow-100 text-yellow-800" :
                            order.status === "В доставке" ? "bg-blue-100 text-blue-800" :
                            "bg-green-100 text-green-800"
                          }`}
                        >
                          <option value="Принят">Принят</option>
                          <option value="В доставке">В доставке</option>
                          <option value="Завершен">Завершен</option>
                        </select>
                      </td>
                      <td className="py-2 font-semibold">{order.amount.toLocaleString()} руб</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Footer */}
      <StickyFooter 
        navigateToScreen={navigateToScreen} 
        cartItemsCount={cartItemsCount}
        currentScreen="admin"
      />
    </div>
  );
}