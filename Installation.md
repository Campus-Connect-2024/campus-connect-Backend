# Installation Guide

## Prerequisites

Before you begin, ensure you have met the following requirements:
- You have installed Node.js (version 14 or higher).
- You have a Git client installed.
- You have a code editor like Visual Studio Code.

## Installation

To install the project, follow these steps:

1. **Fork the repository**:
    - Go to the repository on GitHub.
    - Click the "Fork" button at the top right of the page.

2. **Clone your forked repository**:
    ```bash
    git clone https://github.com/your-username/your-forked-repository.git
    ```

3. **Navigate to the project directory**:
    ```bash
    cd your-forked-repository
    ```

4. **Install dependencies**:
    ```bash
    npm install
    ```

5. **Create a `.env` file**:
    - Copy the `.env.sample` file to `.env`:
      ```bash
      cp .env.sample .env
      ```
    - Open the `.env` file and replace the placeholder values with your actual URI and keys.

## Usage

To run the project, follow these steps:

1. **Start the development server**:
    ```bash
    npm run dev
    ```

2. Open your browser and navigate to `http://localhost:8000` if you haven't setup the PORT on .env or change the 8000 with your PORT.

For more details, please refer to the README