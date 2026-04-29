# GPIO Reference Tool (Raspberry Pi)

🔗 **Live Demo:** https://krishnavamsi333.github.io/gpio-ref/

---

## 📌 Overview

GPIO Reference is a modern web-based tool for exploring and planning Raspberry Pi GPIO usage.
It provides a visual and interactive interface to understand pin mappings, peripherals, and generate code snippets.

---

## ✨ Features

* 🧭 Interactive GPIO Pin Map
* ⚡ Quick Reference for common functions
* 🔌 Peripheral configuration guidance
* 🧠 Smart planning with GPIO Planner
* 🧾 Code snippet generation (Python)
* 🎨 Clean and responsive UI

---

## 🛠️ Tech Stack

* **Frontend:** React + Vite
* **Styling:** CSS
* **Build Tool:** Vite
* **Deployment:** GitHub Pages (via GitHub Actions)

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/krishnavamsi333/gpio-ref.git
cd gpio-ref
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

---

## 🌐 Deployment

This project is automatically deployed using **GitHub Actions**.

Every push to `main` triggers:

```text
Build → Deploy → GitHub Pages
```

Live site:
👉 https://krishnavamsi333.github.io/gpio-ref/

---

## 📁 Project Structure

```text
src/
├── components/     # UI components
├── data/           # GPIO pin data
├── hooks/          # Custom React hooks
├── styles/         # CSS
├── utils/          # Helper functions & generators
```

---

## 🔧 Configuration

For GitHub Pages deployment (Vite):

```js
base: "/gpio-ref/"
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch
3. Commit changes
4. Open a Pull Request

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 🙌 Acknowledgements

Inspired by Raspberry Pi GPIO documentation and community tools.

---
