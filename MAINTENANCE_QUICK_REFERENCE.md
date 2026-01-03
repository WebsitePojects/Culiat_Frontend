# Maintenance Mode Quick Reference

## Environment Variables

### VITE_MAINTENANCE_MODE
**Type:** Boolean (`true` or `false`)  
**Required:** Yes  
**Description:** Master switch to enable/disable maintenance mode

```env
VITE_MAINTENANCE_MODE=true   # Enable maintenance mode
VITE_MAINTENANCE_MODE=false  # Disable maintenance mode
```

---

### VITE_MAINTENANCE_END_TIME
**Type:** String (Date/Time)  
**Required:** No  
**Description:** Set a specific date/time when maintenance will end. The countdown timer will automatically calculate the remaining time.

#### Supported Formats:

1. **ISO 8601 Format (Recommended)**
   ```env
   VITE_MAINTENANCE_END_TIME=2026-01-04T18:30:00
   ```

2. **Date and Time with Space**
   ```env
   VITE_MAINTENANCE_END_TIME=2026-01-04 18:30:00
   ```

3. **Full ISO String with Timezone**
   ```env
   VITE_MAINTENANCE_END_TIME=2026-01-04T18:30:00+08:00
   ```

4. **Leave Empty for Default (30 minutes from now)**
   ```env
   VITE_MAINTENANCE_END_TIME=
   ```

#### Examples:

**Maintenance until 6:30 PM today:**
```env
VITE_MAINTENANCE_END_TIME=2026-01-04T18:30:00
```

**Maintenance for 2 hours (set end time manually):**
```env
VITE_MAINTENANCE_END_TIME=2026-01-04T16:00:00
```

**Maintenance overnight (ends tomorrow morning):**
```env
VITE_MAINTENANCE_END_TIME=2026-01-05T08:00:00
```

---

### VITE_MAINTENANCE_MESSAGE
**Type:** String  
**Required:** No  
**Description:** Custom message to display on the maintenance page. If not set, uses the default message.

```env
VITE_MAINTENANCE_MESSAGE=We are upgrading our servers. Expected completion: 2 hours.
```

**Default Message:**
> "We're currently performing scheduled maintenance to improve your experience. Our system will be back online shortly. Thank you for your patience!"

---

## Complete Example

### Example 1: Quick Maintenance (30 minutes)
```env
VITE_MAINTENANCE_MODE=true
VITE_MAINTENANCE_END_TIME=
VITE_MAINTENANCE_MESSAGE=Quick system update in progress. Back in 30 minutes!
```

### Example 2: Scheduled Maintenance with Specific End Time
```env
VITE_MAINTENANCE_MODE=true
VITE_MAINTENANCE_END_TIME=2026-01-04T20:00:00
VITE_MAINTENANCE_MESSAGE=Scheduled maintenance for database optimization. We'll be back at 8:00 PM!
```

### Example 3: Extended Maintenance (Next Day)
```env
VITE_MAINTENANCE_MODE=true
VITE_MAINTENANCE_END_TIME=2026-01-05T09:00:00
VITE_MAINTENANCE_MESSAGE=Major system upgrade in progress. Service will resume tomorrow at 9:00 AM. Thank you for your patience!
```

### Example 4: Emergency Maintenance (Unknown Duration)
```env
VITE_MAINTENANCE_MODE=true
VITE_MAINTENANCE_END_TIME=
VITE_MAINTENANCE_MESSAGE=Emergency maintenance in progress. We apologize for the inconvenience and are working to restore service as quickly as possible.
```

---

## How the Countdown Works

### With VITE_MAINTENANCE_END_TIME Set:
1. Component reads the environment variable
2. Parses it as a Date object
3. Calculates the difference between now and end time
4. Displays countdown in format: `2h 45m 30s` or `45m 30s`
5. When time expires, shows "Anytime now"

### Without VITE_MAINTENANCE_END_TIME (Default):
1. Component calculates 30 minutes from current time
2. Displays countdown: `29m 45s` → `0m 5s` → "Anytime now"

