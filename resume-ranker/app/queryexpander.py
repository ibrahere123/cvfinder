import re
from nltk.corpus import stopwords
import nltk
from transformers import AutoTokenizer, pipeline
import torch

nltk.download('stopwords')

class QueryExpander:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-base")
        self.generator = pipeline(
            "text2text-generation",
            model="google/flan-t5-base",
            tokenizer=self.tokenizer,
            device=0 if torch.cuda.is_available() else -1,
            trust_remote_code=True
        )
        self.skill_synonyms = {
            'react': ['redux', 'next.js', 'gatsby'],
            'js': ['javascript', 'typescript'],
            'node.js': ['express.js', 'nest.js'],
            'python': ['django', 'flask'],
            'sql': ['postgresql', 'mysql'],
            'cloud': ['aws', 'azure', 'gcp'],
            'devops': ['docker', 'kubernetes', 'ci/cd'],
            'frontend': ['react', 'angular', 'vue.js'],
            'backend': ['node.js', 'python', 'java'],
            'database': ['postgresql', 'mongodb', 'mysql']
        }
        self.acronyms = {
            'nlp': 'natural language processing',
            'cv': 'computer vision',
            'ai': 'artificial intelligence',
            'db': 'database',
            'ci/cd': 'continuous integration/continuous delivery'
        }
        self.stop_words = set(stopwords.words('english'))
        self.blacklist = {
            'methodologies', 'framework', 'engineer', 'programmer',
            'coder', 'developer', 'practices', 'technologies', 'tools',
            'knowledge', 'experience', 'skills', 'ability', 'proficient',
            'familiar', 'understanding', 'working', 'using', 'involved',
            'expertise', 'expert', 'in'
        }

    def expand(self, query: str) -> str:
        original = query.lower()
        expanded = self._expand_acronyms(original)
        synonyms = self._smart_hybrid_synonyms(expanded)
        contextual = self._get_hybrid_contextual_expansion(expanded)
        combined = f"{expanded} {synonyms} {contextual}"
        return self._clean_query(combined, original)

    def _expand_acronyms(self, text: str) -> str:
        for acr, full in self.acronyms.items():
            text = re.sub(rf"\b{acr}\b", full, text, flags=re.IGNORECASE)
        return text

    def _smart_hybrid_synonyms(self, text: str) -> str:
        additions = set()
        mentioned_skills = set(re.findall(r'\b(react|js|node\.js|python|sql|aws|azure|gcp|digitalocean|docker|kubernetes|devops|cloud|frontend|backend|database)\b', text))

        for skill in mentioned_skills:
            if skill in self.skill_synonyms:
                for syn in self.skill_synonyms[skill]:
                    if syn not in mentioned_skills:
                        additions.add(syn)
            # Handle 'js'
            if skill == 'js':
                if 'javascript' not in mentioned_skills: additions.add('javascript')
                if 'typescript' not in mentioned_skills: additions.add('typescript')
            elif skill == 'javascript':
                if 'typescript' not in mentioned_skills: additions.add('typescript')
            elif skill == 'typescript':
                if 'javascript' not in mentioned_skills: additions.add('javascript')

        return ' '.join(list(additions))

    def _get_hybrid_contextual_expansion(self, text: str) -> str:
        prompt = f"""Generate a concise list of relevant technical terms for the job search query: "{text}".
        Focus on specific technologies, tools, and platforms. Include related skills if highly relevant.
        Prioritize terms that are closely associated with the main concepts in the query.
        Include ONLY: programming languages, frameworks, libraries, tools, platforms, databases, cloud services.
        Do not repeat terms from the original query.
        Example 1: For "react developer", suggest: redux, next.js, javascript.
        Example 2: For "cloud engineer", suggest: aws, azure, gcp, docker, kubernetes, terraform.
        Result:"""

        response = self.generator(
            prompt,
            max_length=120,
            num_return_sequences=1,
            temperature=0.6,
            top_p=0.8,
            top_k=35,
            do_sample=True,
            repetition_penalty=1.1,
            clean_up_tokenization_spaces=False
        )
        processed_response = self._process_response(response[0]['generated_text'])
        original_words = set(re.findall(r'\b\w+\b', text))
        return ' '.join([term for term in processed_response.split() if term not in original_words])

    def _process_response(self, response: str) -> str:
        items = []
        for item in response.split(','):
            cleaned = re.sub(r'[^a-zA-Z0-9\s\.\/#+-]', '', item.strip().lower())
            words = [w for w in cleaned.split() if w not in self.blacklist]
            term = ' '.join(words).strip()
            if 2 <= len(term) <= 25 and 1 <= len(term.split()) <= 3:
                items.append(term)
        return ' '.join(items)

    def _clean_query(self, combined: str, original: str) -> str:
        tokens = re.findall(r"\b[\w\.\/#+-]+\b", combined.lower())

        original_terms = re.findall(r"\b[\w\.\/#+-]+\b", original.lower())
        seen = set()
        final = []

        for term in original_terms:
            if term not in self.stop_words and term not in seen:
                final.append(term)
                seen.add(term)

        for token in tokens:
            clean_token = token.strip()
            if (clean_token and
                    clean_token not in self.stop_words and
                    clean_token not in seen and
                    not any(b in clean_token.split() for b in self.blacklist)):
                final.append(clean_token)
                seen.add(clean_token)

        return ' '.join(final[:25])

