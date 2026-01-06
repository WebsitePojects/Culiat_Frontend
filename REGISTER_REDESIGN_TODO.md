# Register Page Redesign & Fixes - TODO List

## Priority 1: Critical Bug Fixes
- [x] **Fix PSA Modal Logic** - Modal should only appear when user SKIPS PSA info, not when registering WITH PSA
  - ✅ Updated `handleSubmitClick` to check `formData.skipPSAStep` before showing modal
  - ✅ Modal now only appears when PSA is skipped
  - ✅ Direct registration when PSA info is provided

## Priority 2: Terms & Privacy Enhancement
- [ ] **Create Professional Terms & Conditions Modal**
  - Design wide modal (80-90% viewport width)
  - Add comprehensive terms content (privacy, data usage, user rights, barangay policies)
  - Implement scroll-to-bottom detection before enabling "I Agree" button
  - Add visual indicator showing scroll progress
  - Styled checkboxes for acceptance
  - Professional formatting with sections and headers

## Priority 3: Complete Register Page Redesign
### Layout Changes
- [ ] **Remove/Redesign Left Blue Panel**
  - Evaluate space usage
  - Option A: Remove completely and use header branding
  - Option B: Convert to collapsible sidebar (mobile hamburger)
  - Option C: Reduce to narrow vertical brand strip

- [ ] **Optimize Form Layout**
  - Single column layout for mobile (< 768px)
  - Two-column layout for tablet (768px - 1024px)
  - Three-column layout for desktop (> 1024px)
  - Reduce vertical scrolling with better spacing
  - Group related fields visually

### Visual Improvements
- [ ] **Professional Styling**
  - Consistent color scheme matching site theme
  - Better typography hierarchy
  - Smooth transitions and animations
  - Professional card-based design
  - Shadow and depth effects
  - Progress indicator redesign

- [ ] **Mobile Responsiveness**
  - Touch-friendly input sizes (min 44px height)
  - Proper viewport meta tags
  - Optimized button sizes for mobile
  - Stack sections vertically on mobile
  - Hamburger menu for navigation if needed

### Form Enhancements
- [ ] **Step Indicator Redesign**
  - Modern progress bar with labels
  - Active/completed/pending states
  - Click to navigate completed steps

- [ ] **Input Field Improvements**
  - Floating labels
  - Better validation messages
  - Icon indicators (valid/invalid)
  - Help tooltips for complex fields
  - Auto-focus management

- [ ] **PSA Section Redesign**
  - Cleaner collapsible sections
  - Better visual hierarchy
  - Grouped related fields
  - Clear section descriptions

## Priority 4: UX Improvements
- [ ] **Loading States**
  - Skeleton screens during data load
  - Button loading spinners
  - Progress indicators for file uploads

- [ ] **Error Handling**
  - Toast notifications for errors
  - Inline validation messages
  - Clear error recovery steps

- [ ] **Accessibility**
  - ARIA labels
  - Keyboard navigation
  - Screen reader support
  - Focus management

## Implementation Plan
### Phase 1 (Current Session)
1. Fix PSA modal logic bug
2. Create terms & conditions modal
3. Basic layout restructuring (remove/redesign left panel)

### Phase 2 (Next Session)
1. Complete form layout optimization
2. Implement responsive breakpoints
3. Style enhancements

### Phase 3 (Final Session)
1. Polish animations and transitions
2. Accessibility improvements
3. Testing and bug fixes

---
**Start Date:** January 6, 2026
**Status:** Planning Phase
