<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/images/banner-dark.png">
    <img src="docs/images/banner-light.png" alt="neural-network: PyTorch learning workspace" width="100%">
  </picture>
</p>

<p align="center">
  <img src="docs/images/showcase.jpg" alt="Training plots of the MNIST network and of the next-word LSTM" width="100%">
</p>

## About

**neural-network** is a learning workspace for neural networks in PyTorch: from tensors and a data loader, through a
small fully connected network on MNIST, to a recurrent network that predicts the next word of a sentence. It was
split off from the former `Id-Verification-And-Neural-Network` repository (this one is that repository, renamed); the
OpenCV scripts now live in `id-verification` and the small Python exercises in `tools/projects/python-exercises`.

- **Tensor basics (`tensorBasics.py`).** Creating tensors, addition, element-wise multiplication, transpose.
- **Data loader (`dataLoaderMnist.py`).** MNIST with a `DataLoader`, normalisation (mean 0.1307, std 0.3081),
  batches of 64.
- **MNIST network (`neuralNetwork.py`).** A 784-64-10 network (`SimpleNet`) with cross-entropy loss, SGD with
  momentum and weight decay, early stopping (`patience`), plots of loss and accuracy per epoch, and saving and
  loading of the weights.
- **Next-word prediction (`advancedTools/`).** A two-layer bidirectional LSTM with an embedding and layer
  normalisation (`ComplexRNN`), trained on word sequences of length 5 or 10. The text is tokenised and lemmatised
  with NLTK (`wordPreprocessing.py`) and read from `advancedTools/base/` (Sherlock Holmes stories, a sentence
  collection, an emotion data set). 256-dimensional embeddings and hidden state, 40 epochs, learning rate 0.0001 by
  default.

> **Status:** a personal learning project. No accuracy figure is claimed here. The `data/` folder (MNIST) is
> downloaded on first run and is not in the repository; the sample prediction code uses CUDA.

## Tech stack

|               |                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------- |
| Stack         | Python 3 scripts, run one at a time (no package, no entry point beyond the scripts)               |
| Deep learning | PyTorch and torchvision, matplotlib for the plots                                                 |
| Language      | NLTK (tokenising, lemmatising), tqdm, scikit-learn (train / test split)                           |
| Data          | MNIST downloaded to `data/` (git-ignored); text corpora in `pyTorch/advancedTools/base/`          |
| Tests         | none                                                                                              |

Comments are a mix of English and Polish; the README, commits and branches are in English.

## Screenshots

The scripts have no interface of their own; these are the training plots they saved in `pyTorch/path/`, drawn in window
frames by `tools/readme-images`. The big picture at the top shows the fully connected network on MNIST after 50 epochs
and the next-word LSTM trained on the stories; below, the same network after 200 epochs and the model trained on sentences.

<p align="center">
  <img src="docs/images/plots.jpg" alt="The MNIST network after 200 epochs and the next-word model trained on sentences" width="100%">
</p>

All the saved plots are in `pyTorch/path/`: `epoch5.png`, `epoch20.png`, `epoch50.png` and `epoch200.png` (the MNIST
network), and `training_plots_<text>_<length>.png` (the next-word model, one per text).

## Quick start

```bash
git clone https://github.com/DamTchorzewski/neural-network.git
cd neural-network
pip install torch torchvision matplotlib scikit-learn nltk tqdm
python pyTorch/tensorBasics.py
python pyTorch/neuralNetwork.py     # downloads MNIST to ./data
cd pyTorch/advancedTools && python predictionModel.py
```

Run the first scripts from the **repository root** (`./data/` is relative to it). The next-word model is started
from `pyTorch/advancedTools/`; it chooses its text with `model_file_name` in `predictionModel.py` (a file name from
`base/`), and the sample prediction code needs a CUDA GPU. Requirements: Python 3.

## Scripts

| Command                                                  | What it does                                              |
| -------------------------------------------------------- | --------------------------------------------------------- |
| `python pyTorch/tensorBasics.py`                         | tensor addition, multiplication, transpose                |
| `python pyTorch/dataLoaderMnist.py`                      | MNIST data loader with normalisation                      |
| `python pyTorch/neuralNetwork.py`                        | train, plot and save the MNIST network                    |
| `python predictionModel.py` (in `pyTorch/advancedTools/`) | prepare the text, train and test the next-word model     |

## Configuration

None: no variables or keys. Settings sit at the top of the scripts: `model_file_name`, `embedding_dim`,
`hidden_size`, `num_epochs` and `learning_rate` in `predictionModel.py`; `epochs` and `patience` in
`neuralNetwork.py`.

## Structure

```
pyTorch/tensorBasics.py, dataLoaderMnist.py     warm-ups
pyTorch/neuralNetwork.py                        ★ the MNIST network
pyTorch/advancedTools/predictionModel.py        ★ next-word model: text, training, prediction
pyTorch/advancedTools/rnnModel.py               the bidirectional LSTM
pyTorch/advancedTools/trainedModel.py           prediction with a trained model
pyTorch/advancedTools/wordPreprocessing.py      tokenising, lemmatising, word pairs
pyTorch/advancedTools/base/                     the text corpora
pyTorch/advancedTools/wordPairs/                generated vocabularies and word-pair files
pyTorch/path/                                   plots and saved models
data/                                           MNIST, git-ignored, downloaded on first run
docs/                                           documentation; docs/images/ holds the README images (generated)
```

## Branches and workflows

Shared standards from `reops/standards`: `main` ≤ `develop` ≤ a working branch `<type>/<topic>`, fast-forward
merges, Conventional Commits in English. The repository has no workflows.

**Departures from the standards (and why):**

- **No "Open site" button, no phone strip:** scripts with no site; the images are the saved training plots in window
  frames, and the logo is a wordmark (the project has none).
- **Generated files are committed:** the word-pair files (about 90 MB), four trained models (`*.pth`, about 100 MB)
  and `__pycache__` are tracked. `.gitignore` now ignores them, but files already tracked stay in the tree and in the
  history until the owner removes them (and rewrites history or moves the models to Git LFS).
- **No dependency file, tests or CI:** a learning workspace.

## Documentation

| Document                                   | Covers                                              |
| ------------------------------------------ | --------------------------------------------------- |
| [docs/repository.md](docs/repository.md)   | GitHub description and topics, the rename           |

The README images (`docs/images/`) are regenerated with `tools/readme-images` (profile `neural-network`) from the plots
in `pyTorch/path/`; the working shots go to `.scratch/`.

---

<p align="center"><a href="https://damreboot.pl"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/damreboot/company-dark.svg"><img src="docs/images/damreboot/company-light.svg" alt="damreboot.pl: company website" height="36"></picture></a><a href="https://www.linkedin.com/in/damian-tchorzewski-3b2388275/"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/damreboot/linkedin-dark.svg"><img src="docs/images/damreboot/linkedin-light.svg" alt="LinkedIn: let's connect" height="36"></picture></a><a href="mailto:damianchabracki@gmail.com"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/damreboot/email-dark.svg"><img src="docs/images/damreboot/email-light.svg" alt="E-mail: write to me" height="36"></picture></a></p>

<p align="center">
  <picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/damreboot/engineered-dark.svg"><img src="docs/images/damreboot/engineered-light.svg" alt="" height="33" align="middle"></picture> Engineered by <b>Damian Chabracki</b> (DamReboot IT)
</p>
