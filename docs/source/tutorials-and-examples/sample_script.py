import mlflow
import random
import requests
from PIL import Image
from io import BytesIO

def flatten_dict(d, parent_key='', sep='_'):
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

nested_params = {
    'model': {
        'layer1': {
            'neurons': 128,
            'activation': 'relu'
        },
        'layer2': {
            'neurons': 64,
            'activation': 'sigmoid'
        }
    },
    'optimizer': {
        'type': 'adam',
        'learning_rate': 0.001
    }
}

# Set up MLFlow experiment
mlflow.set_experiment("Test Experiment")

# Function to generate random parameters and metrics
def generate_random_data(num_params, num_metrics):
    params = {f"param_{i}": random.random() for i in range(num_params)}
    metrics = {f"metric_{i}": random.random() * 100 for i in range(num_metrics)}
    return params, metrics

# Number of runs, parameters, and metrics
num_runs = 5
num_params = 200
num_metrics = 200

for run in range(num_runs):
    with mlflow.start_run():
        # Generate random parameters and metrics
        params, metrics = generate_random_data(num_params, num_metrics)
        
        # Log parameters
        mlflow.log_params(params)

        # Flatten parameters
        flat_params = flatten_dict(nested_params)

        # Log flattened parameters
        mlflow.log_params(flat_params)

        # Log nested params (as JSON string)
        mlflow.log_param("nested_params", nested_params)

        # Download the image
        image_url = "https://www.mlflow.org/docs/latest/_static/MLflow-logo-final-black.png"
        response = requests.get(image_url)
        image = Image.open(BytesIO(response.content))
        image_path = "mlflow_logo.png"
        image.save(image_path)

        # Log image in root folder (not images)
        mlflow.log_artifact(image_path)

        # Download 3 more unique images
        image_urls = [
            "https://mlflow.org/docs/latest/_static/images/intro/learn-core-components.png",
            "https://mlflow.org/docs/latest/_static/images/intro/model-dev-lifecycle.png",
            "https://mlflow.org/docs/latest/_static/images/intro/model-topics.png",
        ]

        for i, image_url in enumerate(image_urls):
            response = requests.get(image_url)
            image = Image.open(BytesIO(response.content))
            image_path = f"{image_url.split('/')[-1]}"
            image.save(image_path)
            mlflow.log_artifact(image_path)

        # Log metrics
        for metric_name, metric_value in metrics.items():
            mlflow.log_metric(metric_name, metric_value)
        
        print(f"Run {run+1}/{num_runs} logged successfully!")

print("All runs logged.")
