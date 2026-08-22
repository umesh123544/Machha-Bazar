GLOBAL SEARCH + SHOPPING CART UPDATE
=======================================

NO SQL NEEDED for this update — the cart lives only in the customer's
browser (localStorage), not in your database. Nothing to run in Supabase.

FILES IN THIS ZIP (copy into your repo, overwriting where the path already
exists, creating new files/folders where it doesn't):

  NEW FILES:
    lib/cart-context.tsx
    app/api/search/route.ts
    app/account/page.tsx
    components/GlobalSearch.tsx
    components/CartDrawer.tsx
    components/AddToCartButton.tsx

  CHANGED FILES (overwrite the existing ones):
    lib/whatsapp.ts
    components/ProductOrderPanel.tsx
    components/ProductCard.tsx
    components/Navbar.tsx
    components/SiteChrome.tsx

STEP 1 - Copy all files above into your local repo at the same paths.

STEP 2 - Commit and push:
  git add .
  git commit -m "add global search, shopping cart, and redesigned header"
  git push

WHAT CHANGED:

1. Header (Navbar) — logo and the old menu links were removed, as you
   asked. New layout: a User icon on the left (links to /account), a
   search bar in the middle, and a cart icon with an item-count badge
   on the right. This shows on both mobile and desktop.

   NOTE: since the top menu links (Home/Shop/About/etc.) were removed,
   desktop visitors now navigate using the Footer links (already had
   Home/Shop/About/Care Guide/Delivery/Contact) or the site's normal
   page flow. Mobile visitors still have the bottom nav bar (unchanged)
   with Home/Shop/Care/Contact + WhatsApp. If you'd rather keep some
   top navigation links visible alongside the new search/cart layout,
   let me know and I'll adjust.

2. Global search — typing in the search bar looks across all active
   products (name + category) and shows a live dropdown with photo,
   name, category and price; clicking a result goes to that product's
   page.

3. Shopping cart — customers can now add multiple products (with
   chosen variant + quantity) to a cart, adjust quantities or remove
   items in a slide-out cart drawer, and check out with a single
   WhatsApp message listing every item, quantity, price and the total.
   The cart is saved in the browser (localStorage), so it survives a
   page refresh, but it's per-device/browser (not synced across
   devices, since there's no customer login yet).

4. "Add to Cart" buttons — added on product cards in the shop grid
   (quick-add using the lowest-priced variant) and on the product
   detail page (respects the variant and quantity you've selected
   there). The old single-item "Order via WhatsApp" button on the
   product page was replaced by "Add to Cart" — customers add items
   then checkout from the cart drawer instead of ordering one product
   at a time.

5. Account icon — since there's no customer login/signup system yet,
   the User icon currently opens a simple placeholder page (/account)
   that explains accounts are coming soon and points them to the cart
   + WhatsApp for now. If you want a real customer login/account
   system (saved addresses, order history, etc.), that's a bigger
   separate feature — let me know if you'd like to build that next.
