Bu kod ilk bakışta “basitçe PDF’yi resme çeviriyor” gibi görünüyor ama aslında _tarayıcı içindeki PDF render süreci, dinamik modül yükleme, worker kullanımı_ gibi birçok ileri düzey konsept içeriyor:

---

## 🧩 Genel Amaç:

Bu kodun amacı:
📄 **Bir PDF dosyasını alıp (örneğin kullanıcı yüklediğinde)**,
🖼️ **ilk sayfasını bir PNG resmine dönüştürmek.**

---

## 1️⃣ `PdfConversionResult` interface’i

```ts
export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}
```

Bu, fonksiyonun dönüş tipini tanımlar.

| Alan       | Anlamı                                                                     |
| ---------- | -------------------------------------------------------------------------- |
| `imageUrl` | Oluşturulan resmin tarayıcıda kullanılabilecek URL’si (`blob:` ile başlar) |
| `file`     | Oluşturulan PNG dosyası (bir `File` nesnesi)                               |
| `error`    | Eğer bir hata olursa buraya yazılır (opsiyonel `?`)                        |

---

## 2️⃣ `let pdfjsLib: any = null;`

```ts
let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;
```

Bunlar **global değişkenler** (yani dosya genelinde kullanılacak).

| Değişken      | Anlamı                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| `pdfjsLib`    | `pdf.js` kütüphanesi yüklendikten sonra saklanacak referans. Başta `null`, çünkü henüz yüklenmedi.                |
| `isLoading`   | Kütüphane şu anda yükleniyor mu, bunu tutuyor.                                                                    |
| `loadPromise` | Kütüphane yükleme işleminin `Promise` nesnesi. Yükleme devam ederken tekrar çağırılırsa, aynı promise’i döndürür. |

🎯 **Amaç:**
`pdfjs-dist` büyük bir kütüphane. Her defasında tekrar yüklemek yavaşlatır.
Bu yüzden:

- Eğer bir kez yüklendiyse → tekrar yükleme.
- Eğer şu anda yükleniyorsa → aynı yükleme sürecini bekle.

---

## 3️⃣ `loadPdfJs()` fonksiyonu

```ts
async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
  loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
    lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfjsLib = lib;
    isLoading = false;
    return lib;
  });

  return loadPromise;
}
```

🔍 Bu fonksiyon **pdf.js kütüphanesini dinamik olarak (runtime’da)** yükler.

### 📦 `import("pdfjs-dist/build/pdf.mjs")`

- `pdfjs-dist` → Mozilla’nın “PDF.js” kütüphanesi. PDF dosyalarını tarayıcıda açmayı sağlar.
- `/build/pdf.mjs` → `.mjs` uzantısı, bu dosyanın bir **ECMAScript module** olduğunu gösterir.
  (`.mjs` = “module JavaScript”, modern tarayıcı modül formatı)

### ⚙️ `lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"`

- PDF.js, PDF dosyalarını işlemek için **“worker”** kullanır.
- Worker = ayrı bir iş parçacığı. (PDF işlemi tarayıcı arayüzünü dondurmasın diye)
- `workerSrc`, bu worker kodunun nerede olduğunu belirtir.
  Burada `/pdf.worker.min.mjs` adresindeki dosyayı gösteriyor.

### 🔄 Neden Promise kullanılmış?

Çünkü “dinamik import” asenkron bir işlemdir.
Birden fazla yer `loadPdfJs()` çağırırsa:

- Sadece **bir defa yüklenir**
- Sonraki çağrılar aynı `loadPromise`’ı bekler.

---

## 4️⃣ `convertPdfToImage` fonksiyonu

Bu fonksiyonun yaptığı şey:
📄 **Bir PDF dosyasını alıyor, ilk sayfasını bir resme (PNG formatında) çeviriyor.**

---

## 💡 Fonksiyonun adı ve amacı

```ts
export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult>;
```

Bu satırda:

- `convertPdfToImage` → fonksiyonun adı.
- `file: File` → bu fonksiyon bir PDF dosyası alır.
- `Promise<PdfConversionResult>` → bu fonksiyon **asenkron** çalışır (yani biraz zaman alabilir) ve sonucunda bir **söz (Promise)** döner.
  Bu sözün içinde şu bilgiler vardır:

```ts
{
  imageUrl: string,
  file: File | null,
  error?: string
}
```

Yani:

- `imageUrl`: PDF’den oluşturulan resmin URL’si
- `file`: oluşturulan resim dosyasının kendisi
- `error`: hata varsa hata mesajı

---

## 🧱 1. Adım – PDF.js kütüphanesini yükle

```ts
const lib = await loadPdfJs();
```

📦 Burada `loadPdfJs()` fonksiyonu PDF dosyalarını okuyabilmek için gerekli olan **PDF.js** kütüphanesini yüklüyor.
Bu kütüphane sayesinde PDF sayfalarını, resim gibi işleyebiliyoruz.
Bekliyoruz çünkü `await` var — yani yüklenmesi bitmeden devam etmiyoruz.

---

## 📂 2. Adım – PDF dosyasını bilgisayara okunabilir hale getir

```ts
const arrayBuffer = await file.arrayBuffer();
```

PDF dosyası bilgisayarda bir "dosya" (`File`) nesnesi olarak durur.
Ama biz onu PDF.js’e vermek istiyorsak, önce **ham veriye** (byte dizisine) çevirmemiz gerekir.
İşte `arrayBuffer()` bunu yapar:
→ “Bu dosyanın içindeki ham veriyi bana byte olarak ver.”

---

## 📖 3. Adım – PDF dosyasını PDF.js ile aç

```ts
const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
```

Burada PDF.js’e diyoruz ki:

> “Bak bu ham veriyi sana veriyorum, bundan bir PDF dökümanı oluştur.”

`getDocument(...)` fonksiyonu PDF.js içinde bir “yükleme işlemi” başlatır.
Bu yükleme **Promise** döndürür — yani hemen PDF’yi vermez, önce yükler.
Bu yüzden `.promise` yazarız.
🧠 `.promise` → "PDF tamamen yüklendiğinde bana sonucu döndür."

Bu satırdan sonra elimizde **pdf** adlı, tüm PDF dosyasını temsil eden bir nesne var.

---

## 📄 4. Adım – İlk sayfayı al

```ts
const page = await pdf.getPage(1);
```

PDF çok sayfalı olabilir.
Ama burada sadece **ilk sayfayı** alıyoruz (`1`).
Bu sayfa, PDF.js tarafından çizilebilir (render edilebilir) bir nesne.

---

## 🖼️ 5. Adım – Sayfanın boyutlarını ayarla

```ts
const viewport = page.getViewport({ scale: 4 });
```

Bir PDF’in çözünürlüğü yoktur, çünkü vektöreldir.
Biz bunu ekranda gösterebilmek için piksel çözünürlüğüne dönüştürürüz.
`scale: 4` → “Normalin 4 katı çözünürlükte çiz” demek.
Yani görüntü daha net olur ama dosya da biraz büyür.

---

## 🎨 6. Adım – Çizim yapacağımız tuvali (canvas) oluştur

```ts
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
```

Burada tarayıcıda boş bir **canvas** (tuval) oluşturuyoruz.
`context` → bu tuvale çizim yapmamızı sağlayan nesne.

---

## 📏 7. Adım – Canvas boyutunu PDF sayfasına göre ayarla

```ts
canvas.width = viewport.width;
canvas.height = viewport.height;
```

PDF sayfasının boyutu neyse, tuvalin (canvas) boyutu da o kadar oluyor.
Böylece sayfa tam sığar.

---

## 🧈 8. Adım – Görüntü kalitesini arttır

```ts
if (context) {
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
}
```

Bu satırlar görüntüyü daha **yumuşak** ve **kaliteli** hale getiriyor.
Yani kenarlar pürüzsüz görünüyor.

---

## 🖌️ 9. Adım – PDF sayfasını tuvale çiz

```ts
await page.render({ canvasContext: context!, viewport }).promise;
```

Bu, çok önemli satır:

- `page.render(...)` → PDF sayfasını tuvale çizmeye başlar.
- Bu işlem hemen bitmez, çünkü PDF karmaşık olabilir.
- Bu yüzden `page.render()` bir **Promise** döner.
- `.promise` diyerek, “tam çizim bitince devam et” diyoruz.

Yani `.promise` burada “çizim işlemi tamamlanınca haber ver” anlamında.

---

## 🧪 10. Adım – Canvas’taki görüntüyü bir resim dosyasına dönüştür

```ts
return new Promise((resolve) => {
  canvas.toBlob((blob) => { ... }, "image/png", 1.0);
});
```

Burada yeni bir `Promise` oluşturuyoruz, çünkü `canvas.toBlob()` da asenkron (yani hemen bitmeyen) bir işlemdir.
`toBlob` → canvas’taki görüntüyü bir **resim dosyasına (blob)** dönüştürür.

- `"image/png"` → dosya formatı PNG olsun.
- `1.0` → kalite en yüksek olsun.

---

## 📦 11. Adım – Blob’dan bir resim dosyası oluştur

```ts
const imageFile = new File([blob], `${originalName}.png`, {
  type: "image/png",
});
```

Burada:

- blob → canvas’tan alınan ham görüntü verisi
- File → bunu bir gerçek **dosya** haline getiriyoruz.
- `${originalName}.png` → orijinal PDF dosyasının adını al, uzantısını `.png` yap.

---

## 🔗 12. Adım – Resim URL’si oluştur

```ts
imageUrl: URL.createObjectURL(blob);
```

Böylece tarayıcıda bu resmi görüntülemek mümkün olur.
Yani `imageUrl` → `"blob:http://..."` gibi bir link döner.

---

## ⚠️ 13. Adım – Hata olursa

```ts
catch (err) {
  return {
    imageUrl: "",
    file: null,
    error: `Failed to convert PDF: ${err}`,
  };
}
```

Eğer herhangi bir adımda hata olursa, boş değerlerle birlikte hata mesajı döndürülür.

---

## 🔁 Özet Akış:

1. 📥 PDF dosyasını al
2. 🧠 PDF.js ile aç
3. 📖 İlk sayfayı seç
4. 🖼️ Canvas oluştur
5. 🖌️ PDF sayfasını canvas’a çiz (`.promise` → çizim bitene kadar bekle)
6. 📸 Canvas’tan PNG dosyası oluştur
7. 🔗 Dosya ve URL’yi döndür

---

## 📘 Özetle:

| Kavram                  | Ne işe yarıyor                                                  |
| ----------------------- | --------------------------------------------------------------- |
| `pdfjs-dist`            | Mozilla’nın PDF işleme kütüphanesi                              |
| `.mjs`                  | Modern ES Module dosyası                                        |
| `worker`                | PDF işlemini arka planda yapan iş parçacığı                     |
| `loadPdfJs()`           | PDF.js kütüphanesini bir kez yükleyip önbelleğe alıyor          |
| `convertPdfToImage()`   | PDF’nin 1. sayfasını canvas’a çizip PNG’ye çeviriyor            |
| `toBlob()`              | Canvas’tan resim dosyası oluşturuyor                            |
| `URL.createObjectURL()` | Bu resmi tarayıcıda gösterebilmek için geçici bir URL yaratıyor |

---
