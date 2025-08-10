# 🛠️ Debug Tools untuk Selector Testing

Koleksi tools debugging untuk menginspeksi dan menguji selector pada SauceDemo website.

## 📋 Tools yang Tersedia

### 1. 🎯 Interactive Selector Debugger (`debug-selector-tool.js`)

Tool debugging interaktif yang paling lengkap untuk menginspeksi selector secara detail.

**Penggunaan:**
```bash
node debug-selector-tool.js [url] [username] [password]
```

**Contoh:**
```bash
# Default (akan login ke SauceDemo dengan standard_user)
node debug-selector-tool.js

# Custom URL dan credentials
node debug-selector-tool.js https://www.saucedemo.com problem_user secret_sauce
```

**Fitur:**
- Mode interaktif dengan commands
- Detail inspeksi element (tag, attributes, visibility, position)
- Pencarian selector serupa otomatis
- Screenshot capture
- Testing multiple selectors sekaligus

**Commands yang tersedia:**
- `<selector>` - Debug specific selector
- `screenshot` - Ambil screenshot
- `similar <selector>` - Cari selector serupa
- `multiple <sel1>,<sel2>` - Test multiple selectors
- `common` - Test selector umum SauceDemo
- `exit` - Keluar

### 2. ⚡ Quick Debug (`quick-debug.js`)

Tool debugging cepat untuk testing multiple selectors tanpa interaksi.

**Penggunaan:**
```bash
node quick-debug.js "selector1,selector2,selector3"
```

**Contoh:**
```bash
node quick-debug.js "[data-test='login-button'],.shopping_cart_link,#user-name"

node quick-debug.js ".product_sort_container,[data-test='product-sort-container'],.inventory_item"
```

**Fitur:**
- Testing cepat multiple selectors
- Output ringkas dan mudah dibaca
- Otomatis screenshot
- Tidak perlu input interaktif

### 3. 🔍 Element Inspector (`element-inspector.js`)

Tool khusus untuk inspeksi element berdasarkan kategori/type.

**Penggunaan:**
```bash
node element-inspector.js [type]
```

**Types yang tersedia:**
- `buttons` - Semua button elements
- `inputs` - Input fields
- `links` - Links dan navigation
- `dropdowns` - Dropdown dan select elements
- `cart` - Shopping cart elements
- `menu` - Hamburger menu elements  
- `products` - Product-related elements
- `all` - Semua categories (default)

**Contoh:**
```bash
# Inspect semua buttons
node element-inspector.js buttons

# Inspect cart elements
node element-inspector.js cart

# Inspect semua categories
node element-inspector.js all
```

**Fitur:**
- Kategorisasi elements berdasarkan fungsi
- Detail properties untuk setiap element type
- Special handling untuk input, select, link elements
- Comprehensive attribute inspection

### 4. 🎯 Selector Finder (`selector-finder.js`)

Tool untuk mencari selector unik dari multiple elements dengan targeting specific element.

**Penggunaan:**
```bash
node selector-finder.js [base-selector] [target-text/index]
```

**Contoh:**
```bash
node selector-finder.js "button" "Add to cart"
node selector-finder.js ".inventory_item button" 0
node selector-finder.js "[data-test*='add-to-cart']" "sauce-labs-backpack"
```

**Fitur:**
- Analisis multiple elements dengan base selector
- Target element berdasarkan text atau index
- Generate selector unik dengan prioritas reliability
- Visual highlighting dan screenshot

### 5. 🔘 Button Finder (`button-finder.js`)

Tool khusus untuk mencari selector unik untuk button elements secara interactive.

**Penggunaan:**
```bash
node button-finder.js
```

**Fitur:**
- Scan otomatis semua button elements
- Interactive selection mode
- Priority-based selector generation
- Button-specific analysis (enabled, disabled, text, etc.)
- Visual highlighting

### 6. 🖱️ Universal Unique Selector Finder (`unique-selector-finder.js`)

Tool paling canggih untuk mencari selector unik dengan cara visual/interactive pointing.

**Penggunaan:**
```bash
node unique-selector-finder.js
```

**Fitur:**
- Visual hover highlighting
- Ctrl+Click selection mode  
- Universal element support (any tag type)
- Real-time element analysis
- Multiple selector strategies
- Interactive browser interface

## 🚀 Cara Penggunaan

### Scenario 1: Debugging Selector yang Gagal
Ketika test gagal karena selector tidak ditemukan:

```bash
# Gunakan interactive debugger
node debug-selector-tool.js

# Masukkan selector yang gagal
> [data-test="product_sort_container"]

# Jika tidak ditemukan, cari yang serupa
> similar [data-test="product_sort_container"]
```

### Scenario 2: Validasi Multiple Selectors
Ketika ingin memvalidasi beberapa selector sekaligus:

```bash
node quick-debug.js ".shopping_cart_link,.shopping_cart_badge,[data-test='checkout']"
```

