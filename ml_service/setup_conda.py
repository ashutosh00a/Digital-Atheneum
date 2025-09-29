import subprocess
import sys
import os

def setup_conda_env():
    print("Setting up conda environment...")
    
    # Create conda environment
    env_name = "book_recommender"
    python_version = "3.8"  # Using Python 3.8 for better compatibility
    
    try:
        # Create environment
        subprocess.check_call([
            "conda", "create", "-n", env_name,
            f"python={python_version}",
            "numpy=1.21.2",
            "scipy=1.7.1",
            "pandas=1.3.3",
            "scikit-learn=0.24.2",
            "fastapi=0.68.1",
            "uvicorn=0.15.0",
            "joblib=1.0.1",
            "pydantic=1.8.2",
            "schedule=1.1.0",
            "requests=2.26.0",
            "python-dotenv=0.19.0",
            "-y"
        ])
        
        print(f"Successfully created conda environment '{env_name}'")
        print("\nTo activate the environment, run:")
        print(f"conda activate {env_name}")
        
    except subprocess.CalledProcessError as e:
        print(f"Error creating conda environment: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    setup_conda_env() 