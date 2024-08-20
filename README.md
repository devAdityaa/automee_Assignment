
# PDF Requirement Checker AI
## Automee Assignment
This project focuses on automating the verification of PDF documents against specific requirements using advanced AI capabilities. The process begins by converting each page of the PDF into an image format. These images are then passed, along with the prompt, to the OpenAI GPT-4 model through the API for evaluation. The final output is a JSON Object.


This automated solution streamlines the process of document compliance checks, making it ideal for industries where accuracy and consistency in documentation are critical.


## Getting Started
Clone the repository:
```bash
git clone https://github.com/devAdityaa/automee_Assignment.git
cd automee_Assignment
```
Install the requirements:
```bash
npm install
```

#### System Pre-Requisites:
This script uses [pdf2pic](https://www.npmjs.com/package/pdf2pic) which needs the following packages in your system:
**GraphicsMagick (GM)**.

- For Mac Environment
```bash
brew install graphicsmagick
```
- For Linux:
```bash
sudo apt-get install graphicsmagick
```



## Environment Variables

A sample .env file is already provided, users can remove the `.sample` from the file name to make it a .env file.
All the env variables are given inside of it.




## Run Locally
To run the project use:
```bash
node index.js
```
