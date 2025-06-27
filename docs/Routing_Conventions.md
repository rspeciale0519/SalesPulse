# SalesPulse Routing Conventions

## Next.js App Router Conventions

### Route Groups

In SalesPulse, we use Next.js App Router with route groups to organize our code without affecting the URL structure. This is a crucial concept to understand when navigating or modifying the application.

Key conventions to remember:

1. **Route Groups (Parentheses)**: Folders with parentheses like `(dashboard)` are for code organization only and **do not affect the URL path**.
   - Example: Files in `app/(dashboard)/goals/page.tsx` are accessible at `/goals`, not `/dashboard/goals`

2. **Regular Folders**: Standard folders do create URL segments.
   - Example: Files in `app/settings/page.tsx` are accessible at `/settings`

3. **Dynamic Routes**: Folders with square brackets like `[id]` represent dynamic segments.
   - Example: Files in `app/user/[id]/page.tsx` would be accessible at `/user/123` where `123` is the dynamic ID

### Navigation Links

All navigation links in components like `app-sidebar.tsx` must follow these conventions:

- Links to pages in route groups should use the URL **without** the route group name
  - Example: Use `/goals` not `/dashboard/goals` for the Goals Calculator page
  - Example: Use `/activity` not `/dashboard/activity` for the Activity Log page

- The dashboard home should link to `/` or `/dashboard` based on the app's configuration
  - Currently configured to use `/`

### Common Issues

- **404 Errors**: If you encounter 404 errors after adding new routes, verify that navigation links match the actual route structure, not the file path structure.

- **Path Mismatch Errors**: The dashboard layout contains checks for pathname mismatches between `window.location.pathname` and `usePathname()`. If you see an error like `CRITICAL PATH MISMATCH`, it likely indicates a routing configuration issue.

## Modifying Routes

When adding new routes:

1. Place dashboard-specific pages inside the `(dashboard)` route group
2. Update navigation links to use the correct paths (without the route group prefix)
3. Test navigation to ensure routes are properly accessible
4. Update this documentation if any new routing conventions are established
