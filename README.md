# Mobile Empathic LLM with Visual Nonverbal Input
This repository provides a study application to explore nonverbal visual context processing in MLLM-driven chatbots. 
The app is based on Vue 3 + TypeScript + Vite, and was created as part of a MobileHCI publication: [https://doi.org/10.1145/3743724](https://doi.org/10.1145/3743724)



## Development

### 1. Install Node.js
Install Node.js if you haven't already.
```
node --version
```

### 2. Init project
```
cd app
npm install
```

### 3. Setup dev HTTPS
To host the Vue application with camera access for mobile (iOS) devices, we need to create development certificates.
* install mkcert (on MacOS using Homebrew)
* install local CA
* create certificates for local dev
* certificates are refered to in ``vite.config.ts``
```
brew install mkcert

mkcert -install

mkdir certificates
cd certificates
mkcert -key-file dev.local-key.pem -cert-file dev.local.pem localhost <<your_local_ip_address>
```
### 4. OpenAI API Key
Copy  `.env_empty` to a file called `.env` and add your OpenAI API key 

### 5. Run
Host Vue application over network.
```
npm run dev --host
```


## Deployment 
Build application to `/dist`  and host preview.
```
npm run build
npm run preview
```
