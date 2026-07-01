# Admin Dashboard Enhancement Suggestions

## 📊 Dashboard & Analytics
1. **Time-Range Filtering:** Add a date range picker (e.g., "Last 7 Days", "Last 30 Days", "All Time") to filter the analytics data and the top-viewed chart.
2. **Clickable Stat Cards:** Make the dashboard cards interactive (e.g., clicking "Pending Comments" routes you to the Comments tab with the "Pending" filter applied).
3. **Recent Activity Feed:** Add a live activity log next to the chart showing recent actions across the platform (e.g., "New Lead from John", "User X registered", "Admin published [Car]").

## 🚗 Vehicles Management
4. **Rich Text Editor (WYSIWYG):** Replace the "Review body" plain `<textarea>` with a rich text editor (like TipTap or React Quill) to support bold text, lists, headers, and inline links.
5. **Drag-and-Drop Gallery Reordering:** Add drag-and-drop functionality to the vehicle gallery so admins can choose the display order of the gallery images.
6. **Vehicle Search & Pagination:** Add a search bar and real pagination to the vehicles table to scale beyond the hardcoded limit of 100 cars.
7. **Bulk Actions:** Add checkboxes next to each vehicle row to allow bulk-delete, bulk-publish, or bulk-draft.
8. **Clone / Duplicate Vehicle:** Add a "Duplicate" button to quickly clone a vehicle entry for different trim levels.

## 🏷️ Brands Management
9. **Brand Logo Upload:** Extend the Brand form to support uploading a brand logo, to be displayed on the frontend `/brands` page.
10. **Sortable Columns:** Make the brands table columns clickable to sort brands alphabetically by Name, Country, or Founded Year.

## 📥 Leads (CRM)
11. **Lead Export to CSV:** Add an "Export" button to download all leads as a `.csv` file.
12. **Internal Lead Notes:** Allow admins to expand a lead to type internal notes (e.g., "Called on Tuesday, left voicemail").

## 💬 Users & Comments
13. **User Search & Filter:** Add a search bar to quickly find users by email or name, and a dropdown to filter by Roles.
14. **Admin Comment Replies:** Allow admins to reply to user comments directly from the dashboard with an official "Admin" badge.

## ⚙️ Global Settings
15. **Site-Wide Configuration Builder:** Build a settings schema allowing admins to update global frontend settings (hero banner text, contact info, SEO tags) directly from the UI.
