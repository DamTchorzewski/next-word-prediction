# Repozytorium: opis i tagi

Rzeczy, które ustawia się na GitHubie ręcznie (nie da się ich zapisać w plikach repozytorium). Przegląd projektu: [README](../README.md). Nazwa repozytorium zgodna z `reops/standards/repo-names.md`.

## Zmiana nazwy

To repozytorium to dawne `Id-Verification-And-Neural-Network` (rozdzielone na dwa), potem `neural-network`. Nazwa `next-word-prediction` mówi, czym jest projekt (standard: `reops/standards/repo-names.md`). Zmień nazwę na GitHubie (Settings → General → Repository name); GitHub przekieruje stare adresy. Lokalnie folder też nazywa się `next-word-prediction`, wystarczy:

```bash
git remote set-url origin https://github.com/DamTchorzewski/next-word-prediction.git
```

Stare tagi `neural-network`, `rnn`, `torchvision` (i te po poprzednim repozytorium: `opencv`, `ocr`, `tesseract`, `id-verification`, `svm`) usuń ręcznie w About albo komendą `gh repo edit ... --remove-topic`.

Skrypty OpenCV przeszły do repozytorium `id-verification`, ćwiczenia `simpleTools` do `tools/projects/python-exercises`. Starsza historia tych plików zostaje tutaj.

## Opis i tagi (About)

GitHub: strona repozytorium → ⚙ obok „About” → pola poniżej. Opis ma limit 350 znaków, tagi (topics) pisze się małymi literami z myślnikami, najwyżej 20.

**Opis (Description):**

```text
Next-word prediction with a bidirectional LSTM in PyTorch, exported to ONNX (int8 weights) and run live in the browser: a Vue 3 + ONNX Runtime Web demo on GitHub Pages with top-k suggestions, sentence autocomplete and the model's input window. Three models (stories, sentences, emotions), NLTK preprocessing, training plots.
```

**Strona (Website):** `https://damtchorzewski.github.io/next-word-prediction/` (demo na GitHub Pages; w `gh` flaga `--homepage`).

**Tagi (Topics):**

```text
next-word-prediction language-model lstm pytorch onnx onnxruntime-web vue typescript nlp text-prediction autocomplete deep-learning machine-learning nltk python github-pages
```

Z GitHub CLI (`gh`) to samo jedną komendą (stare tagi `opencv`, `ocr`, `tesseract`, `id-verification`, `svm` usuń ręcznie lub `--remove-topic`):

```bash
gh repo edit DamTchorzewski/next-word-prediction --description "Next-word prediction with a bidirectional LSTM in PyTorch, exported to ONNX (int8 weights) and run live in the browser: a Vue 3 + ONNX Runtime Web demo on GitHub Pages with top-k suggestions, sentence autocomplete and the model's input window. Three models (stories, sentences, emotions), NLTK preprocessing, training plots." --homepage https://damtchorzewski.github.io/next-word-prediction/ --add-topic next-word-prediction,language-model,lstm,pytorch,onnx,onnxruntime-web,vue,typescript,nlp,text-prediction,autocomplete,deep-learning,machine-learning,nltk,python,github-pages --remove-topic mnist
```

## Wielkość repozytorium

W repozytorium są wygenerowane pliki: pary słów (`pyTorch/advancedTools/wordPairs/`, ok. 90 MB), cztery wytrenowane modele (`pyTorch/path/*.pth`, ok. 100 MB) i `__pycache__`. `.gitignore` ignoruje je od teraz (`*.pth`, `__pycache__/`), ale pliki już śledzone zostają w drzewie i historii. Usunięcie ich (z przepisaniem historii albo Git LFS) to decyzja właściciela.

## Ustawienia do włączenia

| Gdzie (GitHub)                                          | Co ustawić                               |
| ------------------------------------------------------- | ---------------------------------------- |
| Settings → General → Default branch                     | `main` (już jest)                        |
| Settings → Branches (albo Rulesets) → `main`, `develop` | zablokuj force push i usuwanie gałęzi    |
| Settings → Pages → Source                               | **GitHub Actions** (demo z `deploy.yml`) |
