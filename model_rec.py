import pandas as pd
import re
from datasets import load_dataset
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


def clean_text(text, stop_words):
    text = re.sub(r'WEBVTT.*?\n', '', text, flags=re.DOTALL)
    text = re.sub(r'Kind:.*?\n', '', text)
    text = re.sub(r'Language:.*?\n', '', text)
    text = re.sub(r'\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}', '', text)
    text = re.sub(r'- \[.*?\]', '', text)
    text = re.sub(r'\n+', ' ', text).strip()
    words = text.lower().split()
    words = [w for w in words if w not in stop_words]

    return " ".join(words)

class RecommendationPipeline:
    def __init__(self):
        self.stop_words = set(ENGLISH_STOP_WORDS)
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.data = None
        self.embeddings = None

    def load_and_prepare(self):
        dataset = load_dataset("iblai/ibl-khanacademy-transcripts")
        df = dataset["train"].to_pandas()
        df["clean_text"] = df["content"].apply(lambda x: clean_text(x, self.stop_words))
    
        self.embeddings = self.model.encode(df["clean_text"].tolist(), show_progress_bar=True)
        self.data = df
        return df

    def recommend(self, query_text, top_k=10):
        query = clean_text(query_text, self.stop_words)
        query_emb = self.model.encode([query])
        sims = cosine_similarity(query_emb, self.embeddings)[0]
        self.data["cosine_sim"] = sims
        return self.data.sort_values(by="cosine_sim", ascending=False).head(top_k)

if __name__ == "__main__":
    pipeline = RecommendationPipeline()
    df = pipeline.load_and_prepare()
    query = df.iloc[10]["content"]  
    top10 = pipeline.recommend(query, top_k=10)

    print(top10[["content", "cosine_sim"]])
