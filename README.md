# Velammal Engineering College Main Website Backend Initializations

This project contains automation code to initialize the database of the main website.

## System Requirements

- Minimum **8GB RAM**
- **Windows 10 or later** / **Linux**
- Minimum **1GB storage**
- **Good internet bandwidth** (highly recommended)
- **Python 3.10 or later**
- Required Software:
  - Miniconda or Anaconda
  - Git
  - MongoDB Server & MongoDB Compass
  - VS Code

## Installation Steps

### 1. Clone the Repository

Clone the GitHub repository into a root-level folder:

```sh
git clone https://github.com/Siddharth-magesh/Velammal-Engineering-College-Backend.git
cd Velammal-Engineering-College-Backend
```

### 2. Create & Activate a Conda Environment

```sh
conda create -n vec python=3.10
conda activate vec
```

### 3. Install Dependencies

```sh
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Inside the `backend` folder, create a `.env` file and add the following:

```
MONGO_URI=mongodb://localhost:27017
DB_NAME=VEC
PORT=5000
```

## Database Initialization

1. **Ensure MongoDB Server is Running**

   - Make sure you are connected to `mongosh`.

2. **Navigate to the Database Folder**

   ```sh
   cd database
   ```

3. **Run the Initialization Script**

   - If testing locally, run:
     ```sh
     python main.py
     ```
   - To insert the entire faculty database, **comment out `head(1)` in `main.py`**, around 114.  
     Otherwise, only one record will be inserted.

   - To insert the entire student database, **comment out `head(1)` in `main.py`**, around 1210.  
     Otherwise, only one record will be inserted.

   - To insert in the AWS , run:
     ```sh
     python aws.py
     ```

4. **Wait for Image Downloads**
   - **Downloading may take ~10 minutes**, depending on internet speed.
   - **Extraction may take another ~10 minutes**.
   - Logs will be available after completion.
   - **Do not put the system in sleep mode** while running.
