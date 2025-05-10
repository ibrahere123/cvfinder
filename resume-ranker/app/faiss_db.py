# app/faiss_db.py
import faiss
import numpy as np
import os
import pdfplumber
from docx import Document
from typing import Dict, List

class FaissIndex:
    def __init__(self, dim=768):
        self.dim = dim
        self.index = faiss.IndexFlatL2(dim)
        self.file_map: Dict[int, str] = {}
        self.text_cache: Dict[int, str] = {}
        self.counter = 0

    def add(self, embedding: np.ndarray, file_path: str):
        """Add resume embedding to index"""
        if embedding.shape[0] != self.dim:
            raise ValueError(f"Embedding dimension {embedding.shape[0]} ≠ index dimension {self.dim}")
            
        self.index.add(embedding.reshape(1, -1))
        self.file_map[self.counter] = file_path
        self.counter += 1

    def search(self, query_embedding: np.ndarray, query_text: str, k: int) -> List[Dict]:
        """Enhanced hybrid search with keyword pre-filter and weighted scoring"""
        # Validate dimensions
        if query_embedding.shape[1] != self.dim:
            raise ValueError(f"Query dimension {query_embedding.shape[0]} ≠ index dimension {self.dim}")

        # Get initial semantic matches
        distances, indices = self.index.search(query_embedding.reshape(1, -1), k*10)
        
        # Extract keywords and filter candidates
        query_keywords = set(query_text.lower().split())
        filtered = self._pre_filter_candidates(indices[0], distances[0], query_keywords)
        
        # Calculate hybrid scores
        return self._calculate_hybrid_scores(filtered, query_keywords, k)

    def _pre_filter_candidates(self, indices: np.ndarray, distances: np.ndarray, query_keywords: set) -> List[tuple]:
        """Filter candidates with at least one keyword match, but ensure at least k candidates"""
        filtered = []
        for idx, score in zip(indices, distances):
            if idx not in self.file_map:
                continue
                
            text = self._get_text(idx).lower()
            if any(kw in text for kw in query_keywords):
                filtered.append((idx, score))
        # If filtered less than k, return top k from indices without filtering
        if len(filtered) < len(indices):
            filtered = [(idx, dist) for idx, dist in zip(indices, distances) if idx in self.file_map]
        return filtered

    def _calculate_hybrid_scores(self, candidates: List[tuple], query_keywords: set, k: int) -> List[Dict]:
        """Calculate final scores with 70% vector + 30% keyword weighting"""
        boosted = []
        for idx, vector_score in candidates:
            text = self._get_text(idx)
            keyword_score = self._calculate_keyword_density(text, query_keywords)
            final_score = (0.7 * (1 - vector_score)) + (0.3 * keyword_score)
            
            boosted.append({
                "file": self.file_map[idx],
                "score": final_score,
                "vector_score": 1 - vector_score,
                "keyword_score": keyword_score
            })
            
        return sorted(boosted, key=lambda x: x["score"], reverse=True)[:k]

    def _get_text(self, idx: int) -> str:
        """Cache-aware text extraction with error handling"""
        if idx not in self.text_cache:
            file_path = self.file_map.get(idx, "")
            if not file_path or not os.path.exists(file_path):
                return ""
            
            try:
                if file_path.endswith('.pdf'):
                    with pdfplumber.open(file_path) as pdf:
                        self.text_cache[idx] = "\n".join(
                            [page.extract_text(x_tolerance=2) for page in pdf.pages]
                        )
                elif file_path.endswith('.docx'):
                    doc = Document(file_path)
                    self.text_cache[idx] = "\n".join([p.text for p in doc.paragraphs])
                else:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        self.text_cache[idx] = f.read()
            except Exception as e:
                print(f"Error reading {file_path}: {str(e)}")
                return ""
                
        return self.text_cache[idx]

    def _calculate_keyword_density(self, text: str, keywords: set) -> float:
        """Calculate normalized keyword density score (0-1)"""
        text_lower = text.lower()
        total = sum(text_lower.count(kw) for kw in keywords)
        return min(total / 10, 1.0)  # Cap at 10 matches

    def save(self, path='data/faiss_index/faiss_index'):
        """Persist index to disk"""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        faiss.write_index(self.index, path + '.index')
        np.save(path + '_map.npy', self.file_map)

    def load(self, path='data/faiss_index/faiss_index'):
        """Load index from disk"""
        self.index = faiss.read_index(path + '.index')
        self.file_map = np.load(path + '_map.npy', allow_pickle=True).item()
        self.counter = len(self.file_map)