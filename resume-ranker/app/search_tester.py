# search_tester.py
import os
import traceback
import numpy as np
import warnings # Keep warnings import if used elsewhere or potentially needed
from typing import List, Dict, Optional, Union # Keep typing imports

# Make sure these imports point correctly to your project structure
from .embeddings import EmbeddingService
from .faiss_db import FaissIndex
# Import the NEW parser (spaCy/pdfminer based)
from .parser import ResumeParser
from .queryexpander import QueryExpander


class SearchTester:
    def __init__(self):
        print("Initializing services (Embedder, FaissIndex, Parser, Expander)...")
        self.embedder = EmbeddingService()
        self.faiss_index = FaissIndex()
        # Ensure skills_yml_path is passed if needed by your parser's __init__
        self.parser = ResumeParser() # Add skills_yml_path='path/to/skills.yml' if required
        self.expander = QueryExpander()
        self.index_dim = 0 # Initialize dimension

        try:
            self.faiss_index.load()
            # Attempt to get dimension attribute safely
            if hasattr(self.faiss_index, 'index') and self.faiss_index.index is not None:
                 self.index_dim = self.faiss_index.index.d
            elif hasattr(self.faiss_index, 'dim'): # Fallback to 'dim' attribute if it exists
                 self.index_dim = self.faiss_index.dim
            else:
                 print("⚠️ Warning: Could not determine FAISS index dimension automatically.")
                 sample_emb = self.embedder.generate("test")
                 if sample_emb is not None and hasattr(sample_emb, 'shape'):
                     self.index_dim = sample_emb.shape[-1]
                     print(f"   Using dimension from sample embedding: {self.index_dim}")
                 else:
                     self.index_dim = 768 # Fallback default
                     print(f"   Assuming default dimension: {self.index_dim}. PLEASE VERIFY.")

            print(f"✅ Loaded {len(self.faiss_index.file_map)} resumes from index (Detected Dimension: {self.index_dim}).")
            if self.index_dim <= 1:
                print(f"⚠️ Warning: Loaded FAISS index dimension ({self.index_dim}) seems unexpectedly low.")

        except Exception as e:
            print(f"❌ Error loading FAISS index or determining dimension: {str(e)}")
            traceback.print_exc()
            exit(1)

    # --- Keep the fixed _format_skills function ---
    def _format_skills(self, skills_data: Optional[Union[list, dict]]) -> str:
        """Formats skills list (or legacy dict) into a readable string."""
        if not skills_data:
            return "No skills data found"

        if isinstance(skills_data, list):
            if not skills_data:
                return "No specific skills extracted"
            # Format list: "Skill1, Skill2, Skill3"
            return ', '.join(skills_data)
        elif isinstance(skills_data, dict):
            # Handle legacy dictionary format if necessary
            # print("Warning: Received dictionary for skills (expected list). Formatting legacy structure.")
            output = []
            for cat, vals in skills_data.items():
                if vals:
                    output.append(f"{cat}: {', '.join(vals)}")
            return "; ".join(output) if output else "No specific skills extracted (from dict)"
        else:
            return f"Unknown skills format ({type(skills_data)})"
    # -----------------------------------------------

    # Removed the _format_list_section helper function as it's no longer needed

    def search(self, query: str, top_k: int = 5):
        """
        Performs a search, parses results, and prints structured information
        (Name, Experience Years, Education, Skills).
        """
        try:
            expanded_query = self.expander.expand(query)
            print(f"\n🔍 Searching for: '{query}'")
            print(f"   Expanded query: {expanded_query}")
            print("-" * 80)

            # --- Generate and VALIDATE Embedding ---
            embedding = self.embedder.generate(expanded_query)

            if embedding is None or not isinstance(embedding, np.ndarray):
                print(f"❌ ERROR: Embedding generation failed for the query. Received: {embedding} (Type: {type(embedding)})")
                return

            if embedding.ndim == 1:
                 embedding = embedding.reshape(1, -1)
            elif embedding.ndim != 2:
                 print(f"❌ ERROR: Embedding has unexpected number of dimensions: {embedding.ndim}. Expected 1D or 2D.")
                 return

            if embedding.shape[1] != self.index_dim:
                print(f"❌ ERROR: Generated embedding dimension ({embedding.shape[1]}) does not match FAISS index dimension ({self.index_dim})!")
                return

            if embedding.dtype != np.float32:
                embedding = embedding.astype(np.float32)

            # --- Perform Search ---
            results = self.faiss_index.search(embedding, query_text=query, k=top_k)

            if not results:
                print("No results found for this query.")
                return

            print(f"Found {len(results)} potential matches:")
            print("-" * 80)

            for idx, res in enumerate(results, 1):
                file_path = res.get('file')
                if not file_path or not os.path.exists(file_path):
                    print(f"\n⚠️ #{idx} Could not find file path for result: {res}. Skipping.")
                    continue

                file_name = os.path.basename(file_path)
                print(f"\n🏅 Result #{idx}: {file_name}")

                # --- Parse the specific resume found ---
                data = self.parser.parse(file_path) # Call the new parser

                if not data:
                    print("    Parser failed to extract data from this resume.")
                    print("-" * 80)
                    continue

                # --- Display Requested Fields ---
                score = res.get('score', 0.0)
                original_score = res.get('original_score', 'N/A') # If your search returns semantic score separately
                print(f"    Score: {score:.4f} (Semantic: {original_score})") # Keep score for context

                applicant_name = data.get('name', 'N/A')
                print(f"    Applicant: {applicant_name}") # KEEP

                # --- Experience (Years Only) ---
                total_exp_years = data.get('total_experience_years', 0.0)
                print(f"    Experience: {total_exp_years:.1f} years") # KEEP

                # --- Education ---
                education_text = data.get('education', '').strip()
                if education_text:
                    # Limit length for readability
                    print(f"    Education: {education_text[:250]}{'...' if len(education_text)>250 else ''}") # KEEP
                else:
                    print(f"    Education: N/A") # KEEP

                # --- Skills ---
                skills_list = data.get('skills', [])
                skills_str = self._format_skills(skills_list) # Keep using the fixed formatter
                print(f"    Skills: {skills_str}") # KEEP

                # --- REMOVED display for: email, phone, linkedin, summary, detailed experience entries, certs, projects, achievements ---

                print("-" * 80) # Separator for the next result

        except ValueError as ve:
            print(f"\n🚨 A ValueError occurred during search: {str(ve)}")
            traceback.print_exc()
        except Exception as e:
            print(f"\n🚨 An unexpected error occurred during search for query '{query}': {str(e)}")
            traceback.print_exc()


if __name__ == "__main__":
    print("Initializing Search Tester...")
    try:
        tester = SearchTester()
    except FileNotFoundError as e:
        print(f"❌ Initialization failed: {e}. Ensure required files (e.g., FAISS index) are accessible.")
        exit(1)
    except Exception as e:
        print(f"❌ Unexpected error during initialization: {e}")
        traceback.print_exc()
        exit(1)

    print("\n--- Resume Search Interface ---")
    while True:
        try:
            query = input("Enter search query (or type 'exit' to quit): ").strip()
            if query.lower() == 'exit':
                print("Exiting...")
                break
            if not query:
                continue

            while True:
                try:
                    top_k_input = input(f"How many results to show? (default 5, press Enter): ").strip()
                    if not top_k_input:
                        top_k = 5
                        break
                    top_k = int(top_k_input)
                    if top_k > 0:
                        break
                    else:
                        print("⚠️ Please enter a positive number.")
                except ValueError:
                    print("⚠️ Invalid input. Please enter a number.")

            tester.search(query, top_k)

        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except Exception as e:
            print(f"\n⚠️ An unexpected error occurred in the main loop: {str(e)}")
            traceback.print_exc()