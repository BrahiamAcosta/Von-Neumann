# Von Neumann's Machine Implementation

This project aims to build an implementation of a Von Neumann's machine, featuring both backend and frontend components.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)
- [Usage](#usage)

## Introduction

The Von Neumann's machine is a theoretical design for a stored-program computer that serves as the foundation for most modern computers. This project will implement a Von Neumann's machine with a focus on both backend and frontend development.

## Features

- **Backend**: Handles the core logic and processing of the Von Neumann's machine.
- **Frontend**: Provides a user interface to interact with the machine.

## Technologies

- **Backend**: Python with FastAPI an Uvicorn
- **Frontend**: React

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/BrahiamAcosta/Von-Neumann.git
   ```
2. Navigate to the project directory:
   ```bash
   cd von-neumann-machine
   ```
3. Install dependencies for both backend and frontend:

   ```bash
   # For backend
   cd backend
   python -m venv venv
   pip install -r requirements.txt

   # For frontend
   cd ../frontend
   npm install
   ```

## Usage

1. Start the backend server:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```
2. Start the frontend server:
   ```bash
   cd ../frontend
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173` to interact with the Von Neumann's machine.
