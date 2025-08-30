import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { Info } from "lucide-react";

interface OrderFormData {
  address: string;
  phone: string;
  comment: string;
}

interface OrderFormProps {
  onSubmit: (data: OrderFormData) => void;
  isSubmitting?: boolean;
}

export function OrderForm({ onSubmit, isSubmitting = false }: OrderFormProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    address: "",
    phone: "",
    comment: "",
  });

  const [errors, setErrors] = useState<Partial<OrderFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<OrderFormData> = {};

    if (!formData.address.trim()) {
      newErrors.address = "Адрес доставки обязателен";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Номер телефона обязателен";
    } else if (!/^[+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone.trim())) {
      newErrors.phone = "Введите корректный номер телефона";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Очистить ошибку для поля при изменении
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Информация для доставки</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Уведомление */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Заказ будет обработан вручную. Мы свяжемся с вами для подтверждения деталей доставки.
            </AlertDescription>
          </Alert>

          {/* Адрес доставки */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Адрес доставки <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              type="text"
              placeholder="Укажите полный адрес доставки"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className={`${errors.address ? "border-destructive focus:border-destructive focus:ring-destructive" : ""}`}
              aria-describedby={errors.address ? "address-error" : undefined}
              required
            />
            {errors.address && (
              <p id="address-error" className="text-sm text-destructive" role="alert">
                {errors.address}
              </p>
            )}
          </div>

          {/* Телефон */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Номер телефона <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+7 (999) 123-45-67"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className={`${errors.phone ? "border-destructive focus:border-destructive focus:ring-destructive" : ""}`}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              required
            />
            {errors.phone && (
              <p id="phone-error" className="text-sm text-destructive" role="alert">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Комментарий */}
          <div className="space-y-2">
            <Label htmlFor="comment">Комментарий к заказу</Label>
            <Textarea
              id="comment"
              placeholder="Дополнительные пожелания или комментарии к заказу"
              value={formData.comment}
              onChange={(e) => handleInputChange("comment", e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Укажите любые особые требования к доставке или товарам
            </p>
          </div>

          {/* Кнопка подтверждения */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
          >
            {isSubmitting ? "Оформление заказа..." : "Подтвердить заказ"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}