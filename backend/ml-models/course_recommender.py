import pandas as pd
import re
import sys
import json
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
        try:
            dataset = load_dataset("iblai/ibl-khanacademy-transcripts")
            df = dataset["train"].to_pandas()
            df["clean_text"] = df["content"].apply(lambda x: clean_text(x, self.stop_words))
            
            self.embeddings = self.model.encode(df["clean_text"].tolist(), show_progress_bar=False)
            self.data = df
            return df
        except Exception as e:
            # Fallback to sample data if dataset loading fails
            sample_data = {
                'title': [
                    'Introduction to React Development',
                    'Advanced JavaScript Concepts', 
                    'Data Science with Python',
                    'Machine Learning Fundamentals',
                    'Web Development Bootcamp'
                ],
                'content': [
                    'Learn React components, hooks, and state management for modern web development',
                    'Master closures, promises, async/await, and advanced JavaScript patterns',
                    'Explore pandas, numpy, matplotlib for data analysis and visualization',
                    'Understand supervised learning, neural networks, and model evaluation',
                    'Full stack development with HTML, CSS, JavaScript, and frameworks'
                ],
                'category': ['Web Development', 'Programming', 'Data Science', 'AI/ML', 'Web Development'],
                'level': ['Beginner', 'Advanced', 'Intermediate', 'Intermediate', 'Beginner']
            }
            df = pd.DataFrame(sample_data)
            df["clean_text"] = df["content"].apply(lambda x: clean_text(x, self.stop_words))
            self.embeddings = self.model.encode(df["clean_text"].tolist(), show_progress_bar=False)
            self.data = df
            return df

    def recommend(self, query_text, top_k=5):
        if self.data is None or self.embeddings is None:
            self.load_and_prepare()
            
        query = clean_text(query_text, self.stop_words)
        query_emb = self.model.encode([query])
        sims = cosine_similarity(query_emb, self.embeddings)[0]
        self.data["cosine_sim"] = sims
        
        recommendations = self.data.sort_values(by="cosine_sim", ascending=False).head(top_k)
        
        # Format recommendations for API response
        results = []
        for _, row in recommendations.iterrows():
            results.append({
                'title': row.get('title', 'Course Title'),
                'description': row.get('content', '')[:200] + '...' if len(row.get('content', '')) > 200 else row.get('content', ''),
                'category': row.get('category', 'General'),
                'level': row.get('level', 'Beginner'),
                'similarity_score': float(row['cosine_sim']),
                'thumbnail': 'https://via.placeholder.com/300x200',
                'instructor': {'name': 'Khan Academy'},
                'rating': 4.5 + (row['cosine_sim'] * 0.5),  # Dynamic rating based on similarity
                'studentsCount': int(1000 + (row['cosine_sim'] * 2000)),
                'duration': f"{int(5 + (row['cosine_sim'] * 10))} hours"
            })
        
        return results


# Global pipeline instance
pipeline = None

def get_recommendations(query, top_k=5):
    global pipeline
    if pipeline is None:
        pipeline = RecommendationPipeline()
        pipeline.load_and_prepare()
    
    return pipeline.recommend(query, top_k)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        query = sys.argv[1]
        top_k = int(sys.argv[2]) if len(sys.argv) > 2 else 5
        
        recommendations = get_recommendations(query, top_k)
        print(json.dumps(recommendations, indent=2))
    else:
        # Test the pipeline
        pipeline = RecommendationPipeline()
        pipeline.load_and_prepare()
        test_query = "machine learning and data science"
        results = pipeline.recommend(test_query, top_k=3)
        print("Test recommendations:")
        for _, row in results.iterrows():
            print(f"- {row.get('title', 'N/A')}: {row['cosine_sim']:.3f}")
