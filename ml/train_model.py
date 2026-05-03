import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

def generate_synthetic_data(samples=1000):
    np.random.seed(42)
    # Features: CPU Usage (%), Memory Usage (%), Uptime (Hrs), Cost ($)
    cpu = np.random.uniform(0, 100, samples)
    memory = np.random.uniform(0, 100, samples)
    uptime = np.random.uniform(1, 720, samples)
    cost = np.random.uniform(5, 500, samples)
    
    # Target: 0 = Healthy, 1 = Right-size, 2 = Idle (Terminate)
    target = []
    for i in range(samples):
        if cpu[i] < 5 and uptime[i] > 168: # Idle for a week
            target.append(2)
        elif cpu[i] < 20 or memory[i] < 20: # Low usage
            target.append(1)
        else:
            target.append(0)
            
    df = pd.DataFrame({
        'cpu_usage': cpu,
        'memory_usage': memory,
        'uptime': uptime,
        'cost': cost,
        'target': target
    })
    return df

def train():
    print("Generating synthetic data...")
    df = generate_synthetic_data()
    X = df.drop('target', axis=1)
    y = df['target']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training XGBoost model...")
    model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='mlogloss')
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")
    
    # Save model
    if not os.path.exists('model'):
        os.makedirs('model')
    joblib.dump(model, 'model/optimizer_model.pkl')
    print("Model saved to model/optimizer_model.pkl")

if __name__ == "__main__":
    train()
