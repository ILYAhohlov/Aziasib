import { useState } from "react";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";
import { StickyFooter } from "./StickyFooter";
import { Button } from "./ui/button";
import { Screen } from "../App";

interface AdminLoginScreenProps {
  navigateToScreen: (screen: Screen) => void;
  cartItemsCount: number;
  onLogin: (password: string) => boolean;
}

export function AdminLoginScreen({ navigateToScreen, cartItemsCount, onLogin }: AdminLoginScreenProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError("Введите пароль");
      return;
    }

    setIsLoading(true);
    setError("");

    // Имитация проверки пароля
    setTimeout(() => {
      const isAuthenticated = onLogin(password);

      if (isAuthenticated) {
        // Успешный вход - переключение произойдет в родительском компоненте
      } else {
        setError("Неверный пароль");
        setPassword("");
      }

      setIsLoading(false);
    }, 1000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Хедер */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-semibold text-center text-gray-900">
            Вход в админ панель
          </h1>
        </div>
      </header>

      <main className="px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md space-y-6">
          {/* Иконка и описание */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Административная панель
              </h2>
              <p className="text-gray-600 text-sm">
                Для доступа к панели управления введите пароль администратора
              </p>
            </div>
          </div>

          {/* Форма входа */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Пароль администратора
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />

                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>

                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !password.trim()}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Проверка...</span>
                  </div>
                ) : (
                  "Войти в панель"
                )}
              </Button>
            </form>
          </div>

          {/* Подсказка для демо */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Демо-доступ:</h3>
            <p className="text-blue-800 text-sm mb-2">
              Для демонстрации используйте пароль: <code className="bg-blue-100 px-2 py-1 rounded text-xs font-mono">admin123</code>
            </p>
            <p className="text-blue-700 text-xs">
              В реальном приложении пароль должен быть надежно зашифрован и храниться в безопасном месте.
            </p>
          </div>

          {/* Кнопка возврата */}
          <div className="text-center">
            <Button
              onClick={() => navigateToScreen("catalog")}
              variant="outline"
              className="text-gray-600 hover:text-gray-800"
            >
              Вернуться к каталогу
            </Button>
          </div>
        </div>
      </main>

      {/* Sticky Footer */}
      <StickyFooter 
        navigateToScreen={navigateToScreen} 
        cartItemsCount={cartItemsCount}
      />
    </div>
  );
}