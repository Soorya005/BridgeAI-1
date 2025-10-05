import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowRight, Github, Mail, Linkedin, ExternalLink, WifiOff, Zap, Brain, MessageSquare, Crown, Bug, Lock, Ghost, ArrowUp, Sparkles } from 'lucide-react';
import cerebrasLogo from '../assets/cerebras-logo.webp';
import dockerLogo from '../assets/docker-logo.a363136f.svg';
import metaLogo from '../assets/meta-logo.72ee86ee.svg';
import teamLogo from '../assets/team_logo.jpeg';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolling, setIsScrolling] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      setIsScrolling(true);
      setActiveSection(sectionId);
      element.scrollIntoView({ behavior: 'smooth' });
      
      setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    }
  };


  useEffect(() => {
    const handleScroll = () => {
      if (isScrolling) return;
      
      const sections = ['home', 'about', 'vision', 'techstack', 'team'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }

      // Show scroll-to-top button when scrolled down 300px
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolling]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              BridgeAI
            </motion.div>

            <div className="hidden md:flex space-x-8">
              {[
                { id: 'home', label: 'Home' },
                { id: 'about', label: 'About' },
                { id: 'vision', label: 'Vision' },
                { id: 'techstack', label: 'Tech Stack' },
                { id: 'team', label: 'Team' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative text-sm font-medium transition-colors ${
                    activeSection === item.id ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <motion.div
                      layoutId="activeSection"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-purple-400"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                onClick={() => navigate('/chat')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/80 to-cyan-500/80 hover:from-blue-500 hover:to-cyan-500 rounded-lg transition-all shadow-lg shadow-blue-500/30"
              >
                <MessageSquare className="w-5 h-5 text-white" />
                <span className="hidden sm:inline text-white font-medium">Get Started</span>
              </motion.button>

              <motion.a
                href="https://github.com/Ravisankar-S/BridgeAI"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-500 hover:to-pink-500 rounded-lg transition-all shadow-lg shadow-purple-500/30"
              >
                <Github className="w-5 h-5 text-white" />
                <span className="hidden sm:inline text-white font-medium">GitHub</span>
              </motion.a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center relative px-6">
        <div className="text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            {/* Heading */}
            <h1 className="text-6xl md:text-8xl font-bold mb-8">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                BridgeAI
              </span>
            </h1>
            
            {/* Animated Catchphrase */}
            <div className="text-2xl md:text-4xl mb-16 min-h-[60px] md:min-h-[80px] flex items-center justify-center">
              <div className="relative px-4">
                {/* Main text with sleek professional gradient */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  className="relative tracking-wide"
                >
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent font-medium">
                    No Internet
                  </span>
                  <span className="mx-3 md:mx-4"></span>
                  <span className="relative inline-block">
                    <motion.span
                      initial={{ opacity: 1 }}
                      whileInView={{ 
                        opacity: [1, 0.6, 0.6]
                      }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: 1.6,
                        times: [0, 0.8, 1]
                      }}
                      className="relative bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 bg-clip-text text-transparent font-medium"
                    >
                      No AI
                      {/* Sleek strikethrough */}
                      <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        whileInView={{ scaleX: 1, opacity: 1 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ 
                          duration: 0.7, 
                          delay: 1.6,
                          ease: [0.65, 0, 0.35, 1]
                        }}
                        className="absolute left-0 top-1/2 w-full h-[2px] md:h-[3px] origin-left bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400"
                        style={{ transform: 'translateY(-50%)' }}
                      />
                    </motion.span>
                  </span>
                  <span className="mx-3 md:mx-4"></span>
                  
                  {/* YES AI on same line */}
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 2.3,
                      ease: [0.34, 1.56, 0.64, 1]
                    }}
                    className="relative inline-block"
                  >
                    {/* Subtle professional glow */}
                    <motion.span
                      animate={{ 
                        opacity: [0.15, 0.25, 0.15],
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-blue-400 blur-xl rounded-full"
                    />
                    
                    <span className="relative bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent font-medium tracking-wide">
                      YES AI
                    </span>
                  </motion.span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.button
            onClick={() => navigate('/chat')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-lg font-semibold text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/75 transition-all"
          >
            <span>Check Out BridgeAI</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 flex flex-wrap justify-center gap-4"
          >
            {[
              { icon: Brain, text: 'AI-Powered' },
              { icon: WifiOff, text: 'Works Offline' },
              { icon: Zap, text: 'Lightning Fast when online' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 px-6 py-3 bg-white/5 backdrop-blur-lg rounded-full border border-white/10"
              >
                <feature.icon className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-white/50 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="min-h-screen flex items-center justify-center relative px-6 py-20">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              About BridgeAI
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Team <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent font-medium">Cyber_Samurais</span>' Hybrid Knowledge assistant focused towards low connectivity environments. Works Online as well as Offline
            </p>
          </motion.div>

          {/* Project Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-white/5 backdrop-blur-lg rounded-2xl p-10 border border-white/10 hover:border-purple-500/50 transition-all"
          >
            <h3 className="text-3xl font-bold mb-6 text-purple-400 text-center">What is BridgeAI?</h3>
            <p className="text-gray-300 leading-relaxed mb-8 text-lg text-center">
              BridgeAI revolutionizes AI accessibility by breaking the barrier between connectivity and intelligence. 
              In a world where internet access isn't guaranteed, BridgeAI ensures you're never without AI assistance. 
              Our hybrid architecture seamlessly switches between powerful cloud-based models when you're online and 
              concise local inference when you're offline — delivering consistent, intelligent conversations 
              regardless of your connection status. Whether you're on a flight, in a remote location, or experiencing 
              network issues, BridgeAI keeps you productive with state-of-the-art language models running right on your device.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="group flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 hover:border-purple-500/50 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:shadow-purple-500/70 transition-all">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-200 font-semibold text-lg">Advanced AI Conversations</p>
                <p className="text-gray-400 text-sm">Intelligent, context-aware responses powered by cutting-edge models</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="group flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 hover:border-blue-500/50 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50 group-hover:shadow-blue-500/70 transition-all">
                  <WifiOff className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-200 font-semibold text-lg">Works Offline</p>
                <p className="text-gray-400 text-sm">Fully functional even without internet connectivity</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="group flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 hover:border-pink-500/50 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/50 group-hover:shadow-pink-500/70 transition-all">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-200 font-semibold text-lg">Enhance Feature</p>
                <p className="text-gray-400 text-sm">Offline responses can be queued to be enhanced once internet resumes</p>
              </motion.div>
            </div>
          </motion.div>

          {/* GitHub Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <motion.a
              href="https://github.com/Ravisankar-S/BridgeAI"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-full border border-purple-500/50 transition-all"
            >
              <Github className="w-5 h-5" />
              <span>View on GitHub</span>
              <ExternalLink className="w-4 h-4" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="min-h-screen flex items-center justify-center relative px-6 py-20">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Our Vision
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Team <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent font-medium">Cyber_Samurais</span>' first GenAI Hackathon !
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-white/5 backdrop-blur-lg rounded-2xl p-10 border border-white/10 hover:border-purple-500/50 transition-all"
          >
            <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
              <p>
                As engineering undergraduates, Generative AI has quickly become an integral part of our academic and personal journeys. We wanted to build something that not only highlights the power of AI but also tackles a real-world challenge we often face — unreliable internet connectivity.
              </p>
              <p>
                Having never participated in an AI hackathon before, the moment we heard about the <strong>Futurestack GenAI Hackathon</strong>, we knew we had to dive in. After an intense brainstorming session, <strong>BridgeAI</strong> was born — a tool designed to <em>bridge</em> the gap created by connectivity issues. Every line of code, every design choice, and every feature has been crafted thoughtfully to bring this vision to life.
              </p>
              <p>
                We believe in AI’s transformative potential to redefine how we interact with technology, and BridgeAI is our contribution to that future. This is just the beginning — we’re committed to learning, iterating, and pushing the boundaries of what’s possible through innovation and collaboration.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="techstack" className="min-h-screen flex items-center justify-center relative px-6 py-20">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Powered by Industry Leaders
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              BridgeAI leverages cutting-edge technologies from the world's leading tech companies
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Cerebras Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-lg rounded-3xl p-8 border border-orange-500/20 hover:border-orange-500/50 transition-border duration-150 overflow-hidden group min-h-[400px] flex flex-col"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
              
              <div className="relative z-10">
                {/* Logo */}
                <div className="mb-6 flex justify-center">
                  <img src={cerebrasLogo} alt="Cerebras" className="h-16 object-contain" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white text-center mb-4">
                  Cerebras
                </h3>

                {/* Description */}
                <div className="text-gray-300 leading-relaxed text-left space-y-3">
                  <p>
                    <span className="font-semibold text-orange-300">Cloud-Powered Intelligence</span> - BridgeAI utilizes Cerebras API to access the Llama-3.3-70B model, serving as your sophisticated online brain for comprehensive, detailed responses
                  </p>
                  <p>
                    <span className="font-semibold text-orange-300">Lightning-Fast Inference</span> - Cerebras' world-class AI infrastructure delivers near-instantaneous inference, transforming complex queries into intelligent answers with minimal latency
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Meta (Llama) Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-lg rounded-3xl p-8 border border-blue-500/20 hover:border-blue-500/50 transition-border duration-150 overflow-hidden group min-h-[400px] flex flex-col"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
              
              <div className="relative z-10">
                {/* Logo */}
                <div className="mb-6 flex justify-center">
                  <img src={metaLogo} alt="Meta" className="h-16 object-contain" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white text-center mb-4">
                  Meta (Llama)
                </h3>

                {/* Description */}
                <div className="text-gray-300 leading-relaxed text-left space-y-3">
                  <p>
                    <span className="font-semibold text-blue-300">Online Brain</span> - Our primary intelligence engine leverages Llama-3.3-70B through Cerebras API, delivering exceptionally smart and instantaneous responses with cutting-edge performance
                  </p>
                  <p>
                    <span className="font-semibold text-blue-300">Offline Brain</span> - A quantized, chat-optimized Llama-2 model serves as our offline brain, ensuring continuous functionality even without internet connectivity, albeit with measured constraints
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Docker Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative bg-gradient-to-br from-cyan-500/10 to-blue-600/10 backdrop-blur-lg rounded-3xl p-8 border border-cyan-500/20 hover:border-cyan-500/50 transition-border duration-150 overflow-hidden group min-h-[400px] flex flex-col"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
              
              <div className="relative z-10">
                <div className="mb-6 flex justify-center">
                  <img src={dockerLogo} alt="Docker" className="h-16 object-contain" />
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-4">
                  Docker
                </h3>
                <div className="text-gray-300 leading-relaxed text-left space-y-3">
                  <p>
                    <span className="font-semibold text-cyan-300">Containerized Architecture</span> - BridgeAI's entire application stack is containerized using Docker, ensuring consistent performance across any environment
                  </p>
                  <p>
                    <span className="font-semibold text-cyan-300">Seamless Scalability</span> - Docker enables effortless deployment and scaling, making it easy to maintain and expand our AI-powered chat service
                  </p>
                  <p>
                    <span className="font-semibold text-cyan-300">Intelligent Mode Switching</span> - Docker orchestrates smooth transitions between online and offline modes, allowing users to switch seamlessly without interruption
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="min-h-screen flex items-center justify-center relative px-6 py-20">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Meet the Team
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Passionate developers and AI enthusiasts working together to build the future of conversational AI.
            </p>
          </motion.div>

          {/* Team Cards - You can customize this with your actual team info */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                name: 'Ravisankar S',
                roles: ['Full Stack Developer', 'AI Integration Engineer'],
                email: 'ravisankars.official@gmail.com',
                linkedin: 'https://www.linkedin.com/in/ravisankar-s-a3a881292',
                github: 'https://github.com/Ravisankar-S'
              },
              // Add more team members here
              {
                name: 'Soorya Dev',
                roles: ['Testing', 'QA Engineer'],
                email: 'team2@example.com',
                linkedin: '#',
                github: '#'
              },
              {
                name: 'Shahan A',
                roles: ['Backend Assistant'],
                email: 'team3@example.com',
                linkedin: '#',
                github: '#'
              },
              {
                name: 'Sangeerth P B',
                roles: ['Media & Editing'],
                email: 'team4@example.com',
                linkedin: '#',
                github: '#'
              }
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.15 } }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-border duration-150 relative"
              >
                {/* Team Badges */}
                {index === 0 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 whitespace-nowrap">
                    <div className="flex items-center space-x-1 px-2.5 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg">
                      <Crown className="w-3.5 h-3.5 text-white" />
                      <span className="text-white text-sm font-bold">Team Lead</span>
                    </div>
                  </div>
                )}
                {index === 1 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 whitespace-nowrap">
                    <div className="flex items-center space-x-1 px-2.5 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg">
                      <Bug className="w-3.5 h-3.5 text-white" />
                      <span className="text-white text-sm font-bold">Bug Finder</span>
                    </div>
                  </div>
                )}
                {index === 2 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 whitespace-nowrap">
                    <div className="flex items-center space-x-1 px-2.5 py-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg">
                      <Lock className="w-3.5 h-3.5 text-white" />
                      <span className="text-white text-sm font-bold">Locked In</span>
                    </div>
                  </div>
                )}
                {index === 3 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 whitespace-nowrap">
                    <div className="flex items-center space-x-1 px-2.5 py-0.5 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full shadow-lg">
                      <Ghost className="w-3.5 h-3.5 text-white" />
                      <span className="text-white text-sm font-bold">Ghost</span>
                    </div>
                  </div>
                )}
                
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-2">{member.name}</h3>
                <div className="text-center mb-4 space-y-1">
                  {member.roles.map((role, roleIndex) => (
                    <p key={roleIndex} className="text-purple-400 text-sm">
                      {role}
                    </p>
                  ))}
                </div>
                
                <div className="flex justify-center space-x-4">
                  <motion.a
                    href={`mailto:${member.email}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Mail className="w-5 h-5 text-gray-400" />
                  </motion.a>
                  <motion.a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Linkedin className="w-5 h-5 text-gray-400" />
                  </motion.a>
                  <motion.a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Github className="w-5 h-5 text-gray-400" />
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="relative z-10 py-20 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
          >
            Ready to See Us In Action?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto"
          >
            Thanks for reviewing our work. Try BridgeAI now!
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/chat')}
            className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-white text-lg shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300"
          >
            <span className="flex items-center space-x-2">
              <span>Check Out BridgeAI</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-900/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <span className="text-gray-400">
                © 2025 <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent font-medium">Cyber_Samurais</span>. Built with ❤️ to learn and grow.
              </span>
              {/* Team Logo with hover effect */}
              <div className="relative group cursor-pointer z-[100] flex items-center gap-2">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-20 group-hover:opacity-60 transition-all duration-500" />
                <img 
                  src={teamLogo} 
                  alt="Cyber_Samurais" 
                  className="relative w-8 h-8 md:w-10 md:h-10 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-4 group-hover:ring-purple-400/50 shadow-lg transition-all duration-500 group-hover:scale-[3] group-hover:shadow-2xl"
                />
                {/* Handwriting hint - disappears on hover */}
                <span 
                  className="text-purple-400/70 text-xs md:text-sm italic font-light group-hover:opacity-0 transition-opacity duration-300"
                  style={{ fontFamily: "'Brush Script MT', cursive" }}
                >
                  ← hover
                </span>
              </div>
            </div>
            <div className="flex space-x-6">
              <a href="https://github.com/Ravisankar-S/BridgeAI" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 group"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6 text-white group-hover:translate-y-[-2px] transition-transform" />
        </motion.button>
      )}
    </div>
  );
};

export default LandingPage;
