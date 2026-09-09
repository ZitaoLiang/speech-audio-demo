# NanoSpeech audio demo

Static, anonymous demo site for GitHub Pages. The public page intentionally omits authors,
affiliations, contact details, personal links, and the non-anonymized paper PDF.

## Audio manifest

The page reads `manifest.json` and loads each file from its relative path under `audio/`.
It presents the same five utterances for every model, grouped into the proposed-model
ablation, EfficientSpeech series, and other acoustic models.

Before publishing, verify WAV metadata and filenames contain no author, institution, machine,
home-directory, or account identifiers.
