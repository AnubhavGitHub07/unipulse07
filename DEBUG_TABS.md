# Debugging Admin Dashboard Tabs

## Issue: Tabs not showing when clicking

### Quick Fix:

1. **Hard Refresh Browser:**
   - Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - This clears cached JavaScript files

2. **Check Browser Console:**
   - Press `F12` to open Developer Tools
   - Go to **Console** tab
   - Click on a tab (Attendance, Timetable, etc.)
   - Look for:
     - Error messages (red text)
     - Debug logs saying "Switching to tab: ..."

3. **Verify Scripts are Loading:**
   - Go to **Network** tab in Developer Tools
   - Filter by "JS"
   - Reload page
   - Check that these files load:
     - `api.js` ✅
     - `auth.js` ✅
     - `admin.js` ✅

### Expected Behavior:

When you click a tab:
1. Tab button should highlight (indigo color)
2. Tab content should appear
3. Console should show: "Switching to tab: attendance" (or whatever tab)
4. Console should show: "Tab shown: attendance"

### Common Issues:

**Issue 1: Tabs show but content is empty**
- This is normal if no data exists yet
- Try uploading some data (CSV, PYQ, etc.)

**Issue 2: JavaScript errors**
- Check console for red error messages
- Common errors:
  - `Cannot read property 'getRecords' of undefined` → api.js not loaded
  - `checkAuth is not defined` → auth.js not loaded

**Issue 3: Tabs not switching at all**
- Check if tab buttons have `data-tab` attribute
- Check if tab content divs have correct IDs matching `data-tab` values

### Test Tabs:

1. **Dashboard Tab** - Should show stats
2. **Attendance Tab** - Should show upload form and empty table
3. **Timetable Tab** - Should show timetable form
4. **PYQ Tab** - Should show upload form and empty list
5. **Results Tab** - Should show upload form and empty list
6. **Analytics Tab** - Should show charts (empty if no data)

### If Still Not Working:

1. Open browser console (F12)
2. Run this command:
```javascript
// Test tab switching manually
document.querySelectorAll('.tab-btn').forEach(btn => {
    console.log('Tab button:', btn.dataset.tab);
    btn.addEventListener('click', () => {
        console.log('Clicked:', btn.dataset.tab);
        const tabContent = document.getElementById(btn.dataset.tab);
        if (tabContent) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
            tabContent.classList.remove('hidden');
            console.log('Tab shown:', btn.dataset.tab);
        }
    });
});
```

This will manually enable tab switching if the original code isn't working.

