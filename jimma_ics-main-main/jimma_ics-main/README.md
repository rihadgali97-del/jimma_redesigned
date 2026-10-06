# Jimma Zone Islamic Affairs Supreme Council Digital Platform
## Majlis Islaamaa Godina Jimmaa • የጅማ ዞን እስልምና ጉዳዮች ከፍተኛ ምክር ቤት

An integrated digital governance portal and civic services platform engineered for the **Jimma Zone Islamic Affairs Supreme Council** in Oromia, Ethiopia. The platform unifies zonal institutional management, public Shari'ah civic services, GIS mosque infrastructure mapping, community crisis broadcasts, financial transparency, and educational administration across all 18 Woredas.

---

## 🌟 Key Features & Capabilities

### 1. Civic Services & Shari'ah Desk (`/services`)
- **Nikah Marriage Registration**: Online application submission, prerequisite checklist, document verification, and appointment scheduling.
- **Zakat & Social Welfare Aid**: Streamlined application pipeline for eligible mustahiqqeen with district-level casework allocation.
- **Janazah 24/7 Emergency Support**: Priority response desk for bereavement assistance, ghusl coordination, transport, and cemetery plots.
- **Real-Time Application Tracker**: Public status desk to track submitted applications using reference numbers (e.g., `REQ-2026-00421`) with live review stages and assigned officer contacts.
- **Interactive Zakat & Ushr Calculator**:
  - Live gold and silver Nisab thresholds updated in Ethiopian Birr (ETB).
  - Multi-asset assessment: cash reserves, business inventory, gold/jewelry, livestock (camels, cattle, sheep/goats), and agricultural harvest Ushr (rain-fed 10% vs. irrigated 5%).

### 2. GIS Mosques & Madrasas Directory (`/mosques`, `/map`)
- **Interactive Cartography**: Geospatial mapping of historical and contemporary central mosques across Hermata, Agaro, Kersa, Limmu Kosa, Mana, Seka Chekorsa, and surrounding Woredas.
- **Institutional Profiles**: Verified prayer times, Jumu'ah capacities, ablution & wudu amenities, Quranic boarding facilities, and imam profiles.
- **Heritage Documentation**: Detailed architectural and historical profiles of renowned landmark institutions including Grand Anwar Mosque, Aba Jifar Palace Mosque, and traditional Islamic centers of learning.

### 3. Community Gateway & Broadcast Center
- **Telegram Channel Integration**: Connected with the official broadcast channel [t.me/emyc1](https://t.me/emyc1) for instant announcements, prayer updates, and public notices.
- **Zonal SMS / Telegram Dispatcher**: Bulk notification dispatch system supporting critical alerts, emergency janazah notices, and educational sabaq announcements across registered imams and community subscribers.
- **Event Notification & Reminder Center**: Email and native browser push subscriptions for upcoming Quran Tahfeez competitions, Ulema symposia, youth workshops, and Ramadan community gatherings with customizable timing (instant, 24h prior, 48h prior, weekly Friday digest) and district-level filters.

### 4. Transparency, Waqf & Institutional Governance (`/transparency`, `/about`)
- **Executive Leadership Directory**: Biographies and portfolios of the Council President, Mufti / Fatwa Board Chairman, General Secretary, and Shari'ah Advisory Board.
- **Waqf Asset Registry**: Tracking public community endowments, commercial rentals, agricultural plantations, and cemetery land trusts.
- **Audited Financial Reporting**: Public balance sheets, Zakat disbursement audits, and development expenditure dashboards.
- **Shari'ah Fatwa & Guidance Archive**: Searchable repository of rulings on contemporary fiqh questions, family law, trade ethics, and Islamic finance.

### 5. Multilingual Localization (4 Languages)
- **Afaan Oromoo**
- **English**
- **Amharic (አማርኛ)**
- **Arabic (العربية)** — with right-to-left (RTL) reading support and classical typographic accents.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + TypeScript |
| **Styling & Design System** | Tailwind CSS v4 + Motion animations |
| **Routing** | React Router v7 (SPA with client-side history) |
| **Icons** | Lucide React |
| **Data Visualization** | Recharts (Financial audits, service volume, mosque distribution) |
| **Document Export** | jsPDF & html2canvas (Certificates, registration receipts) |
| **Build & Dev Tooling** | Vite 6 + tsx |

---

## 📁 Project Structure

```
├── public/                     # Static assets, emblems, and favicon
├── src/
│   ├── components/
│   │   ├── common/             # Badges, Islamic patterns, modals, cards
│   │   ├── gateway/            # Telegram & SMS composer, logs, simulators
│   │   ├── layout/             # Header, Navigation, Footer, Theme toggle
│   │   ├── ui/                 # Reusable UI primitives (Button, Card, Badge)
│   │   └── zakat/              # Interactive Zakat & Ushr calculator
│   ├── context/
│   │   ├── AppContext.tsx      # Global store (services, mosques, events, broadcasts)
│   │   └── LanguageContext.tsx # Multilingual translations and RTL handling
│   ├── data/                   # Initial seeds, mosque GIS coordinates, historical archives
│   ├── pages/
│   │   ├── admin/              # Council administrative dashboard & control desk
│   │   └── public/             # Home, Mosques, Services, Map, About, Transparency, etc.
│   ├── types/                  # Strict TypeScript schemas and interfaces
│   ├── App.tsx                 # Main application routes
│   ├── main.tsx                # Client bootstrap
│   └── index.css               # Global Tailwind CSS configurations
├── metadata.json               # Application metadata & platform permissions
├── package.json                # Project dependencies and operational scripts
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. Clone or download the repository into your workspace.
2. Install project dependencies:
   ```bash
   npm install
   ```

### Development Server

Start the local development server on port 3000:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### Production Build & Linting

- **Type-Check & Linting**:
  ```bash
  npm run lint
  ```
- **Production Build**:
  ```bash
  npm run build
  ```
  The production static assets will be compiled into the `dist/` directory.

---

## 🏛️ Council Secretariat Contact

- **Headquarters**: Central Secretariat Building, Hermata Roundabout, Jimma, Oromia, Ethiopia
- **Emergency Janazah Line**: `+251 47 111 0244` (24/7 Dispatch)
- **Secretariat Inquiries**: `secretariat@jimmaislamiccouncil.org`
- **Official Telegram Channel**: [https://t.me/emyc1](https://t.me/emyc1)
