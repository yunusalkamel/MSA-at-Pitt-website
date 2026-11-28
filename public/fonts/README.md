Phone font assets retain the existing site's families. Desktop continues to use its
original Google Fonts stylesheet. Critical home fonts are in the main stylesheet;
reading.css activates after the home hero is decoded (immediately on inner pages).

Cormorant Garamond, Pinyon Script, Amiri and Plus Jakarta Sans are derived from the
existing TTF sources and licenses in their public/ directories. FontTools created
WOFF2 subsets; Arabic shaping tables are retained. Amiri Invocation is a separate
subset for the fixed Bismillah, leaving normal Arabic shaping intact elsewhere.

DM Sans and Space Mono came from the official Google Fonts repository:
https://github.com/google/fonts/tree/main/ofl/dmsans
https://github.com/google/fonts/tree/main/ofl/spacemono
Their OFL licenses accompany these files. DM Sans retains the existing optical-size
range 9–40 and weights 300–500 (italic 400); Jakarta retains 300–800 (italic 400–500).
