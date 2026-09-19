# 🚗 Parking Partner — Modern Urban Mobility & Smart Parking Platform

> **"Your Spot. Your Time. Your Way."**  
> *Find, reserve, and pay for guaranteed parking before you arrive.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-green.svg)](https://nodejs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL_Mode-003B57.svg)](https://sqlite.org/)

A production-grade, full-stack 2026 mobility/fintech web application built with a modern design system, interactive maps, live parking slot matrices, digital QR passes, and multi-role portals for **Customers**, **Parking Partners (Facility Operators)**, and **Platform Admins**.

---

## 🌟 Key Highlights & Features

### 👤 1. Customer Experience
- **Interactive Landing Page**: Hero with simulated live mobility map, floating facility cards, 4-step "How It Works" guide, and real-time statistics.
- **Personalized Dashboard**: Time-of-day greeting ("Good evening, Aditya"), quick search widget, active session quick-banner, and nearby smart parking cards.
- **Split-Screen Map & Search**: Left-side filterable cards + Right-side sticky Leaflet interactive map with custom colored price badges (₹40, ₹60, ₹80) indicating live vacancy (Green = Available, Orange = Limited, Red = Full).
- **Comprehensive Facility Detail**: Multi-photo gallery, operating hours, hourly/daily pricing rate tiers, amenities checklist (EV Charging, Covered, 24/7 CCTV, Valet, Accessibility), and user reviews.
- **Live Slot Matrix Preview**: Visual matrix of individual parking bays (`A01-D06`) with real-time occupancy indicators.
- **Multi-Step Booking Flow**:
  1. Date, arrival time, and duration selector.
  2. Vehicle selection (Tata Nexon EV, Hyundai Creta, etc.) or 1-click new vehicle addition.
  3. Cost breakdown (Parking fee + Convenience fee + GST).
  4. Mock Payment Gateway supporting UPI (Google Pay, PhonePe), Credit/Debit Cards, Net Banking, and Wallets.
  5. Booking confirmation with confetti animation.
- **Digital Parking Pass**: Dynamic visual QR code (`qrcode.react`), unique booking reference (`BK-2026-XXXX`), entry/exit timestamps, assigned slot, and Print/Save actions.
- **Active Parking Session Monitor**: Live countdown timer, elapsed duration, accrued cost calculation, turn-by-turn directions, extend stay (+1h/+2h), and instant check-out.
- **Booking & Spending History**: Monthly spending analytics chart with Recharts, CSV export, and filterable transactions.
- **Favorites & Profile Management**: Saved parking spots, vehicle management (add/delete), notification preferences.

### 🏢 2. Parking Partner (Operator) Portal
- **Operator Overview & KPIs**: Today's Revenue (₹12,450), Today's Bookings (186), Occupancy Rate (78%), Available Spaces (42).
- **Interactive Analytics**: Daily revenue bar chart, occupancy percentage trend area chart, peak hours distribution, and stay duration pie chart.
- **Parking Facility Manager**: Register new parking facilities with address, area, description, opening hours, facilities checklist, and automatic slot matrix generation.
- **Live Parking Slot Matrix (`A01-D06`)**: Visual bay status monitor with 1-click manual status overrides (`AVAILABLE`, `OCCUPIED`, `RESERVED`, `MAINTENANCE`).
- **Booking Management**: Complete facility reservation log with search and 1-click Check-in / Check-out actions.
- **Dynamic Pricing Engine**: Configure base hourly rate, peak rush-hour surge rate, weekend rate, and 24-hour daily max cap.
- **Customer Feedback & Star Breakdown**: Monitor driver reviews and 5-star to 1-star satisfaction distributions.
- **Settlement & Payout Settings**: Configure direct bank account numbers and IFSC codes for automated daily midnight payouts.

### ⚡ 3. Platform Admin Control Center
- **Admin Operations Dashboard**: Platform-wide metrics (Gross Transaction Volume, 5% Commission Take-Rate, Total Drivers, Active Operators, Total Managed Bays).
- **Live Platform Stream**: Real-time ticker of all incoming bookings and settlements.
- **User & Driver Directory**: Search users, inspect booking frequency, total spend, and 1-click account Suspend / Reactivate controls.
- **Partner Verification Pipeline**: Compliance queue for pending operator applications with license inspection and 1-click Approve / Reject actions.
- **Dispute & Support Desk**: Support ticket triage for EV charger speed issues, barrier gate assistance, and resolutions.

---

## 🔐 Demo Accounts (1-Click Switcher Available in Navbar)

The app comes with pre-seeded realistic Indian demo data for Chennai and Bengaluru:

| Role | Demo Email | Password | Access Details |
| :--- | :--- | :--- | :--- |
| **Customer** | `user@parkingpartner.demo` | `password123` | Aditya Bhandari (Active booking, vehicles, saved spots) |
| **Partner (Operator)** | `partner@parkingpartner.demo` | `password123` | Rajesh Kumar (PrimePark Infra Ltd, 10 locations, 80+ slots) |
| **Platform Admin** | `admin@parkingpartner.demo` | `password123` | Root Administrator (Compliance, users, commission) |

*You can also click the quick **"👤 Customer"**, **"🏢 Partner"**, and **"⚡ Admin"** pill buttons in the top navbar banner to instantly switch roles without typing credentials!*

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18 + TypeScript + Vite
  - Tailwind CSS + PostCSS
  - Leaflet & React-Leaflet (Interactive map with custom HTML price markers)
  - Recharts (Interactive Revenue, Occupancy, and Spending charts)
  - Lucide React (Sleek mobility and fintech iconography)
  - Canvas Confetti & QRCode.react (Digital parking pass generation)
- **Backend**:
  - Node.js + Express + TypeScript (`tsx`)
  - SQLite with `better-sqlite3` (WAL mode enabled, relational schema with transactional slot locking)
  - JWT authentication (`jsonwebtoken`) + `bcryptjs` password hashing
  - Role-Based Access Control (`CUSTOMER`, `PARTNER`, `ADMIN`)

---

## 🚀 Quick Start & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd Parking_partner
npm install
```

### 2. Seed Database
```bash
npm run seed
```
*This initializes SQLite and seeds 10+ Chennai & Bengaluru parking hubs (Marina Beach, Phoenix Mall, Chennai Central, Airport T2, Anna Nagar, etc.), 80+ slots, demo bookings, vehicles, and reviews.*

### 3. Start Development Server
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 📡 API Overview

### Authentication
- `POST /api/auth/register` — Register customer or partner account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Get current profile and role information
- `PUT /api/auth/profile` — Update user name, phone, or avatar

### Parking Discovery & Search
- `GET /api/parking` — Search with filters (`city`, `search`, `minPrice`, `maxPrice`, `rating`, `ev_charging`, `covered`, `valet`, `cctv`, `sortBy`)
- `GET /api/parking/:id` — Get detailed facility information, amenities, and reviews
- `GET /api/parking/:id/slots` — Get slot matrix layout

### Bookings & Active Sessions
- `POST /api/bookings` — Create reservation with transactional slot locking and overbooking prevention
- `GET /api/bookings` — List customer bookings (`UPCOMING`, `ACTIVE`, `COMPLETED`, `CANCELLED`)
- `PUT /api/bookings/:id/cancel` — Cancel booking and free up the slot
- `PUT /api/bookings/:id/extend` — Extend booking duration
- `GET /api/sessions/active` — Get current live parking session with countdown timer
- `POST /api/sessions/start` — Check in and start live parking timer
- `POST /api/sessions/end` — Check out, calculate final fee, and mark bay as available

### Partner Console
- `GET /api/partner/dashboard` — KPI metrics, revenue charts, and occupancy trend
- `GET /api/partner/locations` — List partner facilities
- `POST /api/partner/locations` — Create parking facility and generate slots
- `PUT /api/partner/locations/:id` — Update facility pricing and amenities
- `GET /api/partner/slots/:locationId` — Get slot matrix
- `PUT /api/partner/slots/:slotId/status` — Override slot status (`AVAILABLE`, `OCCUPIED`, `RESERVED`, `MAINTENANCE`)
- `GET /api/partner/bookings` — All facility bookings
- `PUT /api/partner/bookings/:id/status` — Partner check-in / check-out action

### Platform Admin Control
- `GET /api/admin/dashboard` — System gross volume, take-rate commission, and activity log
- `GET /api/admin/users` — User directory with search
- `PUT /api/admin/users/:id/status` — Suspend or reactivate user
- `GET /api/admin/partners` — Partner compliance queue
- `PUT /api/admin/partners/:id/verify` — Approve (`VERIFIED`) or reject partner
- `GET /api/admin/complaints` — Support tickets and dispute resolution

---

## 📱 Mobile Responsiveness

The application is built mobile-first with:
- Dedicated **Bottom Navigation Bar** on mobile devices.
- Seamless toggle between **List View** and **Interactive Map** on mobile viewports.
- Touch-friendly large rounded action buttons, modal bottom drawers, and responsive cards for 360px, 390px, 430px, 768px, 1024px, 1280px, and 1440px+ screens.

---

## 📄 License

MIT © 2026 Parking Partner Technologies Ltd. Built for production excellence.
