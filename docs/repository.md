# Repozytorium: opis i tagi

Rzeczy, które ustawia się na GitHubie ręcznie (nie da się ich zapisać w plikach repozytorium). Przegląd projektu: [README](../README.md). Nazwa repozytorium zgodna z `reops/standards/repo-names.md`.

## Zmiana nazwy

To repozytorium to dawne `Id-Verification-And-Neural-Network`, rozdzielone na dwa. Zmień jego nazwę na GitHubie na `neural-network` (Settings → General → Repository name); GitHub przekieruje stary adres. Lokalnie folder już nazywa się `neural-network`, wystarczy:

```bash
git remote set-url origin https://github.com/DamTchorzewski/neural-network.git
```

Skrypty OpenCV przeszły do nowego repozytorium `id-verification`, ćwiczenia `simpleTools` do `tools/projects/python-exercises`. Starsza historia tych plików zostaje tutaj.

## Opis i tagi (About)

GitHub: strona repozytorium → ⚙ obok „About” → pola poniżej. Opis ma limit 350 znaków, tagi (topics) pisze się małymi literami z myślnikami, najwyżej 20.

**Opis (Description):**

```text
Next-word prediction in PyTorch: a bidirectional LSTM that predicts the word following a sequence of 5 or 10 words, trained on text corpora preprocessed with NLTK, plus the warm-ups before it (tensors, a small MNIST network). Training plots and four trained models included.
```

**Strona (Website):** puste (skrypty, nie ma strony).

**Tagi (Topics):**

```text
python pytorch neural-network deep-learning machine-learning mnist lstm rnn nlp next-word-prediction nltk torchvision
```

Z GitHub CLI (`gh`) to samo jedną komendą (stare tagi `opencv`, `ocr`, `tesseract`, `id-verification`, `svm` usuń ręcznie lub `--remove-topic`):

```bash
gh repo edit DamTchorzewski/neural-network --description "Next-word prediction in PyTorch: a bidirectional LSTM that predicts the word following a sequence of 5 or 10 words, trained on text corpora preprocessed with NLTK, plus the warm-ups before it (tensors, a small MNIST network). Training plots and four trained models included." --add-topic python,pytorch,neural-network,deep-learning,machine-learning,mnist,lstm,rnn,nlp,next-word-prediction,nltk,torchvision
```

## Wielkość repozytorium

W repozytorium są wygenerowane pliki: pary słów (`pyTorch/advancedTools/wordPairs/`, ok. 90 MB), cztery wytrenowane modele (`pyTorch/path/*.pth`, ok. 100 MB) i `__pycache__`. `.gitignore` ignoruje je od teraz (`*.pth`, `__pycache__/`), ale pliki już śledzone zostają w drzewie i historii. Usunięcie ich (z przepisaniem historii albo Git LFS) to decyzja właściciela.

## Ustawienia do włączenia

| Gdzie (GitHub)                                          | Co ustawić                              |
| ------------------------------------------------------- | --------------------------------------- |
| Settings → General → Default branch                     | `main` (już jest)                       |
| Settings → Branches (albo Rulesets) → `main`, `develop` | zablokuj force push i usuwanie gałęzi   |
