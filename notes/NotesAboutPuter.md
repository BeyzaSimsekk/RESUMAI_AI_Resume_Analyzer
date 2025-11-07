# puter.ts

Puter platformunun (bir tür “web OS” ya da “AI destekli sanal bilgisayar” API’si diyebilirsin) tüm özelliklerini **tek bir merkezi store** üzerinden yönetmek için tasarlanmış.
Yani bu kod, **Puter API’si + Zustand** birleşimiyle, senin uygulamana global bir “Puter kontrol merkezi” kazandırıyor:

## 🧩 1. import { create } from "zustand";

Bu satır **Zustand**’dan `create()` fonksiyonunu içeri aktarıyor.
Zustand, **React uygulamalarında global state yönetmek** için kullanılan hafif bir kütüphanedir.
Redux gibi karmaşık yapılarla uğraşmadan, “uygulamanın her yerinden erişilebilen” veriler tutmanı sağlar.

---

## 🌍 2. declare global { interface Window { puter: { ... } } }

Bu kısım **TypeScript’e**, global `window` nesnesinde bir `puter` objesi bulunacağını bildiriyor.
Normalde TypeScript, `window.puter` gibi özel global değişkenleri tanımaz ve hata verir.
Bu nedenle burada bir _“declare global”_ ile `puter`’ın yapısı tarif ediliyor.

### 💡 Bu `puter` aslında Puter API’nin tarayıcıya yüklediği nesne.

Yani bu fonksiyonlar senin kodunda tanımlı değil, Puter’ın kendisi tarafından sağlanıyor.

---

## 🔐 3. `puter.auth` → Authentication (Giriş/Çıkış işlemleri)

```ts
puter.auth = {
  getUser: () => Promise<PuterUser>;
  isSignedIn: () => Promise<boolean>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};
```

- `signIn()` → Kullanıcı giriş yapar
- `signOut()` → Çıkış yapar
- `isSignedIn()` → Şu anda giriş yapılmış mı kontrol eder
- `getUser()` → Giriş yapan kullanıcının bilgilerini döner

Bu kısım uygulamanın kullanıcı kimliğini yönetiyor.

---

## 📂 4. `puter.fs` → File System (Dosya sistemi işlemleri)

```ts
puter.fs = {
  write, read, upload, delete, readdir
}
```

Bunlar tıpkı bilgisayar dosya sistemi gibi çalışıyor:

- `write(path, data)` → Belirtilen yola dosya yazar
- `read(path)` → Dosyayı okur
- `upload(files)` → Dosya yükler
- `delete(path)` → Dosyayı siler
- `readdir(path)` → Belirtilen klasördeki dosyaları listeler

Yani bu, Puter’ın **sanallaştırılmış dosya sistemine** erişim sağlar.

---

## 🤖 5. `puter.ai` → Yapay zeka özellikleri

```ts
puter.ai = {
  chat,
  img2txt,
};
```

- `chat(prompt, options)` → Bir AI modeline (örneğin Claude veya GPT tarzı) metin tabanlı istek gönderir
- `img2txt(image)` → Bir resmi alıp açıklama (caption) üretir

Bu kısım Puter’ın **AI servisleri** ile konuşmanı sağlar.

---

## 🧠 6. `puter.kv` → Key-Value veritabanı

```ts
puter.kv = {
  get, set, delete, list, flush
}
```

Burası bir **mini veritabanı** gibi düşünülür:

- `set(key, value)` → Anahtar-değer çifti kaydeder
- `get(key)` → Anahtara göre veriyi getirir
- `delete(key)` → Siler
- `list(pattern)` → Anahtar listesini döner
- `flush()` → Tüm verileri temizler

---

## 🧱 7. interface PuterStore { ... }

Bu kısım, Zustand store’unda tutulacak **verilerin tipini** tanımlıyor.
Yani `usePuterStore` adındaki global store’un yapısı burada belirleniyor.

Örneğin:

- `isLoading` → Şu anda bir işlem yapılıyor mu
- `error` → Hata mesajı varsa
- `puterReady` → Puter API yüklenmiş mi
- `auth`, `fs`, `ai`, `kv` → Yukarıda anlattığım servislerin fonksiyonlarını kapsıyor
- `init()` → Puter hazır hale gelince çağrılan başlangıç fonksiyonu

---

## ⚙️ 8. getPuter()

```ts
const getPuter = (): typeof window.puter | null =>
  typeof window !== "undefined" && window.puter ? window.puter : null;
```

Bu fonksiyon **Puter objesinin gerçekten yüklü olup olmadığını** kontrol ediyor.
Eğer yoksa `null` döner.
Böylece kod, tarayıcı dışında (örneğin SSR gibi ortamlarda) hata vermez.

---

## 🧩 9. usePuterStore = create<PuterStore>(...) {aşağıda daha detaylı açıklaması bulunuyor.}

Burası her şeyin birleştiği yer.
Zustand ile **tek bir merkezi store** oluşturuluyor.
Bu store, hem state’i (isLoading, error, user vb.) hem de tüm fonksiyonları içeriyor.

### İçinde tanımlanan fonksiyonlar:

- `setError()` → Hata durumunu günceller
- `checkAuthStatus()` → Kullanıcının giriş yapıp yapmadığını kontrol eder
- `signIn()`, `signOut()`, `refreshUser()` → Kimlik işlemleri
- `write()`, `readDir()`, `upload()` → Dosya sistemi işlemleri
- `chat()`, `img2txt()` → AI işlemleri
- `getKV()`, `setKV()` vs. → Key-Value işlemleri
- `init()` → Puter API yüklenene kadar bekler, hazır olunca bağlantıyı kurar

Her biri `getPuter()` ile Puter nesnesini alır, yoksa hata verir.

---

## 🧠 10. Ne işe yarıyor genel olarak?

Bu yapı sayesinde:

- Uygulamanın her yerinden `usePuterStore()` kullanarak
  dosya yazabilir, okuyabilir, AI ile konuşabilir veya veritabanına erişebilirsin.
- Puter hazır değilse bile `init()` onu algılayıp hazır olana kadar bekler.
- Zustand sayesinde her şey **tek kaynaktan yönetilir**, React bileşenleri otomatik güncellenir.

---

## 🔄 Kısaca Özet:

| Kısım                | Açıklama                       |
| -------------------- | ------------------------------ |
| `auth`               | Giriş/çıkış işlemleri          |
| `fs`                 | Dosya sistemi işlemleri        |
| `ai`                 | Yapay zekâ fonksiyonları       |
| `kv`                 | Basit key-value depolama       |
| `init`               | Puter API’yi başlatır          |
| `isLoading`, `error` | Uygulama durumlarını izler     |
| `usePuterStore()`    | Her şeyi global olarak yönetir |

---

# puter.d.ts

Bu kod **Puter API** ya da **AI servisleriyle dosya–sohbet etkileşimi** kurmak için tanımlanmış **TypeScript arayüzleri (interface’ler)**.
Yani bu dosya, “verilerin nasıl bir biçimde tutulacağını” tanımlıyor:

## 🧱 1. `interface FSItem`

Bu, **dosya sistemindeki bir öğeyi (dosya veya klasör)** temsil eder.
Puter üzerinde dosya yönetimi yaparken bu nesneleri kullanırsın.

```ts
interface FSItem {
  id: string; // Dosya veya klasörün benzersiz ID'si (veritabanı ID gibi)
  uid: string; // Kullanıcıya özel benzersiz kimlik (unique identifier)
  name: string; // Dosya veya klasörün adı (örneğin: "photo.png" veya "Documents")
  path: string; // Dosyanın tam yolu (örneğin: "/user/photos/photo.png")
  is_dir: boolean; // true ise klasör, false ise dosya
  parent_id: string; // Üst dizinin ID’si
  parent_uid: string; // Üst dizinin UID’si
  created: number; // Unix timestamp — oluşturulma zamanı (ms cinsinden)
  modified: number; // Son değiştirilme zamanı
  accessed: number; // En son erişilme zamanı
  size: number | null; // Dosya boyutu (byte cinsinden), klasörse null olabilir
  writable: boolean; // Bu kullanıcı dosyayı değiştirebilir mi (izin kontrolü)
}
```