---

## Important Notes

### Date Format Tips:
- ✅ Always use 24-hour format (18:30, not 6:30 PM)
- ✅ Use leading zeros (09:00, not 9:00)
- ✅ Recommended: `YYYY-MM-DDTHH:MM:SS` format
- ⚠️ Times are in your local timezone unless specified

### Validation:
- Invalid date formats will fallback to default (30 minutes)
- Past dates will show "Anytime now" immediately
- Empty value uses default countdown

### After Setting Variables:
1. **Always restart the dev server** after changing .env files
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Clear browser cache** if changes don't appear
   ```
   Ctrl+Shift+Delete (Windows)
   Cmd+Shift+Delete (Mac)
   ```

---

## Testing Different Scenarios

### Test 1: Short Maintenance (5 minutes)
```env
VITE_MAINTENANCE_MODE=true
VITE_MAINTENANCE_END_TIME=2026-01-04T14:35:00  # Set 5 mins from now
VITE_MAINTENANCE_MESSAGE=Brief maintenance. Back in 5 minutes!
```

### Test 2: Long Maintenance (4 hours)
```env
VITE_MAINTENANCE_MODE=true
VITE_MAINTENANCE_END_TIME=2026-01-04T18:00:00  # Set 4 hours from now
VITE_MAINTENANCE_MESSAGE=System upgrade in progress. Estimated completion: 4 hours.
```

### Test 3: Past End Time (Should show "Anytime now")
```env
VITE_MAINTENANCE_MODE=true
VITE_MAINTENANCE_END_TIME=2026-01-04T10:00:00  # Set time in the past
VITE_MAINTENANCE_MESSAGE=Finalizing maintenance...
```

---

## Common Errors & Solutions

### Error: "Invalid VITE_MAINTENANCE_END_TIME format"
**Console will show:** `Invalid VITE_MAINTENANCE_END_TIME format. Using default 30 minutes.`

**Cause:** Incorrectly formatted date string

**Solution:** Use format `YYYY-MM-DDTHH:MM:SS`
```env
# ❌ Wrong:
VITE_MAINTENANCE_END_TIME=01/04/2026 6:30 PM

# ✅ Correct:
VITE_MAINTENANCE_END_TIME=2026-01-04T18:30:00
```

### Error: Countdown Not Updating
**Cause:** Server not restarted after .env changes

**Solution:**
```bash
# Stop server (Ctrl+C or Cmd+C)
npm run dev
```

### Error: Showing Wrong Time
**Cause:** Timezone issues or incorrect date format

**Solution:** Include timezone in the date string
```env
# For Philippine Time (UTC+8)
VITE_MAINTENANCE_END_TIME=2026-01-04T18:30:00+08:00
```

---

## Production Deployment

### Vercel
1. Go to Project Settings → Environment Variables
2. Add: `VITE_MAINTENANCE_MODE` = `true`
3. Add: `VITE_MAINTENANCE_END_TIME` = `2026-01-04T20:00:00`
4. Add: `VITE_MAINTENANCE_MESSAGE` = `Your message here`
5. Redeploy

### Netlify
1. Go to Site Settings → Environment Variables
2. Add the three variables
3. Trigger new deploy

---

## Quick Commands

### Enable Maintenance Mode:
```bash
# Edit .env.development
VITE_MAINTENANCE_MODE=true

# Restart server
npm run dev
```

### Set End Time for 2 Hours from Now:
```bash
# If current time is 2:00 PM, set to 4:00 PM:
VITE_MAINTENANCE_END_TIME=2026-01-04T16:00:00
```

### Disable Maintenance Mode:
```bash
# Edit .env.development
VITE_MAINTENANCE_MODE=false

# Restart server
npm run dev
```

---

## Need Help?

For detailed documentation, see: [docs/MAINTENANCE_MODE_DOCUMENTATION.md](../docs/MAINTENANCE_MODE_DOCUMENTATION.md)

For support: barangayculiat@gmail.com
