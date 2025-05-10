# Vector generation module

from sentence_transformers import SentenceTransformer
import numpy as np
from diskcache import Cache

class EmbeddingService:
    def __init__(self):
        # Use larger model
        self.model = SentenceTransformer('all-mpnet-base-v2')  # 768 dimensions
        self.cache = Cache('data/embedding_cache')

    def generate(self, text: str) -> np.ndarray:
        # Check if the embedding is cached
        cached_embedding = self.cache.get(text)
        if cached_embedding is not None:
            return cached_embedding
        
        # Compute the embedding
        embedding = self.model.encode(text)
        normalized_embedding = embedding / np.linalg.norm(embedding)  # Normalize for cosine similarity
        
        # Store the result in cache
        self.cache[text] = normalized_embedding
        return normalized_embedding
