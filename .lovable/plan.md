

## Plan: Visual Overhaul -- Dark Theme + Orange Accent + Plus Jakarta Sans + Expanded Sidebar

This plan covers purely visual/CSS changes across the project. No logic, routes, or functionality will be modified.

### Technical Details

The changes span these files:

**1. `index.html`** -- Replace Google Fonts import link to load Plus Jakarta Sans (weights 400-800).

**2. `src/index.css`** -- Complete CSS variable overhaul:
- Font import: `Plus Jakarta Sans` (400,500,600,700,800)
- `--font-heading` and `--font-body` both set to `'Plus Jakarta Sans'`
- `:root` variables updated to new dark palette:
  - `--background`: `#0C0E13`
  - `--foreground`: `#E8EEFF`
  - `--card`: `#161A24`
  - `--card-foreground`: `#E8EEFF`
  - `--popover`: `#161A24`
  - `--popover-foreground`: `#E8EEFF`
  - `--primary`: `#FF6B2B` (orange)
  - `--primary-foreground`: `#FFFFFF`
  - `--secondary`: `#1C2130`
  - `--secondary-foreground`: `#E8EEFF`
  - `--muted`: `#1C2130`
  - `--muted-foreground`: `#6B7A99`
  - `--accent`: `#1C2130`
  - `--accent-foreground`: `#FF6B2B`
  - `--destructive`: stays red-ish
  - `--border`: `#252D3D`
  - `--input`: `#1C2130`
  - `--ring`: `#FF6B2B`
  - `--radius`: `0.875rem` (14px)
  - Sidebar vars: background `#0F1118`, border `#252D3D`, primary `#FF6B2B`
  - Custom tokens: `--hero-gradient` updated to orange gradient, `--shadow-glow` to orange glow
- Remove `.dark` block (everything is dark by default now)
- Update utility classes for new gradient/glow

**3. `tailwind.config.ts`** -- Update font families to `'Plus Jakarta Sans'`.

**4. `src/components/ui/input.tsx`** -- Update default classes for new input styling: `bg-[#1C2130]`, `border-[#252D3D]`, `text-[#E8EEFF]`, `placeholder:text-[#3A4560]`, `rounded-[10px]`, `focus-visible:ring-[#FF6B2B]`, padding `py-3 px-4`.

**5. `src/components/ui/button.tsx`** -- Update `buttonVariants`:
  - `default`: `bg-[#FF6B2B] text-white rounded-[9px] font-bold hover:bg-[#E8521A]`
  - `outline`/`secondary`: transparent + border `#252D3D`, text `#6B7A99`, hover border/text `#FF6B2B`

**6. `src/components/ui/card.tsx`** -- Update Card base: `rounded-[14px] border-[#252D3D] bg-[#161A24] shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:border-[#FF6B2B30]`.

**7. `src/components/DashboardLayout.tsx`** -- Expand sidebar with grouped menu items:
  - ATENDIMENTO: Conversas (with badge), IA ao Vivo, Bate Papo ao Vivo
  - VENDAS: Pedidos, Metricas, Transmissao, Audiencia
  - AUTOMACAO: Fluxos de Conversa, Automacao, Etiquetas
  - CONFIGURACOES: Empresa, Respostas Rapidas, Horarios, Conexoes, API, Configuracoes Gerais
  - Active item style: `bg-[#FF6B2B18] border-l-3 border-[#FF6B2B] text-[#FF6B2B]`
  - Hover: `bg-[#1C2130] text-[#E8EEFF]`
  - Sidebar bg: `#0F1118`, border-right `#252D3D`
  - Logo icon: gradient orange background with soft glow
  - Non-active items that have no route yet will just be visual placeholders (no navigation)

**8. All page files** -- Replace any inline `bg-hero-gradient` references to use the updated orange gradient. Replace `font-heading` usage (which will now resolve to Plus Jakarta Sans via tailwind config). No logic changes.

### What stays the same
- All routes in `App.tsx`
- All state management, form handlers, mock data
- All component structure and props
- All labels, texts, placeholders

### Summary of visual changes
- Font: Plus Jakarta Sans everywhere
- Dark background with orange (#FF6B2B) accents
- Expanded sidebar with grouped navigation items
- Updated card, input, and button component styles
- Consistent dark theme across all pages

