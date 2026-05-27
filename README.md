# Contract Reviewer

An AI-powered contract review application that leverages Legal-BERT to analyze and evaluate legal documents. Built with a FastAPI backend, a React (Vite) frontend, and supported by a suite of NLP experiments for model fine-tuning and evaluation.

---

## Project Structure

```
.
├── backend/                  # FastAPI backend service
│   ├── app/
│   │   ├── agent/            # LLM logic for contract analysis
│   │   ├── models/           # Data models and schemas
│   │   ├── routers/          # API route definitions
│   │   ├── uploads/          # Uploaded contract files
│   │   ├── __init__.py
│   │   └── main.py           # Application entry point
│   └── requirements.txt      # Python dependencies
│
├── data/                     # Datasets for training and evaluation
│
├── experiments/              # Model experimentation and notebooks
│   ├── legal-bert-results/   # Fine-tuning results and metrics
│   ├── 1.1.0/                # Model version artifacts
│   ├── clean_data.ipynb      # Data cleaning and preprocessing
│   ├── Condition_A.ipynb     # Experiment condition A
│   ├── Condition_B.ipynb     # Experiment condition B
│   ├── Condition_C_*.ipynb   # Experiment condition C (GPU fine-tuning)
│   ├── distribution.ipynb    # Data distribution analysis
│   └── evaluation.ipynb      # Model evaluation and benchmarks
│
├── frontend/contract-reviewer/  # React + Vite frontend
│   ├── public/               # Static assets
│   ├── src/                  # Application source code
│   ├── components.json       # shadcn/ui configuration
│   ├── package.json          # Node.js dependencies
│   ├── vite.config.ts        # Vite configuration
│   └── tsconfig.json         # TypeScript configuration
│
├── .env                      # Environment variables
└── README.md
```

## Tech Stack

**Backend:** Python, FastAPI  
**Frontend:** React, TypeScript, Vite, shadcn/ui  
**ML/NLP:** Legal-BERT, Jupyter Notebooks  
**Infra:** GPU-accelerated fine-tuning support

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- (Optional) CUDA-compatible GPU for model fine-tuning, Other wise Open both Condition_C notebooks
 in google colab and use T4 GPU.


### 1. Backend
Open one terminal window and input the following commands

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Frontend
Open another terminal window and input the following commands
```bash
cd frontend/contract-reviewer
npm install
npm run dev
```

Both terminal windows must be open and running the appropriate commands

When you want to end the session, press CRTL + C at the same time in both terminals

### Logging into frontend
The email is: hugo@email.com, raf.thalos@gmail.com
The password is: hugo, DogCastle123!

Any questions email: S5633681@bournemouth.ac.uk

### Environment Variables

For backend ENV variables, open .env and fill out with your API keys or request them from S5633681 Raf Christensen
For frontend ENV variables, open frontend/contract-reviewer/.env.local fill out with your API keys or request them from S5633681 Raf Christensen


## Experiments

The `experiments/` directory contains Jupyter notebooks documenting the model development lifecycle:

| Notebook | Purpose |
|---|---|
| `clean_data.ipynb` | Data preprocessing and cleaning pipeline |
| `Condition_A.ipynb` | Baseline experiment setup |
| `Condition_B.ipynb` | Alternate training configuration |
| `Condition_C_Finetune_GPUONLY.ipynb` | Legal-BERT fine-tuning |
| `Condition_C_run_GPU_ONLY.ipynb` | Legal-BERT test run |
| `distribution.ipynb` | Dataset distribution analysis |
| `evaluation.ipynb` | Model performance evaluation |

Results and model artifacts are stored under `experiments/legal-bert-results/`.

## License

This project is proprietary. All rights reserved.