### Scenario 3: Explorasi Elements by Category
Ketika ingin memahami semua elements dalam kategori tertentu:

```bash
# Lihat semua button elements
node element-inspector.js buttons

# Lihat semua dropdown/select elements  
node element-inspector.js dropdowns
```

### Scenario 4: Finding Alternative Selectors
Ketika selector utama tidak reliable dan perlu alternatif:

```bash
node debug-selector-tool.js

# Test selector utama
> .product_sort_container

# Cari alternatif
> similar .product_sort_container

# Test beberapa alternatif sekaligus
> multiple .product_sort_container,[data-test="product-sort-container"],[data-test="product_sort_container"]
```

### Scenario 5: Finding Unique Selector from Multiple Elements
Ketika ada banyak button/element serupa dan perlu yang spesifik:

```bash
# Cari button "Add to cart" yang spesifik dari banyak button
node selector-finder.js "button" "Add to cart"

# Pilih button ketiga (index 2) dari semua button
node selector-finder.js "button" 2

# Cari button dengan teks partial match
node selector-finder.js "[class*='btn']" "sauce-labs-backpack"
```

### Scenario 6: Interactive Button Analysis
Ketika ingin menganalisis semua button di page:

```bash
node button-finder.js

# Tool akan show semua buttons yang ditemukan
# Pilih index button yang ingin dianalisis
# Get unique selector recommendations
```

### Scenario 7: Visual Element Selection
Ketika tidak tahu selector sama sekali dan ingin point-and-click:

```bash
node unique-selector-finder.js

# 1. Hover mouse over elements (akan highlight)
# 2. Ctrl+Click element yang diinginkan 
# 3. Tool akan generate unique selectors automatically
# 4. Copy selector terbaik ke Page Object Model
```

## 📊 Output Information

Setiap tool akan memberikan informasi berikut untuk setiap element:

### Basic Properties
- ✅/❌ Found status
- 👁️ Visibility (visible/hidden)
- 🔧 Enabled status
- 🏷️ Tag name (div, input, button, etc.)
- 📝 Text content
- 📐 Position & size (bounding box)

### Attributes
- `id` - Element ID
- `class` - CSS classes
- `data-test` - Test attributes
- `name` - Form element names
- `type` - Input types
- `value` - Input values
- `placeholder` - Placeholder text

### Special Properties
- **Input elements**: type, value, placeholder, disabled, readonly
- **Select elements**: options list, selected value
- **Link elements**: href, target
- **Button elements**: disabled status, button type

## 💡 Tips Debugging

### 1. Selector Priority Order
Ketika mencari selector yang reliable, gunakan urutan prioritas:
1. `[data-test="..."]` - Paling stable
2. `#id` - Cukup stable jika unik
3. `.class` - Kurang stable, bisa berubah
4. `tag` - Paling tidak reliable

### 2. Common Issues & Solutions

**Issue**: Element found tapi tidak visible
```bash
# Check apakah element dalam viewport atau hidden
node debug-selector-tool.js
> .element-selector
# Lihat boundingBox dan visibility properties
```

**Issue**: Multiple elements ditemukan
```bash
# Gunakan selector yang lebih specific
node quick-debug.js ".cart-button,[data-test='add-to-cart-specific-item']"
```

**Issue**: Selector bekerja manual tapi gagal di test
```bash
# Check timing - element mungkin belum loaded
node element-inspector.js buttons
# Lihat apakah button sudah enabled dan visible
```

### 3. Best Practices
- Selalu gunakan `data-test` attributes jika tersedia
- Test selector di berbagai state (logged in, cart empty/full, etc.)
- Verifikasi element properties sebelum interaksi
- Screenshot untuk visual validation

## 🐛 Troubleshooting

### Tool tidak jalan
```bash
# Pastikan dependencies terinstall
npm install

# Pastikan Playwright browsers terinstall  
npx playwright install
```

### Browser tidak membuka
- Check apakah tool dijalankan dengan `headless: false`
- Pastikan tidak ada browser process yang crash

### Login gagal
- Verify credentials di `.env` file
- Check apakah SauceDemo website accessible
- Test manual login dulu

## 📁 File Output

Tools akan generate file berikut:
- `debug-[timestamp].png` - Screenshots
- `inspector-[type]-[timestamp].png` - Category inspection screenshots
- `quick-debug-[timestamp].png` - Quick debug screenshots
- `selector-finder-[timestamp].png` - Selector finder screenshots
- `button-finder-[timestamp].png` - Button finder screenshots
- `unique-selector-[timestamp].png` - Universal selector finder screenshots

Semua screenshot disimpan di root directory project.

## 💼 Real Example: Finding "About" Element

Mari lihat contoh praktis mencari selector untuk element "About" yang ada di hamburger menu:

### **Method 1: Quick Debug (Fastest)**
```bash
node quick-debug.js "text=About,#about_sidebar_link,[data-test*='about']"
```
**Output:**
- ✅ `text=About` - Found, visible: false
- ✅ `#about_sidebar_link` - Found, ID selector
- ✅ `[data-test*='about']` - Found, data-test attribute

