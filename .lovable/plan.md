Add a dedicated "Fireside Chat" section to the homepage that embeds the YouTube video https://www.youtube.com/watch?v=F6JGQbgs9t8.

Implementation details:
- Edit `src/routes/index.tsx`.
- Insert a new full-width section between the hero/bento grid and the "Chapter I · Disciplines" section.
- Use a lazy-loaded, responsive 16:9 iframe pointing to `https://www.youtube.com/embed/F6JGQbgs9t8`.
- Style with the existing editorial card treatment: eyebrow label, italic heading, short caption, and a bordered container.
- Ensure no horizontal overflow on mobile/tablet.

No other files or dependencies are needed.