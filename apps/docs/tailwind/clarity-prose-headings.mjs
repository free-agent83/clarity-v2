import plugin from 'tailwindcss/plugin';

const notProse = ':not(:where([class~="not-prose"], [class~="not-prose"] *))';

/** Clarity docs: prose h1–h3 at weight 400 (Fumadocs default is 600/800). */
export default plugin(({ addComponents }) => {
  addComponents({
    [`.prose :where(h1)${notProse}`]: { fontWeight: '400' },
    [`.prose :where(h2)${notProse}`]: { fontWeight: '400' },
    [`.prose :where(h3)${notProse}`]: { fontWeight: '400' },
  });
});
