# Stripe Price IDs - Fintutto Ecosystem

Erstellt am: 2026-02-14
Stripe Account: alexanderdeibel (Live Mode)

---

## 1. Fintutto Portal

> Datei: `apps/fintutto-portal/src/lib/credits.ts` - BEREITS EINGETRAGEN

| Plan | Product ID | Monthly Price ID | Yearly Price ID |
|------|-----------|-----------------|-----------------|
| Mieter (4.99/mo, 47.90/yr) | `prod_Tyl740qtOKFOS1` | `price_1T0nam52lqSgjCzeLc4nwtU9` | `price_1T0nan52lqSgjCzeKAqlJZPj` |
| Vermieter (9.99/mo, 95.90/yr) | `prod_Tyl7EGSeoyiJEa` | `price_1T0nao52lqSgjCzetPewfsjU` | `price_1T0nao52lqSgjCzeoV4eJgnf` |
| Kombi Pro (14.99/mo, 143.90/yr) | `prod_Tyl7mCJsrNhSmu` | `price_1T0nap52lqSgjCzeCHEbHAQY` | `price_1T0nap52lqSgjCzeWpSag5oS` |
| Unlimited (24.99/mo, 239.90/yr) | `prod_Tyl7CBK9vGm7VX` | `price_1T0naq52lqSgjCzeQssqWiUG` | `price_1T0nar52lqSgjCzeby3QG2EB` |

## 2. Vermieter-Portal

> Datei: `apps/vermieter-portal/src/lib/credits.ts` - BEREITS EINGETRAGEN

| Plan | Product ID | Monthly Price ID | Yearly Price ID |
|------|-----------|-----------------|-----------------|
| Starter (2.99/mo, 28.70/yr) | `prod_Tyl7cbifQLDROW` | `price_1T0nas52lqSgjCzexI8LixAK` | `price_1T0nas52lqSgjCzeHgR61lIm` |
| Pro (7.99/mo, 76.70/yr) | `prod_Tyl7jm5nUl3jAM` | `price_1T0nat52lqSgjCzeAgmYPn2r` | `price_1T0nat52lqSgjCzeb2W8OvFu` |
| Unlimited (14.99/mo, 143.90/yr) | `prod_Tyl7Sn9YTCILXf` | `price_1T0nau52lqSgjCzeX6l8caP5` | `price_1T0nau52lqSgjCzeGwN7tWuo` |

## 3. BescheidBoxer

> Datei: `src/lib/credits.ts` - NOCH EINTRAGEN

| Plan | Product ID | Monthly Price ID | Yearly Price ID |
|------|-----------|-----------------|-----------------|
| Starter (2.99/mo, 28.70/yr) | `prod_Tyl7aOOdqasfx2` | `price_1T0nav52lqSgjCzezfeyYiwy` | `price_1T0naw52lqSgjCzeZU9otXyg` |
| Kaempfer (4.99/mo, 47.90/yr) | `prod_Tyl7oK51M83p1a` | `price_1T0nax52lqSgjCzeELDbmrUQ` | `price_1T0nax52lqSgjCzecXnrSRr0` |
| Vollschutz (7.99/mo, 76.70/yr) | `prod_Tyl7tKhfT3tb3T` | `price_1T0nay52lqSgjCzexKgGvJkS` | `price_1T0nay52lqSgjCzeHLGLpsuu` |

### Credit Packages (Einmalkauf)

| Package | Product ID | Price ID |
|---------|-----------|----------|
| 10 Credits (4.99) | `prod_Tyl7qhZ5yRGRyX` | `price_1T0naz52lqSgjCzeYuBqo0na` |
| 25 Credits (9.99) | `prod_Tyl7qhZ5yRGRyX` | `price_1T0naz52lqSgjCzeJUXiFb19` |
| 50 Credits (17.99) | `prod_Tyl7qhZ5yRGRyX` | `price_1T0nb052lqSgjCzeyUSt1hL6` |

## 4. Financial Compass

> Datei: `src/hooks/useSubscription.ts` - NOCH EINTRAGEN
> Bestehende Products: Basic = `prod_TxmipPdak8JwmT`, Pro = `prod_Txmjs0RZOVqFzS`

| Plan | Yearly Price ID |
|------|-----------------|
| Basic Yearly (95.90/yr) | `price_1T0nb052lqSgjCzeR8a7rmP1` |
| Pro Yearly (191.90/yr) | `price_1T0nb152lqSgjCze1ae7RGdJ` |

## 5. Mieter App

> Datei: `src/hooks/useSubscription.ts` - NOCH EINTRAGEN

| Plan | Product ID | Monthly Price ID | Yearly Price ID |
|------|-----------|-----------------|-----------------|
| Basic (4.99/mo, 47.90/yr) | `prod_Tyl7nP8RIZYiKg` | `price_1T0nb152lqSgjCzePj9k35h4` | `price_1T0nb252lqSgjCzeKthcl46U` |
| Pro (9.99/mo, 95.90/yr) | `prod_Tyl7B6nLP9waBf` | `price_1T0nb352lqSgjCzennX9j9dE` | `price_1T0nb352lqSgjCzejpncsetw` |

## 6. HausmeisterPro

> Datei: `src/config/pricing.ts` - NOCH EINTRAGEN

| Plan | Product ID | Monthly Price ID | Yearly Price ID |
|------|-----------|-----------------|-----------------|
| Enterprise (49.99/mo, 479.90/yr) | `prod_Tyl7SUTeiUkUYa` | `price_1T0nb452lqSgjCzeKfvkna7n` | `price_1T0nb552lqSgjCzelBBrkq6c` |

## 7. Ablesung

> Datei: Pricing Config - NOCH EINTRAGEN

| Plan | Product ID | Monthly Price ID | Yearly Price ID |
|------|-----------|-----------------|-----------------|
| Enterprise (49.99/mo, 479.90/yr) | `prod_Tyl7LKcRIDZWMt` | `price_1T0nb552lqSgjCzeDefCBml1` | `price_1T0nb652lqSgjCze8tE5VNcd` |

---

## Bereits vorhandene IDs (Fintutto Checker - Root App)

> Datei: `src/lib/stripe.ts` - NICHT AENDERN

| Plan | Monthly Price ID | Yearly Price ID |
|------|-----------------|-----------------|
| Basic (0.99/mo, 9.99/yr) | `price_1Sxc4652lqSgjCzeEKVlLxwP` | `price_1Sxc4652lqSgjCzeoHFU2Ykn` |
| Premium (3.99/mo, 39.99/yr) | `price_1Sxc4752lqSgjCzeRlMLZeP5` | `price_1Sxc4752lqSgjCzeC971KXL0` |
