# 🌉 BridgeAI

**An Online-First AI Assistant with Automatic Offline Fallback**

BridgeAI is a **hybrid AI assistant** that prioritizes fast cloud AI (Cerebras) when internet is available, and seamlessly falls back to a local model when the connection drops - ensuring you **never lose access** to AI assistance.

*Built by Team Cyber_Samurais for WeMakeDevs FutureStack GenAI Hackathon '25*

---

## 🎯 The Problem We Solve

Ever had an AI assistant fail because your internet dropped? **BridgeAI solves this.**

- **Traditional AI**: Breaks when internet fails ❌
- **BridgeAI**: Automatically switches to local model ✅

Perfect for:
- 🌍 Remote/rural areas with unreliable internet
- ✈️ Working while traveling (airplane mode)
- 🔒 Privacy-sensitive tasks (use offline mode)
- � Cost-conscious users (reduce API costs)
- 🏥 Critical applications (healthcare, emergency services)

---

## ✨ Key Features

- 🌐 **Online-First**: Fast cloud AI (Cerebras llama-3.3-70b) when connected
- 🔄 **Automatic Fallback**: Seamlessly switches to local model when internet drops
- 🤖 **Zero Manual Switching**: Detects network changes automatically
- 🐳 **Docker Containerized**: Professional deployment, one-command setup
- 🎯 **MCP Gateway**: Smart routing layer using Model Context Protocol
- � **Privacy Option**: Fully functional offline mode (data stays local)
- ⚡ **Always Responsive**: Never shows "No connection" errors

---

## 🚀 Quick Start

### For Hackathon Judges 🏆
📖 **[See FOR_JUDGES.md for complete testing guide](FOR_JUDGES.md)**

### Quick Setup (Windows)

1. **Install Prerequisites**
   - Docker Desktop: https://www.docker.com/products/docker-desktop/
   - Cerebras API Key (FREE): https://cloud.cerebras.ai/

2. **Run setup**
   ```bash
   setup.bat
   ```
   - Downloads AI model (~4GB, one-time)
   - Prompts for API key
   - Configures environment

3. **Start the app**
   ```bash
   start.bat
   ```
   - Builds Docker images (first run only, ~5-10 min)
   - Opens browser automatically

4. **Test the hybrid feature!**
   - Chat while online → fast responses
   - Disconnect WiFi → keeps working (offline mode)
   - Reconnect WiFi → switches back automatically

📖 **[See QUICKSTART.md for detailed instructions](QUICKSTART.md)**

---

## 🏗️ Architecture

```
User's Computer (Docker Container)
│
├── Frontend (React + Vite) :5173
├── Backend (FastAPI) :8000
├── MCP Gateway (Network Router) :8080
└── Local Model (Llama 2 - 7B)

Network Detection:
├── ONLINE  → Routes to Cerebras API (fast, cloud-based)
└── OFFLINE → Routes to Local GGUF Model (private, always available)
```

---

## 🛠️ Technology Stack

### Frontend
- **React** + Vite
- **TailwindCSS** for styling
- **Lucide Icons**
- Auto network detection

### Backend
- **FastAPI** (Python)
- **llama-cpp-python** for local inference
- **Cerebras Cloud SDK** for online mode
- Conversation memory management

### MCP Gateway
- Custom **Model Context Protocol** gateway
- Automatic network detection
- Intelligent routing between providers
- Health monitoring

### Infrastructure
- **Docker** + Docker Compose
- Microservices architecture
- Container health checks

---

## 📦 What's Included

- ✅ **3 Dockerfiles** (Frontend, Backend, Gateway)
- ✅ **docker-compose.yml** - Orchestrates all services
- ✅ **MCP Gateway** - Custom network-aware router
- ✅ **Local Model** - Llama 2 7B (4-bit quantized)
- ✅ **Auto-detection** - No manual mode switching
- ✅ **Health checks** - Automatic service recovery
- ✅ **Complete documentation**

---

## 🎯 Use Cases

Perfect for:
- 🌍 **Remote/Rural Areas** - Limited internet connectivity
- ✈️ **Travel** - Unreliable mobile connections
- 🏥 **Healthcare** - Privacy-sensitive environments
- 🎓 **Education** - Schools with poor connectivity
- 🚢 **Maritime/Aviation** - Isolated environments
- 💼 **Enterprise** - Air-gapped networks

---

## 📊 System Requirements

### Minimum
- Docker Desktop installed
- 8 GB RAM
- 15 GB free disk space
- Windows 10/11, macOS, or Linux

### Recommended
- 16 GB RAM
- 20 GB free disk space (SSD preferred)
- 4+ CPU cores

---

## 🧪 Testing Network Switching

1. Start the app with internet connection
2. Send a message → Uses **Cerebras** (fast response)
3. Disable WiFi/Internet
4. Send another message → Automatically switches to **Local Model**
5. Re-enable internet → Switches back to **Cerebras**
6. Previous offline messages auto-enhance ✨

**No manual toggle needed!**

---

## 📝 Commands

```bash
# Start application
docker-compose up

# Start in background
docker-compose up -d

# Stop application
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up --build
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

---

## 👥 Team Cyber_Samurais

Built for **WeMakeDevs FutureStack GenAI Hackathon 2025**

---

## 🙏 Acknowledgments

- **Cerebras** for the lightning-fast AI API
- **Meta** for the Llama 2 model
- **Docker** for containerization technology
- **FastAPI** & **React** communities

---

**Made with ❤️ to bridge the digital divide**
