# Repozytorium: opis i tagi

Rzeczy, które ustawia się na GitHubie ręcznie (nie da się ich zapisać w plikach repozytorium). Przegląd projektu: [README](../README.md).

## Opis i tagi (About)

GitHub: strona repozytorium → ⚙ obok „About” → pola poniżej. Opis ma limit 350 znaków, tagi (topics) pisze się małymi literami z myślnikami, najwyżej 20.

**Opis (Description):**

```text
Python workspace for computer vision and neural networks: ID-document verification with OpenCV and Tesseract OCR, an SVM traffic-sign classifier, face detection, and PyTorch models from tensors and an MNIST network to a bidirectional LSTM that predicts the next word.
```

**Strona (Website):** puste (skrypty, nie ma strony).

**Tagi (Topics):**

```text
python opencv pytorch computer-vision neural-network deep-learning machine-learning ocr tesseract id-verification svm lstm nlp mnist
```

Z GitHub CLI (`gh`) to samo jedną komendą:

```bash
gh repo edit DamTchorzewski/Id-Verification-And-Neural-Network --description "Python workspace for computer vision and neural networks: ID-document verification with OpenCV and Tesseract OCR, an SVM traffic-sign classifier, face detection, and PyTorch models from tensors and an MNIST network to a bidirectional LSTM that predicts the next word." --add-topic python,opencv,pytorch,computer-vision,neural-network,deep-learning,machine-learning,ocr,tesseract,id-verification,svm,lstm,nlp,mnist
```

## Wielkość repozytorium

W repozytorium są wygenerowane pliki: pary słów (`pyTorch/advancedTools/wordPairs/`, ok. 90 MB), cztery wytrenowane modele (`pyTorch/path/*.pth`, ok. 100 MB) i `__pycache__`. Wpis `.pth` w `.gitignore` dopasowuje plik o dokładnie takiej nazwie, a nie `*.pth`. Usunięcie ich z repozytorium (z przepisaniem historii albo Git LFS) to decyzja właściciela; README opisuje to w sekcji **Departures**.

## Ustawienia do włączenia

| Gdzie (GitHub)                                          | Co ustawić                              |
| ------------------------------------------------------- | --------------------------------------- |
| Settings → General → Default branch                     | `main` (już jest)                       |
| Settings → Branches (albo Rulesets) → `main`, `develop` | zablokuj force push i usuwanie gałęzi   |
