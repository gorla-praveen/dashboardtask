# ⚡ Nexus Dashboard

> Professional Employee & Client Management Dashboard
> **Built by: Manikanta and Team**

![Nexus Dashboard](https://img.shields.io/badge/version-1.0.0-6c63ff) ![HTML5](https://img.shields.io/badge/HTML5-APIs-orange) ![Responsive](https://img.shields.io/badge/Responsive-✓-green)

---

## 🎯 Template Base

This project is **custom-built from scratch**, inspired by the structural patterns of:
- **Tabler** (sidebar layout, card patterns)
- **AdminLTE** (dashboard modules organization)

All HTML, CSS, and JavaScript are written from scratch — no template files copied.

---

## 📁 Folder Structure

```
nexus-dashboard/
├── index.html                 # Dashboard Home
├── assets/
│   ├── css/
│   │   └── style.css          # Full stylesheet (dark/light, responsive)
│   └── js/
│       └── app.js             # All JS logic + HTML5 APIs
├── pages/
│   ├── employees.html         # Employee Management
│   ├── clients.html           # Client Management
│   ├── projects.html          # Project Tracking
│   └── settings.html          # Settings Panel
└── README.md
```

---

## 🌐 HTML5 APIs Implemented

| API | Usage | File |
|-----|-------|------|
| **LocalStorage API** | Save theme, accent color, sidebar state, user preferences | `app.js` |
| **SessionStorage API** | Store login session, active tab tracking | `app.js` |
| **Geolocation API** | Detect user location and display in topbar | `app.js` |
| **Notification API** | Browser push notifications for deadlines and alerts | `app.js` |
| **Clipboard API** | Copy referral code, employee ID, client link | `app.js` |
| **Drag & Drop API** | Reorder quick tasks in dashboard panel | `app.js` |
| **Fullscreen API** | Toggle fullscreen for immersive view | `app.js` |
| **Speech Recognition API** | Voice search to populate search input | `app.js` |
| **File Reader API** | Avatar image upload & preview in settings | `settings.html` |

---

## 📦 Modules

### 1. Dashboard Home (`index.html`)
- Statistics cards with animated counters
- Revenue bar chart (monthly/quarterly)
- Project status donut chart
- Activity timeline
- Referral code with clipboard copy
- Quick action buttons (notification, fullscreen, voice, export)
- Draggable task list

### 2. Employee Management (`pages/employees.html`)
- Full employee table with avatars
- Real-time search by name/email/ID
- Filter by role and status
- Column sorting (click header)
- Copy employee ID via Clipboard API
- Add/Edit/Delete with modals
- Pagination UI

### 3. Client Management (`pages/clients.html`)
- Client list table with company info
- Search and status filter
- Copy client email via Clipboard API
- Add/View/Edit/Delete

### 4. Project Tracking (`pages/projects.html`)
- Project cards with progress bars (animated)
- Deadline tracking, task completion stats
- Filter by status
- Search projects

### 5. Settings Panel (`pages/settings.html`)
- Dark/Light mode toggle → saved to LocalStorage
- Accent color picker (6 colors) → saved to LocalStorage
- Profile settings form
- Password change form
- LocalStorage + SessionStorage viewer
- Avatar upload via File Reader API
- Clear storage button

---

## 📱 Responsive Breakpoints

| Breakpoint | Behavior |
|-----------|----------|
| `> 1200px` | Full sidebar + 4-col stats |
| `900px–1200px` | 2-col stats, stacked charts |
| `< 900px` | Mobile sidebar (overlay), toggle button |
| `< 600px` | 1-col stats, compact topbar |

---

## 🧰 Tech Stack

- **HTML5** — Semantic structure, ARIA labels
- **CSS3** — Custom properties, Grid, Flexbox, Animations
- **Vanilla JavaScript** — No frameworks
- **Chart.js 4.4** — Revenue + Donut charts
- **Font Awesome 6.5** — Icons
- **Google Fonts** — Syne (display) + DM Sans (body)

---

## 🚀 Deployment

### Netlify
1. Push to GitHub
2. Connect repo on [netlify.com](https://netlify.com)
3. Set publish directory to `/` (root)
4. Deploy!

### Vercel
1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. No build config needed
4. Deploy!

---

## ♿ Accessibility

- Semantic HTML5 (`<main>`, `<header>`, `<nav>`, `<section>`, `<article>`)
- `aria-label`, `aria-current`, `aria-expanded`, `aria-live`, `role` attributes throughout
- Keyboard navigation for all interactive elements
- `:focus-visible` styles
- Color contrast meets WCAG AA standard

---

## 📌 Commits Guide

```
feat: Add dashboard home with stats and charts
feat: Implement HTML5 APIs (LocalStorage, Geolocation, Clipboard)
feat: Add employee management with search/sort/filter
feat: Add client management module
feat: Add project tracking with progress cards
feat: Add settings panel with theme customization
feat: Add responsive CSS for mobile/tablet/desktop
fix: Sidebar collapse state persistence
fix: Notification API fallback for unsupported browsers
docs: Add README.md
```

---

## 👤 Author

**Manikanta and Team**
- Assessment: HTML5 API Implementation & Responsive Dashboard UI
- Duration: 5 Hours
