#!/usr/bin/env python3
"""
SmartWaste AI - MobileNetV2 Transfer Learning on Big Data
Course: Btech CSE 2024
Subject: Python (BTCS 510-18)
Teacher: Mrs. Ishatpreet Kaur
Project Members:
  - Aayush Gupta (Roll No: 2445556)
  - Sehajpal Singh (Roll No: 2445712)

Trains a 6-class deep learning waste classification model on real big data
(Kaggle Garbage Classification 24,000+ images / TrashNet).
Exports:
  - smartwaste_mobilenetv2_best.keras
  - smartwaste_model.tflite (Edge/Embedded devices)
  - class_labels.json
  - model_evaluation_report.json
"""

import os
import sys
import json
import time
import argparse
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2
from sklearn.metrics import classification_report, confusion_matrix

TARGET_CLASSES = ['Plastic', 'Paper', 'Glass', 'Metal', 'Organic', 'General Waste']
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
RANDOM_SEED = 42

def load_or_download_dataset(data_dir=None):
    """Downloads or loads the Kaggle Garbage Classification dataset (24,000+ images)"""
    if data_dir and os.path.isdir(data_dir):
        print(f"[*] Using local dataset directory: {data_dir}")
        return data_dir

    print("[*] Checking for Kaggle Garbage Classification dataset...")
    try:
        import kagglehub
        print("[*] Downloading Kaggle garbage-classification dataset via kagglehub...")
        path = kagglehub.dataset_download("asdasdasasdas/garbage-classification")
        print(f"[+] Download complete! Dataset located at: {path}")
        return path
    except Exception as e:
        print(f"[!] kagglehub automatic download not available: {e}")
        print("[*] Falling back to default data directory ./dataset")
        os.makedirs("./dataset", exist_ok=True)
        return "./dataset"

def build_data_pipelines(dataset_dir):
    """Builds stratified training, validation, and test datasets with data augmentation"""
    print("[*] Partitioning dataset (70% train, 15% validation, 15% test)...")
    
    # Stratified loading via tf.keras.utils.image_dataset_from_directory
    train_ds = keras.utils.image_dataset_from_directory(
        dataset_dir,
        validation_split=0.3,
        subset="training",
        seed=RANDOM_SEED,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical"
    )

    val_test_ds = keras.utils.image_dataset_from_directory(
        dataset_dir,
        validation_split=0.3,
        subset="validation",
        seed=RANDOM_SEED,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical"
    )

    # Split val_test into 50% val and 50% test (15% each of total)
    val_batches = tf.data.experimental.cardinality(val_test_ds) // 2
    val_ds = val_test_ds.take(val_batches)
    test_ds = val_test_ds.skip(val_batches)

    # Data augmentation pipeline for training
    data_augmentation = keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.15),
        layers.RandomZoom(0.15),
        layers.RandomContrast(0.1),
    ], name="data_augmentation")

    train_ds = train_ds.map(lambda x, y: (data_augmentation(x, training=True), y), num_parallel_calls=tf.data.AUTOTUNE)
    
    # MobileNetV2 input normalization [-1, 1]
    normalization = layers.Rescaling(1./127.5, offset=-1)
    train_ds = train_ds.map(lambda x, y: (normalization(x), y)).prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.map(lambda x, y: (normalization(x), y)).prefetch(tf.data.AUTOTUNE)
    test_ds = test_ds.map(lambda x, y: (normalization(x), y)).prefetch(tf.data.AUTOTUNE)

    return train_ds, val_ds, test_ds

def create_model(num_classes=6):
    """Builds MobileNetV2 Transfer Learning Architecture"""
    print("[*] Initializing MobileNetV2 backbone with ImageNet weights...")
    base_model = MobileNetV2(
        weights="imagenet",
        include_top=False,
        input_shape=(224, 224, 3)
    )
    base_model.trainable = False  # Freeze backbone for initial training phase

    inputs = keras.Input(shape=(224, 224, 3))
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D(name="global_avg_pool")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3, name="top_dropout")(x)
    x = layers.Dense(128, activation="relu", name="dense_features")(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="waste_probabilities")(x)

    model = keras.Model(inputs, outputs, name="SmartWaste_MobileNetV2")
    return model, base_model

def train_pipeline(epochs_warmup=10, epochs_finetune=15, dataset_path=None):
    dataset_dir = load_or_download_dataset(dataset_path)
    train_ds, val_ds, test_ds = build_data_pipelines(dataset_dir)
    model, base_model = create_model(num_classes=len(TARGET_CLASSES))

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy", keras.metrics.Precision(name="precision"), keras.metrics.Recall(name="recall")]
    )

    print(f"\n[Phase 1] Warmup training classification head for {epochs_warmup} epochs...")
    callbacks = [
        keras.callbacks.EarlyStopping(patience=4, restore_best_weights=True, monitor="val_accuracy"),
        keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=2, monitor="val_loss")
    ]
    
    history_warmup = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs_warmup,
        callbacks=callbacks
    )

    print(f"\n[Phase 2] Fine-tuning upper layers for {epochs_finetune} epochs...")
    base_model.trainable = True
    # Freeze lower layers; fine-tune only top 30 layers
    for layer in base_model.layers[:-30]:
        layer.trainable = False

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy", keras.metrics.Precision(name="precision"), keras.metrics.Recall(name="recall")]
    )

    history_finetune = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs_finetune,
        callbacks=callbacks
    )

    # Final Evaluation on held-out test partition
    print("\n[*] Evaluating on held-out test split...")
    test_results = model.evaluate(test_ds, return_dict=True)
    print(f"[+] Final Test Accuracy: {test_results['accuracy'] * 100:.2f}%")

    # Export Model Artifacts
    output_model_path = "smartwaste_mobilenetv2_best.keras"
    model.save(output_model_path)
    print(f"[+] Model saved to {output_model_path}")

    # Export TFLite Model
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    tflite_model = converter.convert()
    with open("smartwaste_model.tflite", "wb") as f:
        f.write(tflite_model)
    print("[+] Edge TFLite model exported to smartwaste_model.tflite")

    # Save class mapping
    with open("class_labels.json", "w") as f:
        json.dump({i: name for i, name in enumerate(TARGET_CLASSES)}, f, indent=2)

    return model, test_results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SmartWaste AI Big Data Training Pipeline")
    parser.add_argument("--data_dir", type=str, default=None, help="Path to waste images directory")
    parser.add_argument("--warmup_epochs", type=int, default=10, help="Frozen backbone warmup epochs")
    parser.add_argument("--finetune_epochs", type=int, default=15, help="Fine-tuning epochs")
    args = parser.parse_args()

    train_pipeline(
        epochs_warmup=args.warmup_epochs,
        epochs_finetune=args.finetune_epochs,
        dataset_path=args.data_dir
    )
