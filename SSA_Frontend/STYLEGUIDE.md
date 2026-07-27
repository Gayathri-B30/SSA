# SSA Frontend Code Style Guide

To maintain design system consistency, optimal runtime performance, and clean repository modularity, please follow these guidelines when writing React TypeScript code in the `SSA_Frontend` workspace:

---

## 1. Directory Namespaces
Organize dashboard pages by the user's role:
* **Superadmin Actions**: Place inside [src/pages/superadmin/](file:///D:/SSA/SSA_Frontend/src/pages/superadmin)
* **Company ERP Actions**: Place inside [src/pages/company/](file:///D:/SSA/SSA_Frontend/src/pages/company)
* **Shared UI Blocks**: Put reusable buttons, modal dialog containers, or text inputs under `src/components/shared/`

---

## 2. Branding Colors & Styling Tokenization
Do NOT hardcode hexadecimal values directly inside Tailwind classes. Use our configured theme tokens from `index.css`:
* ❌ **Incorrect**: `<div className="bg-[#830117] text-[#C59D5F] border border-[#830117]">`
* ✅ **Correct**: `<div className="bg-brand-primary text-brand-gold border border-brand-primary">`

### Registered Branding Variables:
* Primary Maroon: `bg-brand-primary`, `text-brand-primary`, `border-brand-primary`
* Gold Accent: `bg-brand-gold`, `text-brand-gold`, `border-brand-gold`
* Dark Charcoal: `bg-brand-charcoal`, `text-brand-charcoal`
* Neutral Light BG: `bg-brand-bg`
* Hover state maroon: `hover:bg-primary-700` (resolves to `#5e0110`)

---

## 3. Route-Level Code Splitting (Performance)
All major page components must be dynamically imported using `React.lazy` inside [AppRoutes.tsx](file:///D:/SSA/SSA_Frontend/src/routes/AppRoutes.tsx). This decomposes the build into dynamic bundles and prevents initial load performance overhead:
```tsx
const Projects = lazy(() => import('../pages/company/Projects').then(m => ({ default: m.Projects })))
```

---

## 4. Modularity & File Size Limit
* Keep page source files under **400 lines**.
* Do not embed complex data lists or form modal components directly inline. Instead, extract them into separate component files:
  * Superadmin pieces go to: `src/pages/superadmin/components/`
  * Company pieces go to: `src/components/company/` or local `components/` subfolders.

---

## 5. Typography & Font Sizes
The typography scale for titles, captions, tables, and buttons is defined using standard Tailwind utility sizes to maintain layout hierarchy:

### Font Families:
* Default Sans: `'Outfit', 'Plus Jakarta Sans', sans-serif` (Vibrant and luxury aesthetic).
* Monospace: `'Space Mono', monospace` (Used for code fields, database keys, or currencies).

### Typography Scale Guideline:
* **Page Titles** (`<h1>`): `text-3xl` (30px) with `font-extrabold` or `font-black` for maximum premium emphasis.
* **Section Headers** (`<h2>`): `text-2xl` (24px) with `font-black` or `font-bold`.
* **Card & Panel Sub-Headers** (`<h3>`): `text-lg` (18px) or `text-base` (16px) with `font-extrabold`.
* **Sidebar Links & Table Cells**: `text-sm` (14px) with `font-semibold` or `font-medium`.
* **Meta Captions, Micro-Pills, & Helper Text**: `text-xs` (12px) or `text-[10px]` with `font-bold` or `font-medium` uppercase tracking.

---

## 6. API Integration & Network Requests
To prevent CORS errors and maintain unified session context, developers should adhere to the following network standards:
* **Use Axios Helper**: Always make API requests using the custom Axios client:
  ```typescript
  import api from '../../services/api'
  ```
* **No Hardcoded URLs**: Never write raw endpoints like `http://localhost:3000/api/...` inside code components. The system is configured to route relative `/api` paths through Vite's dev-proxy server.
* **Token Management**: The authorization token is automatically appended via Axios request interceptors. You do not need to manually configure the `Authorization: Bearer <token>` header for standard calls, unless bypassing the default auth context.

---

## 7. TypeScript & Type Safety
* **Avoid `any`**: Do not use `any` casting. Define a descriptive interface or type declaration at the top of the file or in a shared type folder.
* **Typing Props**: Always type React Component props explicitly using `React.FC<PropsInterface>`.
* **State Typing**: Provide generics when instantiating React states for complex data:
  ```typescript
  const [companies, setCompanies] = useState<Company[]>([])
  ```