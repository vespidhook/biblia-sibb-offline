# Splash com fachada

Fundo: `sibb-splash-fachada.png`, edição com imagegen integrado da foto diurna enviada pelo usuário. A edição por IA removeu barras e sobreposições; não é uma reprodução pixel a pixel da foto original.

A marca `logo-branco.png` é sobreposta sem alteração por `src/components/church-splash.tsx`. A tela nativa mostra primeiro a marca sobre azul; assim que as imagens estão prontas, aparece a composição de fachada e logo, seguida de fade para a navegação. Os arquivos são locais e funcionam offline.

## Prompt

Use case: precise-object-edit. Prepare a portrait 9:16 mobile splash BACKGROUND from the USER'S uploaded daytime street photo of Segunda Igreja Batista em Bom Sucesso (the screenshot with black letterbox bars, parked cars and overhead wires). The other image, a polished sunset facade, is NOT the target: use the original daytime street photo. Preserve the actual church architecture, facade lettering, cross, neighboring buildings, street, cars, overhead wires and camera viewpoint. Remove screenshot black bars and the overlaid handwritten caption and CapCut mark; reconstruct only the small areas they covered. Fill portrait frame with the photograph, no borders. Apply a restrained deep navy translucent color grade, darker toward bottom third, to support a separate white logo overlay in the app. Keep the church visibly recognizable and photographic. No logo or new text in output, no invented architecture, no sunset, no illustration. Output just the edited photograph.
