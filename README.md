# Id-Verification-And-Neural-Network

## About

**Id-Verification-And-Neural-Network** is a learning workspace for computer vision and neural networks in Python:
a basic identity-document check with OpenCV and OCR, an SVM image classifier, and a set of PyTorch exercises that
grow from tensors to a recurrent network that predicts the next word of a sentence.

- **ID verification (`openCv/verifyID.py`).** Pre-processes a photo of a document (grayscale, threshold,
  morphological opening), reads the text with Tesseract OCR and checks that the declared country of origin appears
  in it: it prints `ID OK` or `Invalid ID`.
- **Image operations (`openCv/imageTransform.py`).** Load, grayscale, crop, rotate and save an image, Canny edge
  detection and Haar-cascade face detection (faces are cut out to `face_<n>.jpg`).
- **SVM classifier (`openCv/svmModel.py`).** Trains an `SVC` on the GTSRB traffic-sign data set (43 classes,
  32 × 32 histogram-equalised crops) and plots per-class precision, recall and F1.
- **Neural network (`pyTorch/neuralNetwork.py`).** A 784-64-10 network on MNIST with cross-entropy loss, SGD,
  early stopping, plots of loss and accuracy per epoch, and saving and loading of the weights.
- **Next-word prediction (`pyTorch/advancedTools/`).** A two-layer bidirectional LSTM with an embedding and layer
  normalisation, trained on word sequences of length 5 or 10 built from text files (Sherlock Holmes stories, a
  sentence collection, an emotion data set) after tokenising and lemmatising with NLTK.
- **Warm-ups.** PyTorch tensor basics and a data loader for MNIST (`pyTorch/`), and eight small Python exercises
  in `simpleTools/` (bubble sort, FizzBuzz, unit converter, password generator...).

> **Status:** a personal learning project, not a production verification system. The ID check is a text match, not
> a document-authenticity test; no accuracy figure is claimed here. The `data/` folder (GTSRB, MNIST) is not in the
> repository.

## Tech stack

|          |                                                                                                       |
| -------- | ----------------------------------------------------------------------------------------------------- |
| Stack    | Python 3 scripts, run one at a time (no package, no entry point beyond the scripts themselves)         |
| Vision   | OpenCV (`cv2`), Tesseract OCR through `pytesseract`, scikit-learn (`SVC`, metrics), joblib             |
| Deep learning | PyTorch and torchvision (MNIST, LSTM), matplotlib for the plots                                  |
| Language | NLTK (tokenising, lemmatising), tqdm                                                                  |
| Data     | GTSRB and MNIST downloaded to `data/` (git-ignored); text corpora and word-pair files in `pyTorch/advancedTools/` |
| Tests    | none                                                                                                  |

Comments are a mix of English and Polish; the README, commits and branches are in English.

## Screenshots

Results saved by the scripts are in the repository: the face detection and the grayscale, crop and
rotate examples in `openCv/path/`, the SVM metrics in `openCv/path/metric.png` and `precision.png`, and the training curves of the
networks in `pyTorch/path/`.

| Image                                                           | Shows                                           |
| --------------------------------------------------------------- | ----------------------------------------------- |
| [openCv/path/detection_image.jpg](openCv/path/detection_image.jpg)   | faces found by the Haar cascade                 |
| [openCv/path/metric.png](openCv/path/metric.png)                     | class-wise metrics of the SVM                   |
| [pyTorch/path/Iterations.png](pyTorch/path/Iterations.png)           | training of the MNIST network                   |
| [pyTorch/path/training_plots_sherlock_holm_stories_plain.txt_10.png](pyTorch/path/training_plots_sherlock_holm_stories_plain.txt_10.png) | training of the next-word model |

## Quick start

```bash
git clone https://github.com/DamTchorzewski/Id-Verification-And-Neural-Network.git
cd Id-Verification-And-Neural-Network
pip install opencv-python pytesseract numpy pandas scikit-learn joblib matplotlib torch torchvision nltk tqdm
python openCv/imageTransform.py     # image operations on openCv/path/image.jpg
python openCv/verifyID.py           # needs Tesseract; the path is set in the script
python pyTorch/neuralNetwork.py     # downloads MNIST to ./data
```

Run every script from the **repository root**: the paths inside (`./openCv/path/`, `./data/`) are relative to it.
`openCv/verifyID.py` expects Tesseract at `C:\Program Files\Tesseract-OCR\tesseract.exe`. The next-word model is
started from `pyTorch/advancedTools/`; it chooses its text with `model_file_name` in `predictionModel.py`, and the
sample prediction code uses CUDA. Requirements: Python 3, a GPU for the next-word demo.

## Scripts

| Command                                           | What it does                                                    |
| ------------------------------------------------- | --------------------------------------------------------------- |
| `python main.py`                                  | prints the project banner                                       |
| `python openCv/verifyID.py`                       | OCR of a document photo and the country check                   |
| `python openCv/imageTransform.py`                 | grayscale, crop, rotate, edges and face detection               |
| `python openCv/svmModel.py`                       | train and evaluate the traffic-sign SVM (needs GTSRB in `data/`) |
| `python pyTorch/tensorBasics.py`                  | tensor addition, multiplication, transpose                      |
| `python pyTorch/dataLoaderMnist.py`               | MNIST data loader with normalisation                            |
| `python pyTorch/neuralNetwork.py`                 | train, plot and save the MNIST network                          |
| `python predictionModel.py` (in `pyTorch/advancedTools/`) | prepare the text, train and test the next-word model    |
| `python simpleTools/<name>.py`                    | one of the eight exercises                                      |

## Configuration

None: no variables or keys. The settings sit at the top of the scripts: the image path and the declared country in
`verifyID.py`, the Tesseract path, `model_file_name`, `embedding_dim`, `hidden_size`, `num_epochs` and
`learning_rate` in `predictionModel.py`.

## Structure

```
main.py                         the project banner
openCv/                         verifyID.py ★, imageTransform.py, svmModel.py; path/ holds the sample image and results
pyTorch/                        tensorBasics.py, dataLoaderMnist.py, neuralNetwork.py ★; path/ holds plots and saved models
pyTorch/advancedTools/          next-word model: predictionModel.py ★, rnnModel.py, trainedModel.py, wordPreprocessing.py
pyTorch/advancedTools/base/     the text corpora
pyTorch/advancedTools/wordPairs/  generated vocabularies and word-pair files
simpleTools/                    eight Python exercises
data/                           datasets, git-ignored, downloaded on first run
docs/                           documentation
```

## Branches and workflows

Shared standards from `reops/standards`: `main` ≤ `develop` ≤ a working branch `<type>/<topic>`, fast-forward
merges, Conventional Commits in English. The repository has no workflows.

**Departures from the standards (and why):**

- **No banner or showcase:** scripts with no site or window of their own; the results are the saved plots.
- **Generated files are committed:** the word-pair files (about 90 MB), four trained models (`*.pth`, about 100 MB)
  and `__pycache__` are tracked. The `.gitignore` entry `.pth` matches a file literally named that, not `*.pth`.
  Removing them from the tree and rewriting history is left to the owner.
- **No dependency file, tests or CI:** a learning workspace.

## Documentation

| Document                                   | Covers                          |
| ------------------------------------------ | ------------------------------- |
| [docs/repository.md](docs/repository.md)   | GitHub description and topics   |

---

Author: [Damian Tchorzewski](https://github.com/DamTchorzewski)
