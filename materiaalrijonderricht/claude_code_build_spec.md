# Bouwspecificatie: Verkeerssituaties-app (Claude Code)

Gebaseerd op *Maquette_les_1a.pdf*, 20 kruispuntsituaties over voorrangsregels.
Suriname rijdt links. Alle geometrie hieronder is geverifieerd en bevestigd in een reviewsessie (zie `verkeerssituaties_diagrammen_1-20_v5.html` voor de exacte referentie-SVG's).

## Coördinatensysteem (vast, viewBox 0 0 380 300)

Eén standaardsjabloon voor alle 20 situaties:
- Verticale rijbaan (noord/zuid): buitengrenzen x=150 / x=270, middellijn x=210
- Horizontale rijbaan (oost/west): buitengrenzen y=90 / y=210, middellijn y=150
- Open kruispuntvierkant: x150–270, y90–210 (geen lijnen doorheen)
- Naderingszones: noord y30–90, zuid y210–270, west x20–150, oost x270–360
- S/B-label op het middelpunt: (210, 150)
- Fietspad (alleen indien gespecificeerd): band van 20px aan de buitenkant van een oost/westweg — noord y90–110, zuid y190–210, rijbaan blijft y110–190

## Standaard posities

**Auto:**
- Noordweg: rect x=220, y=40, breedte 20, hoogte 34 (midden x=230)
- Zuidweg: rect x=180, y=226, breedte 20, hoogte 34 (midden x=190)
- Pijl start: 4px voorbij de rand in rijrichting (noord: y=78, zuid: y=222)

**Fietser:**
- Noordweg: cirkel cx=258, cy=60, r=7 (start pijl y=67)
- Zuidweg: cirkel cx=162, cy=240, r=7 (start pijl y=233)

## Afslagregels (het belangrijkste deel)

Elke afslaande pijl is **hoekig** (rechte lijnsegmenten, geen curves): `M start L hoek L einde`.

**Diepte** (hoever de pijl de bestemmingsweg in gaat) is altijd:
- Oost: x=280
- West: x=140

**Rij** (welke baan binnen de bestemmingsweg, bepaalt links-houden):
| Bestemming | Rijbaan (auto) | Fietspad (fietser) |
|---|---|---|
| Oost | y=130 | y=100 |
| West | y=170 | y=200 |

**Regel voor fietsers zonder fietspad:** een fietser gaat ALTIJD naar de buitenste rij (100 oost / 200 west), ongeacht of er een fysiek fietspad getekend is. Dit is dezelfde positie als wanneer er wél een fietspad is — het verschil is alleen of de band zichtbaar gekleurd is.

**Regel voor twee auto's die dezelfde rijbaan delen** (bijv. rechtsaffer + linksaffer die allebei naar dezelfde weg afslaan): verschuif ±6 vanaf de standaardrij, zodat de lijnen parallel lopen zonder te overlappen. Wie welke kant krijgt maakt niet uit zolang het consistent ptoegepast wordt.

**Nooit een auto en fietser tussen 130/170 en 100/200 "in het midden" plaatsen** — dat veroorzaakt kruisende lijnen wanneer de fietser van een verder gelegen kolom (258 of 162) komt dan de auto (230 of 190). Zie sectie "Waarom dit werkt" hieronder.

## Waarom dit werkt (kruisingslogica)

Een fietser op de noordweg (kolom 258) die afslaat, moet zijn hoek bereiken vóórdat zijn verticale lijn de horizontale lijn van auto 1 (die eindigt op kolom 230) kruist. Voor een **oostafslag** ligt kolom 258 wél binnen het bereik van auto 1's horizontale segment (230–280) — dus moet de fietser op een KLEINERE y afslaan dan de auto (100 vs 130), zodat zijn horizontale segment al is voltooid vóór de auto's rij. Voor een **westafslag** ligt kolom 258 BUITEN het bereik van auto 1's horizontale segment (140–230) — hier is er geen kruisingsrisico, ongeacht welke rij groter is.

Praktisch betekent dit: gebruik altijd de vaste standaardrijen (130/100 oost, 170/200 west) in plaats van een kleine offset tussen auto en fietser — dat voorkomt het probleem structureel.

## Kleurcodering (alleen voor uitgewerkte voorbeelden / na onthulling)

- Groen (`#16a34a`): heeft voorrang / mag rijden
- Oranje (`#d97706`): moet wachten / verleent voorrang

**Belangrijk voor de app:** dit is de antwoordsleutel, niet iets dat standaard zichtbaar moet zijn.
- **Uitgewerkt** (situatie 1, 4, 17, 18): mag direct gekleurd getoond worden als voorbeeld.
- **Oefening** (alle overige 16): toon de pijlen neutraal (één kleur, geen groen/oranje) totdat de student een antwoord geeft. Onthul de kleurcodering pas na hun poging, als feedback.

## Per-situatie data

| # | Type | Auto 1 (noord) | Fietser 1 | Auto 2 (zuid) | Fietser 2 | Fietspad | Oplossing |
|---|------|---|---|---|---|---|---|
| 1 | Uitgewerkt | rechtdoor | – | rechtdoor | – | geen | 1 + 2 |
| 2 | Oefening | linksaf→oost | – | rechtdoor | – | geen | 1 + 2 |
| 3 | Oefening | linksaf→oost | – | linksaf→west | – | geen | 1 + 2 |
| 4 | Uitgewerkt | rechtsaf→west | – | rechtdoor | – | geen | 2, dan 1 |
| 5 | Oefening | linksaf→oost | – | rechtsaf→oost | – | geen | 1, dan 2 |
| 6 | Oefening | rechtsaf→west | rechtdoor | rechtdoor | – | geen | f+2, dan 1 |
| 7 | Oefening | rechtsaf→west | linksaf→oost | rechtdoor | – | geen | 2, dan 1; f vrij |
| 8 | Oefening | rechtsaf→west | rechtdoor | linksaf→west | – | geen | 2, dan 1; f vrij |
| 9 | Oefening | rechtsaf→west | linksaf→oost | linksaf→west | – | geen | 2, dan 1; f vrij |
| 10 | Oefening | linksaf→oost | rechtdoor | – | – | geen | f, dan 1 |
| 11 | Oefening | linksaf→oost | rechtsaf→west | – | – | geen | 1, dan f |
| 12 | Oefening | linksaf→oost | linksaf→oost | – | – | geen (Z.R.P.) | 1 + f |
| 13 | Oefening | linksaf→oost (rijbaan) | linksaf→oost (fietspad) | – | – | oost+west (M.R.P.) | 1 + f |
| 14 | Oefening | rechtsaf→west | rechtsaf→west | – | – | geen (Z.R.P.) | 1 + f |
| 15 | Oefening | rechtsaf→west (rijbaan) | rechtsaf→west (fietspad) | – | – | west (M.R.P.) | 1 + f |
| 16 | Oefening | rechtsaf→zuid (van west) | – | linksaf→west | – | geen | 1 + 2 |
| 17 | Uitgewerkt | rechtsaf→west | rechtsaf→west | rechtdoor | – | geen | 2, dan 1+f |
| 18 | Uitgewerkt | linksaf→west (rijbaan) | rechtsaf→west (fietspad) | linksaf→west (rijbaan) | – | west (M.R.P.) | 2, dan 1+f |
| 19 | Oefening | rechtsaf→west | rechtdoor | rechtdoor | linksaf→west | geen | 1, dan 2; f1+f2 vrij |
| 20 | Oefening | rechtdoor | linksaf→oost (fietspad) | rechtsaf→oost | linksaf→west (fietspad) | oost+west | 1, dan 2; f1+f2 vrij |

*Situatie 16 gebruikt een horizontale naderingsweg (auto 1 komt van het westen); rect x=40, y=120, breedte 34, hoogte 20, pijl start (78,130).*

## Aanbevolen implementatie

- Eén renderer-functie die een scenario-object (zoals de tabel hierboven) omzet naar SVG, gebruikmakend van de vaste constanten hierboven — niet 20 losse hardgecodeerde diagrammen.
- Plain JavaScript + inline SVG (geen aparte library nodig), zoals besproken.
- Quiz-flow: toon situatie → (bij oefening) laat student kiezen → onthul oplossing met kleurcodering → volgende situatie.
