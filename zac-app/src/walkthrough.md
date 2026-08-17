# Walkthrough - User Onboarding, Dynamic Status, and Profile Management

I have successfully resolved the authentication flow, sidebar branding, card indicators, and layout presentation details to guarantee all elements fit perfectly in their boxes.

---

## 🛠️ Changes Implemented

### 1. Sidebar Branding Name Fixed
- Corrected the brand title on the left sidebar [Navbar.tsx](file:///c:/Users/USER/ZAC/zac-app/src/components/Navbar.tsx) from "Zoology Club" to **"Zoology Animal Club"**.
- Reduced the sidebar header font size to `1.05rem` to ensure the updated name sits correctly on one line and fits perfectly without wrapping or spilling outside the collapse toggle area.

### 2. Dashboard Card Status Enhancement
- Refactored the iNaturalist Sync status card in [dashboard/page.tsx](file:///c:/Users/USER/ZAC/zac-app/src/app/dashboard/page.tsx) to display **"No connection yet"** instead of "Disconnected" for new users.
- Updated the Active Project status card to display **"No project linked"** instead of "None".
- Scaled the font size dynamically from `1.4rem` to `1.05rem` when disconnected or unlinked. This guarantees the labels fit inside their respective stats grid tiles without vertical clipping or horizontal overflow.

### 3. Stacked Signup Fields (Clean Box Alignment)
- Updated the step-1 registration form markup in [page.tsx](file:///c:/Users/USER/ZAC/zac-app/src/app/login/page.tsx).
- First Name and Last Name fields are now stacked vertically (as full-width fields) instead of side-by-side. This ensures that the label text, placeholder strings, and icons align and fit inside their boundaries without feeling cramped.

### 4. Wrapped Profile Details List
- Added `flexWrap: 'wrap'`, `gap: '0.5rem'`, and `wordBreak: 'break-all'` to all metadata items inside the profile information card in [page.tsx](file:///c:/Users/USER/ZAC/zac-app/src/app/profile/page.tsx).
- Long values (such as email addresses with longer domain names) will wrap and align properly rather than pushing the bounds of the box or overflowing.

### 5. Multi-Step Sign Up Wizard (Details + Avatar Upload)
- Redesigned the registration layout in [page.tsx](file:///c:/Users/USER/ZAC/zac-app/src/app/login/page.tsx) to follow a modern 2-step onboarding wizard:
  - **Step 1 (Account Details)**: Asks for split names, role, email, and password. The password checklist is conditionally shown only when the field is focused or has content.
  - **Step 2 (Profile Picture Upload)**: Triggers upon successful registration, prompting the user to upload a profile picture. Images are automatically converted to base64 using a `FileReader` and can be saved to the database, or the step can be skipped to go straight to the dashboard.

### 6. Profile Settings Page Updates
- Updated the Profile settings page [page.tsx](file:///c:/Users/USER/ZAC/zac-app/src/app/profile/page.tsx) to support:
  - Modifying first name, last name, other name, and professional role.
  - Interactive profile photo upload. Clicking the camera icon overlay on the avatar instantly converts, saves, and updates the display picture.

### 7. User Connection Isolation
- Isolated configurations in [dashboard/page.tsx](file:///c:/Users/USER/ZAC/zac-app/src/app/dashboard/page.tsx) and [inaturalist/page.tsx](file:///c:/Users/USER/ZAC/zac-app/src/app/inaturalist/page.tsx) by prepending `localStorage` keys with the logged-in user's email address (e.g. `${email}_inat_token`).
- A new user will no longer inherit previous connection tokens, linked projects, or observation history. They start with a clean connection status.

### 8. Dynamic Status & Loading Indicators
- Configured the first card of the dashboard stats grid to display "Disconnected" with a red icon background if no active token is present, and "Connected" with a green theme when a connection is configured.
- Implemented loading indicators (spinners) on:
  - The login/signup page form submission.
  - The profile page display picture camera upload.
  - The profile settings save changes button.
  - The Danger Zone delete account button.
  - The initial profile page data fetching state.

### 9. Delete Account (Danger Zone)
- Created a profile deletion API route [route.ts](file:///c:/Users/USER/ZAC/zac-app/src/app/api/auth/profile/delete/route.ts) to delete user records.
- Added a "Danger Zone" block on the profile page where users can click "Delete Zoology Animal Club Account". This asks for confirmation, makes the backend request, clears the session cookie, clears all user-specific `localStorage` credentials, and redirects them to the homepage.
