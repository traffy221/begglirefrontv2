# Bëgg Lire Frontend V3 - Tasks

## Phase 1: Foundation (Initial Generation)
- [x] Create `frontv3/tailwind.config.js` with all custom color and screen tokens
- [x] Create `frontv3/src/index.css` with CSS variables, font injections (Lora & Inter), and main editorial styles
- [x] Create `frontv3/src/api/client.js` with Axios configuration, JWT injection, and session token headers
- [x] Await user validation of foundation files

## Phase 2: Project setup & Contexts
- [x] Initialize the rest of Vite app configuration and packages (React Router, React Query, Lucide icons)
- [x] Create `frontv3/src/context/AuthContext.jsx` with user profiles, login/logout, and wishlist sync
- [x] Create `frontv3/src/context/CartContext.jsx` with mixed cart (books + supplies) and local storage sync

## Phase 3: Editorial Layout & Navigation
- [x] Create layouts (`Header.jsx`, `Footer.jsx`, `Layout.jsx`) with magazine style
- [x] Create routing routes structure in `App.jsx`

## Phase 4: Pages & Components
- [x] Create `Home.jsx` with asymmetric editorial layout (hero, benefits, weekly author, trending, coming soon, latest articles, etc.)
- [x] Create `Listing.jsx` (catalog) with category filters, searches, and lists
- [x] Create `BookDetail.jsx` with book details, reviews, related books, and view register
- [x] Create `Cart.jsx` with mixed items and total details
- [x] Create `Checkout.jsx` and `Facture.jsx` with Paytech integration and payment flows
- [x] Create auth forms: Login, Register, Forgot Password, Reset Password, Verify Email
- [x] Create `SellBook.jsx` (Seller Form with upload and auth)
- [x] Create `Wishlist.jsx`
- [x] Create community pages (Articles list, Blog details, Chronicle details with chapter navigation)
- [x] Create school supplies catalog page (`Fournitures.jsx`)
- [x] Wire all routes in `App.jsx`
- [x] Verify import paths and compile/build successfully with `npm run build`
