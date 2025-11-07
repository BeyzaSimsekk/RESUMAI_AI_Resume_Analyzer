# REACT NOTES

- **app > routes.ts:** React Routers configuration file.

# CSS NOTES

- **_inset-0_** -> top-0 left-0 right-0 bottom-0

---

### 🧠 **Zustand nedir?**

Zustand, **React projelerinde global state yönetimi** için kullanılan hafif, basit ama güçlü bir kütüphanedir.
Yani **birden fazla bileşenin (component’in)** aynı veriye erişmesini ve güncellemesini sağlar.

---

### 🧩 **Neden kullanılır?**

React’ta bir veriyi (örneğin kullanıcı bilgisi, tema modu, sepet, vs.) birçok yerde kullanmak istersin.
Bunu `useState` ile tek tek prop olarak taşımak zahmetlidir (prop drilling denir).
Zustand bu sorunu çözer — merkezi bir **store** oluşturursun ve her yerden erişebilirsin.

---

### ⚙️ **Nasıl çalışır?**

- Bir **store (veri deposu)** tanımlarsın.
- Bu store’daki verilere `useStore()` hook’u ile erişip güncellersin.
- Herhangi bir component değişikliği otomatik olarak güncellenir.

---

### 🔍 **Kısa örnek**

```ts
// store.js
import { create } from "zustand";

const useBearStore = create((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
}));
```

```tsx
// component.jsx
function Counter() {
  const { bears, increase } = useBearStore();
  return <button onClick={increase}>🐻 {bears}</button>;
}
```

Her component `useBearStore` kullanarak aynı veriye ulaşır.

---

### 🚀 **Avantajları**

- Redux’tan çok daha **basit** (boilerplate yok)
- Context API’den daha **performanslı**
- Typescript uyumlu
- Persist (veriyi localStorage’da tutma) veya devtools gibi eklentileri kolayca eklenebilir

---

💬 **Özet tek cümleyle:**

> Zustand, React’ta global state yönetimini sadeleştiren, hafif ve modern bir kütüphanedir — veriyi her yerden kolayca okuyup değiştirmeyi sağlar.
