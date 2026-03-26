# Accessibility Issues to Fix

Please fix the following accessibility issues across the `logopedie` Astro website:

## Global Issues
- **Missing Alt Text**: The main header logo `<img>` lacks an `alt` attribute (should be `alt="Logopedie Anděl"`). Decorative images (e.g., hands with Scrabble letters, bird graphics) need `alt=""` or `role="presentation"` so screen readers ignore them.
- **Semantic Headings**: Fix instances where heading levels are skipped (e.g., jumping from `<h1>` directly to `<h4>`). Ensure a logical heading hierarchy.
- **Lists**: Ensure all bulleted lists use semantic `<ul>` and `<li>` tags instead of plain text styling.

## Page-Specific Issues

### Homepage (`/`) & "O nás" (`/o-nas`)
- **Toggle Buttons**: The "›" icons used to expand staff information in `/o-nas` are `<span>` elements without interactive roles. Convert them to `<button>` elements or add `role="button"`, `aria-label`, and `aria-expanded` attributes.
- **Staff Names**: Staff names in `/o-nas` use `<strong>` tags. Change these to semantic headings (`<h2>` or `<h3>`).
- **Section Headers**: Section headers like "Zkušenosti" and "Specializační kurzy" in `/o-nas` use `<p>` tags. Change them to appropriate headings.

### Pricing (`/cenik`) & Contacts (`/kontakty`)
- **Tabular Data**: Pricing on `/cenik` and opening hours on `/kontakty` are formatted as text blocks. Convert these to semantic `<table>` elements with proper `<th>` headings.
- **Maps**: The Google Maps `<iframe>` on `/kontakty` is missing a `title` attribute. Add `title="Mapa s polohou ambulance"`.

### Intake Form (`/formular`) - CRITICAL
- **Fieldsets**: Form sections (like "Školní zařazení" and "Rodinná anamnéza") and grouped radio buttons/checkboxes are not contained in `<fieldset>` tags. Wrap them in `<fieldset>` tags with descriptive `<legend>` tags.
- **Required Fields**: Mandatory fields are marked with a `*` visually but lack `required` and `aria-required="true"` HTML attributes. Add these attributes to all mandatory inputs.
- **Error Feedback**: There are no accessible error validation messages. Implement validation feedback that is linked to the input via `aria-describedby`.
- **Label Associations**: While some inputs use the wrapping pattern, ensure every single input has a strictly associated `<label>` (either by wrapping the input or using exact `id` and `for` associations).