🔹 **Kısaca:** Bu yapı, Puter’ın dosya sisteminde bir öğenin (file/folder) tüm meta verilerini saklar.
🔹 **Benzer:** `fs.stat()` fonksiyonunun döndürdüğü veriye benzer ama bulut ortamına özgüdür.
🔹 (`fs.stat()` fonksiyonu, Node.js'te bir dosya veya klasör hakkında bilgi almak için kullanılır.)

---

## 👤 2. `interface PuterUser`

Bu, Puter’daki bir **kullanıcıyı** temsil eder.
Basit bir kimlik bilgisi yapısıdır.

```ts
interface PuterUser {
  uuid: string; // Kullanıcının benzersiz evrensel kimliği
  username: string; // Kullanıcı adı
}
```

🔹 **Kısaca:** Kim oturum açtı veya dosyayı kim yükledi gibi bilgileri tutar.
🔹 **Benzer:** `User` tablosundaki temel kimlik sütunları.

---

## 🔑 3. `interface KVItem`

Bu, **anahtar–değer (key-value)** mantığıyla çalışan bir veri kaydını temsil eder.
KV = Key–Value store (örneğin bir mini veritabanı gibi).

```ts
interface KVItem {
  key: string; // Verinin ismi (örneğin "theme" veya "language")
  value: string; // Bu anahtarın değeri (örneğin "dark" veya "en-US")
}
```

🔹 **Kısaca:** Basit konfigürasyon, kullanıcı ayarı veya küçük depolama için kullanılır.
🔹 **Benzer:** `localStorage.setItem("key", "value")` gibi düşünebilirsin.

---

## 💬 4. `interface ChatMessageContent`

Bu, bir **sohbet mesajının içeriğini** tanımlar.
Yani mesaj bir metin olabilir veya bir dosyayı (puter_path) içerebilir.

```ts
interface ChatMessageContent {
  type: "file" | "text"; // Mesaj tipi: dosya mı metin mi
  puter_path?: string; // Dosya gönderildiyse Puter üzerindeki yolu
  text?: string; // Metin mesajı içeriği
}
```

🔹 **Kısaca:** Mesajlar sadece metin değil, dosya da olabilir.
🔹 Örnek:

```ts
{ type: "text", text: "Merhaba!" }
{ type: "file", puter_path: "/documents/resume.pdf" }
```

---

## 🧠 5. `interface ChatMessage`

Bu, **tek bir sohbet mesajını** tanımlar.
Yani bir “kimden geldiği” ve “ne içerdiği” bilgisini tutar.

```ts
interface ChatMessage {
  role: "user" | "assistant" | "system"; // Mesajın kimden geldiği
  content: string | ChatMessageContent[]; // Düz metin veya karma içerik dizisi
}
```

🔹 `role`:

- `user`: Kullanıcı tarafından yazılmış mesaj
- `assistant`: Yapay zekâdan gelen cevap
- `system`: Sistemsel yönlendirme mesajı

🔹 `content`:
Basitçe `"Selam!"` gibi string olabilir veya `{ type: "file", ... }` yapısı gibi karmaşık olabilir.

---

## ⚙️ 6. `interface PuterChatOptions`

Bu, **yapay zekâ sohbetini yapılandırmak** için kullanılan ayarları tanımlar.
Yani model seçimi, sıcaklık (yaratıcılık), token limiti gibi ayarlar burada.

```ts
interface PuterChatOptions {
  model?: string; // Kullanılacak model (örnek: "gpt-4", "claude-3")
  stream?: boolean; // Yanıt akış modunda mı (stream) gelsin?
  max_tokens?: number; // Maksimum token sayısı (yanıt uzunluğu sınırı)
  temperature?: number; // 0–1 arası değer; yüksek olursa daha yaratıcı yanıtlar
  tools?: {
    // Fonksiyon çağırma özellikleri (function calling)
    type: "function";
    function: {
      name: string; // Fonksiyonun ismi
      description: string; // Ne işe yaradığını açıklama
      parameters: {
        // Fonksiyonun beklediği parametre yapısı
        type: string;
        properties: {}; // Parametrelerin ayrıntılı tipi
      };
    }[];
  };
}
```

🔹 **Kısaca:** Bu yapı, `chat()` fonksiyonuna “nasıl cevap versin” ayarlarını verir.
🔹 Örnek:

```ts
const options: PuterChatOptions = {
  model: "gpt-4",
  temperature: 0.7,
  stream: true,
};
```

---

## 🤖 7. `interface AIResponse`

Bu, **yapay zekâdan dönen cevabın** yapısını gösterir.
Yani modelin yanıtı, kullanım bilgileri ve maliyet gibi metrikleri içerir.

```ts
interface AIResponse {
  index: number; // Bu yanıtın sırası (çoklu yanıt durumunda)
  message: {
    role: string; // Yanıtın rolü (assistant / system / user)
    content: string | any[]; // Yanıt metni veya içerik dizisi
    refusal: null | string; // Modelin reddettiği durum (örneğin politik içerik)
    annotations: any[]; // Ek açıklamalar (örneğin kaynak referansları)
  };
  logprobs: null | any; // Olasılık bilgisi (dil modeli tahminlerinin güveni)
  finish_reason: string; // Yanıt neden sonlandı ("stop", "length" vs.)
  usage: {
    // Kullanım ve maliyet bilgileri
    type: string;
    model: string;
    amount: number;
    cost: number;
  }[];
  via_ai_chat_service: boolean; // Yanıt AI chat servisinden mi geldi?
}
```

🔹 **Kısaca:** Bu, yapay zekânın gönderdiği tam veri paketidir.
🔹 **Örnek:**

```ts
{
  index: 0,
  message: { role: "assistant", content: "Merhaba!", refusal: null, annotations: [] },
  finish_reason: "stop",
  usage: [{ type: "input", model: "gpt-4", amount: 150, cost: 0.002 }],
  via_ai_chat_service: true
}
```

---

## 🧩 Özet

| Interface            | Ne İşe Yarar                          | Nerede Kullanılır                |
| -------------------- | ------------------------------------- | -------------------------------- |
| `FSItem`             | Dosya veya klasörün bilgilerini tutar | Puter dosya sistemi              |
| `PuterUser`          | Kullanıcı kimliği                     | Oturum, yetkilendirme            |
| `KVItem`             | Key-value verisi tutar                | Ayarlar, küçük veriler           |
| `ChatMessageContent` | Mesaj içeriği tipi                    | Sohbet içinde dosya/metin ayrımı |
| `ChatMessage`        | Bir mesajın tamamı                    | Chat geçmişi veya AI konuşması   |
| `PuterChatOptions`   | Chat ayarları                         | Model, token limiti, sıcaklık    |
| `AIResponse`         | AI modelinden dönen yanıt             | Sohbet sonucu, rapor             |

---

💬 **Tek cümleyle özet:**

> Bu dosya, Puter platformunda dosya yönetimi, kullanıcı bilgisi, AI chat ve yanıt yapılarının TypeScript tanımlarını içerir — böylece kod yazarken tip güvenliği ve otomatik tamamlama sağlanır.

---

# usePuterStore

Bu koddaki **en beyin olan** kısım `usePuterStore`.
Bu fonksiyon aslında tüm Puter özelliklerini (AI, Auth, FileSystem, KV store) **tek bir çatı altında** toplayan, _Zustand temelli bir global state yönetim merkezi_.
Yani, bir çeşit **“Puter Control Hub”**.
React uygulaması bu store’a bağlanarak Puter API’siyle konuşuyor.

---

## 🧩 1. `usePuterStore` nedir?

Bu satırda oluşturuluyor:

```ts
export const usePuterStore = create<PuterStore>((set, get) => { ... })
```

Burada:

- `create` → Zustand’ın ana fonksiyonu
- `<PuterStore>` → Store’un tipini belirtiyor (yani state yapısı, fonksiyonlar vb.)
- `(set, get)` → Zustand’ın iki özel yardımcı fonksiyonu:
  - `set()` → State’i güncellemek için kullanılır
  - `get()` → Mevcut state’e erişmek için kullanılır

Sonuç olarak:

> `usePuterStore` bir **custom hook** (özel React hook’u).
> React bileşenlerinden çağırarak Puter API’siyle etkileşime geçebilmeni sağlar.

---

## 🌍 2. `usePuterStore` ne yapıyor?

Kısaca:

> Puter API’sinin 4 temel modülünü (`auth`, `fs`, `ai`, `kv`) alıp,
> bunları **tek bir merkezden yönetilebilir hale getiriyor.**

Yani uygulamanın herhangi bir yerinden:

```tsx
const { auth, fs, ai, kv, isLoading, error } = usePuterStore();
```

dediğinde, artık:

- `auth.signIn()` ile giriş yapabilir,
- `fs.read("/notes.txt")` ile dosya okuyabilir,
- `ai.chat("Merhaba!")` ile AI modeline mesaj atabilir,
- `kv.set("theme", "dark")` ile veri kaydedebilirsin.

Tüm bu işlemler **tek bir hook’tan** yönetiliyor.
Redux gibi karmaşık setup’lar yok, `usePuterStore` yeterli.

---

## ⚙️ 3. `set` ve `get` nasıl çalışıyor?

### 🧠 `set()`

Zustand’ın kendi state güncelleme fonksiyonudur.
React’in `useState` gibidir ama **globaldir**.

```ts
set({ isLoading: true });
```

→ `isLoading` state’ini günceller, tüm bileşenler bundan haberdar olur.

### 🔍 `get()`

Mevcut store değerlerine erişmek içindir.
Mesela:

```ts
get().auth.signIn;
```

→ Store’daki `auth` objesinin `signIn` fonksiyonuna erişirsin.

Bunu genelde `set` çağrısı içinde kullanıyoruz, çünkü orada güncel fonksiyonlara erişmek gerekiyor.

---

## 🧩 4. Store’un yapısı (state + actions)

`usePuterStore` iki şeyi barındırıyor:

1. **State (veri)** — uygulamanın o anki durumunu tutar
2. **Actions (fonksiyonlar)** — bu veriyi değiştiren veya Puter API’siyle etkileşime geçen fonksiyonlar

---

### 🧭 STATE (veri kısmı)

```ts
{
  isLoading: boolean;
  error: string | null;
  puterReady: boolean;
  auth: {...}
  fs: {...}
  ai: {...}
  kv: {...}
}
```

| Alan         | Anlamı                                   |
| ------------ | ---------------------------------------- |
| `isLoading`  | Şu anda bir işlem yapılıyor mu           |
| `error`      | Son hatanın mesajı                       |
| `puterReady` | Puter.js yüklenip hazır mı               |
| `auth`       | Kullanıcı kimliğiyle ilgili işlemler     |
| `fs`         | Dosya sistemi işlemleri                  |
| `ai`         | Yapay zekâ (chat, img2txt vs.) işlemleri |
| `kv`         | Key-Value database işlemleri             |

---

### ⚡ ACTIONS (fonksiyon kısmı)

Bunlar `usePuterStore` içindeki fonksiyonlardır.
Her biri `set` ve `getPuter()` kullanarak Puter API’siyle çalışır.

---

#### 🔐 Auth fonksiyonları

```ts
signIn();
signOut();
refreshUser();
checkAuthStatus();
getUser();
```

> Kullanıcının giriş-çıkış, kimlik yenileme ve durum kontrol işlemlerini yapar.
> Bu fonksiyonlar `puter.auth` üzerinden Puter API’yle haberleşir.

---

#### 📂 FileSystem fonksiyonları

```ts
write(path, data);
read(path);
readDir(path);
upload(files);
delete path;
```

> Sanal dosya sisteminde okuma/yazma/silme işlemleri yapar.
> Her biri `puter.fs` fonksiyonlarını kullanır.

---

#### 🤖 AI fonksiyonları

```ts
chat(prompt, imageURL?, testMode?, options?)
feedback(path, message)
img2txt(image)
```

> Yapay zekâ ile etkileşim sağlar.
> Örneğin `chat()` bir modelle konuşmanı, `img2txt()` ise görselden metin çıkarmayı sağlar.
> `feedback()` özel olarak bir dosyaya geri bildirim istemek için tasarlanmış.

---

#### 🧠 KV (Key-Value) fonksiyonları

```ts
get(key)
set(key, value)
delete(key)
list(pattern, returnValues?)
flush()
```

> Küçük verileri Puter’ın key-value deposunda saklamanı sağlar.
> Yani tarayıcıda küçük bir “veritabanı” gibi düşünebilirsin.

---

### ⚙️ Ek yardımcı fonksiyonlar

#### `init()`

```ts
const init = (): void => { ... }
```

> Puter.js yüklenene kadar bekler.
> Yüklendiğinde `puterReady` true yapılır ve `checkAuthStatus()` çağrılır.
> Böylece uygulama otomatik olarak Puter API’ye bağlanır.

#### `clearError()`

```ts
clearError: () => set({ error: null });
```

> Hata mesajlarını sıfırlar.

---

## 💡 5. `getPuter()` kullanımı

Her action fonksiyonu önce bu fonksiyonla başlar:

```ts
const puter = getPuter();
if (!puter) {
  setError("Puter.js not available");
  return;
}
```

Bu, **“Puter yüklü mü?”** kontrolüdür.
Çünkü `puter` objesi yoksa API çağrısı yapılamaz.
Bu yüzden kullanıcıya “Puter.js not available” hatası gösterilir.

---

## 🧱 6. React tarafında kullanım

Bir React bileşeninde şöyle kullanılır:

```tsx
import { usePuterStore } from "../store/puterStore";

function Dashboard() {
  const { auth, fs, ai, isLoading, error } = usePuterStore();

  useEffect(() => {
    auth.signIn();
  }, []);

  return (
    <div>
      {isLoading && <p>Yükleniyor...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
```

👉 Yani `usePuterStore()` sadece bir state değil,
aynı zamanda **Puter’la konuşabilen bir API yöneticisi**.
React bileşenlerinden çağırdığında, tüm işlemler otomatik senkronize olur.

---

## 🧩 7. Genel Akış

1. `init()` çağrılır → Puter.js yüklenir.
2. `checkAuthStatus()` çalışır → Kullanıcı giriş yapmış mı kontrol eder.
3. Uygulama boyunca `usePuterStore` içinden `auth`, `fs`, `ai`, `kv` modülleri çağrılır.
4. Her işlemde `isLoading`, `error` gibi state’ler güncellenir.
5. Tüm bileşenler bu state’leri otomatik izler (Zustand reaktif olduğu için).

---

## 🔮 Özetle

`usePuterStore`:

> “Puter API’nin tüm servislerini tek bir merkezden yöneten global hook.”

💡 Yani senin için:

- Puter’la konuşmak kolaylaşır
- Kod modüler ve düzenli kalır
- React bileşenleri otomatik olarak senkronize olur
- Auth, FS, AI, KV gibi farklı servisler tek yerden yönetilir
