import os

def check_files():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data'))
    faiss_index_path = os.path.join(base_dir, 'faiss_index', 'faiss_index.index')
    faiss_map_path = os.path.join(base_dir, 'faiss_index', 'faiss_index_map.npy')
    resume_info_path = os.path.join(base_dir, 'resume_info.pkl')

    print(f"Base data directory: {base_dir}")
    print(f"FAISS index file exists: {os.path.exists(faiss_index_path)} at {faiss_index_path}")
    print(f"FAISS map file exists: {os.path.exists(faiss_map_path)} at {faiss_map_path}")
    print(f"Resume metadata file exists: {os.path.exists(resume_info_path)} at {resume_info_path}")

if __name__ == "__main__":
    check_files()