### **Method 2: Selector Finder (Most Detailed)**
```bash
node selector-finder.js ".bm-item" "About"
```
**Output:**
- Menemukan 4 elemen dengan `.bm-item`
- Target element: "About" at index 1
- Best selector: `[data-test="about-sidebar-link"]`
- Backup selector: `#about_sidebar_link`

### **Method 3: Element Inspector (Category-based)**
```bash
node element-inspector.js links
```
**Output:**
- Akan menampilkan semua link elements termasuk About
- Kategorisasi berdasarkan jenis element

### **Method 4: Interactive Debugger**
```bash
node debug-selector-tool.js

# Di prompt interactive:
> [data-test="about-sidebar-link"]
# atau
> similar #about_sidebar_link
```

### **Method 5: Visual Selection (Most User-friendly)**
```bash
node unique-selector-finder.js

# 1. Browser akan terbuka
# 2. Buka hamburger menu manual
# 3. Hover mouse over "About" element
# 4. Ctrl+Click untuk select
# 5. Tool akan generate selectors otomatis
```

### **Hasil Analisis:**
```javascript
// Recommended selectors untuk About element:
// 🥇 Best (most stable):
this.aboutLink = '[data-test="about-sidebar-link"]';

// 🥈 Backup (unique ID):  
this.aboutLink = '#about_sidebar_link';

// Usage in Page Object:
async clickAbout() {
  await this.openMenu(); // Buka hamburger menu dulu
  await this.clickElement(this.aboutLink);
}
```

**⚠️ Important Note:** About element tersembunyi di hamburger menu, jadi perlu buka menu dulu sebelum interact!

## 🚀 Quick Command Reference

### **Most Common Commands:**

```bash
# Test multiple selectors quickly
node quick-debug.js "selector1,selector2,selector3"

# Find unique selector from multiple elements  
node selector-finder.js "base-selector" "target-text-or-index"

# Interactive button analysis
node button-finder.js

# Visual point-and-click selector finding
node unique-selector-finder.js

# Category-based inspection
node element-inspector.js buttons|inputs|links|dropdowns|cart|menu|products|all

# Interactive general debugging
node debug-selector-tool.js
```

### **Real-world Examples:**

```bash
# Find Add to Cart button for specific product
node selector-finder.js "button" "Add to cart"

# Test login-related selectors
node quick-debug.js "[data-test='username'],[data-test='password'],[data-test='login-button']"

# Analyze all cart elements
node element-inspector.js cart

# Find checkout button from multiple buttons
node selector-finder.js ".btn" "checkout"

# Interactive exploration
node debug-selector-tool.js
> common  # Test common SauceDemo selectors
```

### **Troubleshooting Commands:**

```bash
# When selector is not working
node debug-selector-tool.js
> your-failing-selector
> similar your-failing-selector

# When multiple elements found
node selector-finder.js "your-base-selector" 0  # Select by index

# When element not visible
node element-inspector.js all  # Check all categories
```

## 🎯 Recommended Workflow

### **1. When You Need a New Selector:**
```bash
# Start with visual selection (easiest)
node unique-selector-finder.js
# Hover + Ctrl+Click target element
```

### **2. When You Have Multiple Similar Elements:**
```bash
# Use selector finder to get specific one
node selector-finder.js "base-selector" "target-text-or-index"
# Example: node selector-finder.js "button" "Add to cart"
```

### **3. When You Need to Debug Failing Selector:**
```bash
# Quick test first
node quick-debug.js "failing-selector,alternative1,alternative2"

# If still failing, use interactive debugger
node debug-selector-tool.js
> failing-selector
> similar failing-selector
```

### **4. When You Want to Explore Element Categories:**
```bash
# Check specific category
node element-inspector.js buttons  # or inputs, links, etc.
```

### **5. Integration to Page Object:**
```javascript
// Copy hasil terbaik ke Page Object Model
class InventoryPage extends BasePage {
  constructor(page) {
    super(page);
    // Hasil dari debug tools:
    this.aboutLink = '[data-test="about-sidebar-link"]'; // Best
    this.productSort = '[data-test="product-sort-container"]'; // Fixed
    this.addToCartButton = '[data-test="add-to-cart-sauce-labs-backpack"]'; // Specific
  }
}
```

## 🎯 Integration dengan Testing

Hasil debugging dapat digunakan untuk:
1. Update selector di Page Object files
2. Fix failing tests
3. Improve selector reliability
4. Document element behavior changes

Contoh update berdasarkan hasil debugging:
```javascript
// Sebelum (dari hasil debugging)
this.productSort = '[data-test="product_sort_container"]'; // ❌ Tidak ditemukan

// Sesudah (hasil dari tool)
this.productSort = '[data-test="product-sort-container"]'; // ✅ Ditemukan
```