import subprocess
import sys
import os

def install_requirements():
    print("Installing Python dependencies...")
    
    # First upgrade pip
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
    
    # Install using pre-built wheels
    print("Installing dependencies using pre-built wheels...")
    requirements = [
        "--only-binary=:all: numpy==1.21.2",
        "--only-binary=:all: scipy==1.7.1",
        "--only-binary=:all: pandas==1.3.3",
        "--only-binary=:all: scikit-learn==0.24.2",
        "fastapi==0.68.1",
        "uvicorn==0.15.0",
        "joblib==1.0.1",
        "pydantic==1.8.2",
        "schedule==1.1.0",
        "requests==2.26.0",
        "python-dotenv==0.19.0"
    ]
    
    for req in requirements:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", req])
            print(f"Successfully installed {req}")
        except subprocess.CalledProcessError as e:
            print(f"Error installing {req}: {str(e)}")
            sys.exit(1)

if __name__ == "__main__":
    install_requirements() 