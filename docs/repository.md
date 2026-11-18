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
PyTorch learning workspace: tensors, an MNIST data loader and a small fully connected network, up to a bidirectional LSTM that predicts the next word, trained on text corpora preprocessed with NLTK. Training plots and saved models included.
```

**Strona (Website):** puste (skrypty, nie ma strony).

**Tagi (Topics):**

```text
python pytorch neural-network deep-learning machine-learning mnist lstm rnn nlp next-word-prediction nltk torchvision
```

Z GitHub CLI (`gh`) to samo jedną komendą (stare tagi `opencv`, `ocr`, `tesseract`, `id-verification`, `svm` usuń ręcznie lub `--remove-topic`):

```bash
gh repo edit DamTchorzewski/neural-network --description "PyTorch learning workspace: tensors, an MNIST data loader and a small fully connected network, up to a bidirectional LSTM that predicts the next word, trained on text corpora preprocessed with NLTK. Training plots and saved models included." --add-topic python,pytorch,neural-network,deep-learning,machine-learning,mnist,lstm,rnn,nlp,next-word-prediction,nltk,torchvision
```

## Wielkość repozytorium

W repozytorium są wygenerowane pliki: pary słów (`pyTorch/advancedTools/wordPairs/`, ok. 90 MB), cztery wytrenowane modele (`pyTorch/path/*.pth`, ok. 100 MB) i `__pycache__`. `.gitignore` ignoruje je od teraz (`*.pth`, `__pycache__/`), ale pliki już śledzone zostają w drzewie i historii. Usunięcie ich (z przepisaniem historii albo Git LFS) to decyzja właściciela.

## Ustawienia do włączenia

| Gdzie (GitHub)                                          | Co ustawić                              |
| ------------------------------------------------------- | --------------------------------------- |
| Settings → General → Default branch                     | `main` (już jest)                       |
| Settings → Branches (albo Rulesets) → `main`, `develop` | zablokuj force push i usuwanie gałęzi   |
