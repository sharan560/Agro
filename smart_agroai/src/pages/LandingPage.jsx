import React from "react";

import { Link } from "react-router-dom";

import { motion } from "motion/react";

import { Sprout, Cpu, Droplets, Bug, MessageSquare, ArrowRight, CheckCircle2, TrendingUp, Shield, Zap, Cloud } from "lucide-react";



const LandingPage = () => {

  const features = [

    {

      title: "IoT Monitoring",

      description: "Real-time tracking of soil moisture, temperature, and humidity sensors with precision metrics.",

      icon: Cpu,

      color: "text-blue-500",

      bg: "bg-blue-50/50",

      border: "border-blue-100",

      shadow: "shadow-blue-500/10"

    },

    {

      title: "Automated Irrigation",

      description: "Smart water management system that responds to soil needs automatically using predictive algorithms.",

      icon: Droplets,

      color: "text-cyan-500",

      bg: "bg-cyan-50/50",

      border: "border-cyan-100",

      shadow: "shadow-cyan-500/10"

    },

    {

      title: "AI Disease Detection",

      description: "Identify crop diseases instantly using state-of-the-art computer vision and neural networks.",

      icon: Bug,

      color: "text-rose-500",

      bg: "bg-rose-50/50",

      border: "border-rose-100",

      shadow: "shadow-rose-500/10"

    },

    {

      title: "AI Chatbot Support",

      description: "24/7 multilingual assistant powered by LLMs for expert-level farming advice and troubleshooting.",

      icon: MessageSquare,

      color: "text-purple-500",

      bg: "bg-purple-50/50",

      border: "border-purple-100",

      shadow: "shadow-purple-500/10"

    },

    {

      title: "Yield Prediction",

      description: "Estimate harvests based on historical data and current field conditions for better planning.",

      icon: TrendingUp,

      color: "text-amber-500",

      bg: "bg-amber-50/50",

      border: "border-amber-100",

      shadow: "shadow-amber-500/10"

    },

    {

      title: "Secure Data",

      description: "Your farm data is encrypted and stored securely, ensuring privacy and reliability for your operations.",

      icon: Shield,

      color: "text-emerald-500",

      bg: "bg-emerald-50/50",

      border: "border-emerald-100",

      shadow: "shadow-emerald-500/10"

    },

    {

      title: "Real-time Alerts",

      description: "Get instant notifications for critical soil conditions or weather changes on any device.",

      icon: Zap,

      color: "text-orange-500",

      bg: "bg-orange-50/50",

      border: "border-orange-100",

      shadow: "shadow-orange-500/10"

    },

    {

      title: "Cloud Analytics",

      description: "Comprehensive dashboard with detailed historical analysis and future trend charts.",

      icon: Cloud,

      color: "text-indigo-500",

      bg: "bg-indigo-50/50",

      border: "border-indigo-100",

      shadow: "shadow-indigo-500/10"

    }

  ];



  const stats = [

    { label: "Active Farmers", value: "10K+" },

    { label: "IoT Sensors", value: "50K+" },

    { label: "Prediction Accuracy", value: "98%" },

    { label: "Water Saved", value: "40%" },

  ];



  return (

    <div className="min-h-screen bg-[#fafbfc] font-sans text-slate-900 overflow-x-hidden selection:bg-green-100 selection:text-green-900">

      {/* Navigation */}

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-slate-200/50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">

          <motion.div 

            initial={{ opacity: 0, x: -20 }}

            animate={{ opacity: 1, x: 0 }}

            className="flex items-center gap-2 group cursor-pointer"

          >

            <div className="bg-green-600 p-1.5 rounded-xl group-hover:rotate-12 transition-transform duration-300">

              <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-white" />

            </div>

            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Agro<span className="text-green-600">Ai</span></span>

          </motion.div>

          

          <motion.div 

            initial={{ opacity: 0, x: 20 }}

            animate={{ opacity: 1, x: 0 }}

            className="flex items-center gap-4 sm:gap-10"

          >

            <div className="hidden md:flex items-center gap-4 sm:gap-6 lg:gap-8">

              <a href="#features" className="text-xs sm:text-sm font-bold text-slate-600 hover:text-green-600 transition-colors uppercase tracking-widest">Features</a>

              <a href="#technology" className="text-xs sm:text-sm font-bold text-slate-600 hover:text-green-600 transition-colors uppercase tracking-widest">Technology</a>

              <a href="#contact" className="text-xs sm:text-sm font-bold text-slate-600 hover:text-green-600 transition-colors uppercase tracking-widest">Contact</a>

            </div>

            <div className="h-4 sm:h-6 w-px bg-slate-200 hidden md:block"></div>

            <Link to="/login" className="hidden sm:block text-xs sm:text-sm font-bold text-slate-600 hover:text-green-600 transition-colors">Login</Link>

            <Link to="/signup" className="px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 bg-green-600 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all hover:scale-105 active:scale-95">

              <span className="hidden sm:inline">Start for Free</span>

              <span className="sm:hidden">Start</span>

            </Link>

          </motion.div>

        </div>

      </nav>



      {/* Hero Section */}

      <section className="pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-visible">

        {/* Animated Blobs */}

        <div className="absolute top-0 left-1/4 w-32 sm:w-48 lg:w-96 h-32 sm:h-48 lg:h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-[40px] sm:blur-[60px] lg:blur-[100px] opacity-20 animate-blob"></div>

        <div className="absolute top-0 right-1/4 w-32 sm:w-48 lg:w-96 h-32 sm:h-48 lg:h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-[40px] sm:blur-[60px] lg:blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>

        <div className="absolute bottom-12 sm:bottom-20 lg:bottom-32 left-1/2 w-32 sm:w-48 lg:w-96 h-32 sm:h-48 lg:h-96 bg-rose-300 rounded-full mix-blend-multiply filter blur-[40px] sm:blur-[60px] lg:blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>



        <div className="max-w-7xl mx-auto relative z-10">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-16 items-center">

            {/* Left Content */}

            <motion.div

              initial={{ opacity: 0, x: -50 }}

              animate={{ opacity: 1, x: 0 }}

              transition={{ duration: 0.8, ease: "easeOut" }}

              className="lg:col-span-7 text-center lg:text-left"

            >

              <div className="inline-flex items-center gap-2 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-full bg-green-50 border border-green-100 text-green-700 text-[6px] sm:text-[8px] lg:text-[10px] font-bold uppercase tracking-[0.05em] sm:tracking-[0.1em] lg:tracking-[0.2em] mb-3 sm:mb-4 lg:mb-8 shadow-sm">

                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 lg:h-2.5 lg:w-2.5">

                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>

                  <span className="relative inline-flex rounded-full h-full w-full bg-green-500"></span>

                </span>

                AI-Driven Precision Agriculture

              </div>



              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-slate-900 mb-3 sm:mb-4 lg:mb-6 leading-tight">

                Farming the <br />

                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-indigo-500 animate-gradient">Smart Way</span>

              </h1>

              

              <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 mb-8 sm:mb-12 leading-relaxed font-medium">

                Unleash the power of IoT and Neural Networks to maximize yield and minimize waste. Real-time monitoring with autonomous decision making.

              </p>

              

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6">

                <Link to="/signup" className="w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-slate-900 text-white rounded-xl sm:rounded-[2rem] text-sm sm:text-base lg:text-lg font-bold shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 sm:gap-3 group hover:scale-105 active:scale-95">

                  Get Started <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform" />

                </Link>

                <Link to="/login" className="w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-white/70 backdrop-blur-md border border-slate-200 text-slate-900 rounded-xl sm:rounded-[2rem] text-sm sm:text-base lg:text-lg font-bold hover:bg-white hover:border-green-600 hover:text-green-600 transition-all hover:scale-105 active:scale-95">

                  How it Works

                </Link>

              </div>

            </motion.div>



            {/* Right Animated Image */}

            <motion.div

              initial={{ opacity: 0, scale: 0.8, rotate: 10 }}

              animate={{ opacity: 1, scale: 1, rotate: 0 }}

              transition={{ duration: 1, delay: 0.2 }}

              className="lg:col-span-5 relative hidden lg:block"

            >

              <div className="relative z-10 w-full aspect-square p-2 sm:p-4">

                {/* Background decorative circles */}

                <div className="absolute inset-0 bg-gradient-to-tr from-green-100/40 via-purple-100/40 to-blue-100/40 rounded-full animate-blob"></div>

                <div className="absolute -inset-5 sm:-inset-10 border-2 border-dashed border-slate-200/50 rounded-full animate-[spin_20s_linear_infinite]"></div>

                

                <motion.div

                  animate={{ 

                    y: [0, -20, 0],

                    rotate: [0, 1, 0, -1, 0]

                  }}

                  transition={{ 

                    duration: 5, 

                    repeat: Infinity,

                    ease: "easeInOut" 

                  }}

                  className="relative z-20 w-full h-full rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-[0_30px_60px_-10px_rgba(34,197,94,0.3)] border-4 border-white"

                >

                  <img 

                    src="https://th.bing.com/th/id/OIP.9qRRR3qkprYMnqw9-ZWmmQHaE8?w=246&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3" 

                    alt="Vibrant Healthy Crop" 

                    className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-[3s]"

                    referrerPolicy="no-referrer"

                    onError={(e) => {

                      e.target.src = "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=1200";

                    }}

                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 via-transparent to-transparent"></div>

                  

                  {/* Floating Elements on Image */}

                  <div className="absolute top-4 sm:top-8 left-4 sm:left-8 bg-white/10 backdrop-blur-xl border border-white/20 p-2 sm:p-3 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3">

                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg sm:rounded-xl flex items-center justify-center">

                      <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />

                    </div>

                    <div className="hidden sm:block">

                      <p className="text-white font-bold text-xs">Soil Quality</p>

                      <p className="text-white/80 text-[8px] sm:text-[10px]">Optimal Range</p>

                    </div>

                  </div>

                </motion.div>



                {/* Additional floating icons */}

                <motion.div 

                   animate={{ y: [0, 15, 0] }}

                   transition={{ duration: 4, repeat: Infinity, delay: 1 }}

                   className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-12 h-12 sm:w-20 sm:h-20 bg-amber-100/80 backdrop-blur-xl border border-amber-200 rounded-2xl sm:rounded-3xl flex items-center justify-center p-2 sm:p-4 shadow-xl rotate-12 z-30"

                >

                   <Sprout className="w-6 h-6 sm:w-10 sm:h-10 text-amber-600" />

                </motion.div>



                <motion.div 

                   animate={{ y: [0, -15, 0] }}

                   transition={{ duration: 3, repeat: Infinity }}

                   className="absolute -bottom-4 sm:-bottom-8 -left-4 sm:-left-8 w-16 h-16 sm:w-24 sm:h-24 bg-blue-100/80 backdrop-blur-xl border border-blue-200 rounded-2xl sm:rounded-3xl flex items-center justify-center p-2 sm:p-4 shadow-xl -rotate-12 z-30"

                >

                   <Droplets className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600" />

                </motion.div>

              </div>

            </motion.div>

          </div>

        </div>

      </section>



      {/* Features Section */}

      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[#f8fafc] relative overflow-hidden">

        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[300px] sm:w-[400px] lg:w-[600px] h-[300px] sm:h-[400px] lg:h-[600px] bg-indigo-50 rounded-full blur-2xl sm:blur-3xl opacity-50"></div>

        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[300px] sm:w-[400px] lg:w-[600px] h-[300px] sm:h-[400px] lg:h-[600px] bg-green-50 rounded-full blur-2xl sm:blur-3xl opacity-50"></div>



        <div className="max-w-7xl mx-auto relative z-10">

          <div className="text-center mb-8 sm:mb-12 lg:mb-16">

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-3 sm:mb-4 tracking-tight">Everything You Need</h2>

            <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto px-4">A complete suite of tools designed to take your farming operations to the next level.</p>

          </div>

          

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

            {features.map((feature, idx) => (

              <motion.div

                key={idx}

                initial={{ opacity: 0, y: 30 }}

                whileInView={{ opacity: 1, y: 0 }}

                transition={{ delay: idx * 0.05 }}

                whileHover={{ y: -10 }}

                className={`bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border ${feature.border} shadow-xl ${feature.shadow} transition-all duration-300 group overflow-hidden relative`}

              >

                <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 opacity-0 group-hover:opacity-10 transition-opacity">

                  <feature.icon className={`w-32 h-32 ${feature.color}`} />

                </div>

                

                <div className={`${feature.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 rotate-3 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500`}>

                  <feature.icon className={`w-9 h-9 ${feature.color}`} />

                </div>

                

                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{feature.title}</h3>

                <p className="text-slate-600 text-[15px] leading-relaxed font-medium">

                  {feature.description}

                </p>

                

                <div className="mt-6 flex items-center gap-2 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">

                  <span className={feature.color}>Learn more</span>

                  <ArrowRight className={`w-4 h-4 ${feature.color}`} />

                </div>

              </motion.div>

            ))}

          </div>

        </div>

      </section>



      {/* Visual Section / Technology Section */}

      <section id="technology" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6">

        <div className="max-w-7xl mx-auto overflow-hidden bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] p-4 sm:p-6 lg:p-10 relative shadow-2xl">

          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-green-500/20 via-transparent to-transparent"></div>

          

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center relative z-10">

            <div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 sm:mb-6 leading-tight tracking-tight">Precision Farming <br /> Optimized for You</h2>

              <div className="space-y-4 sm:space-y-6 lg:space-y-8">

                {[

                  { title: "Real-time Metrics", desc: "Live dashboard tracking soil moisture, NPK levels, and solar intensity." },

                  { title: "AI Disease Scanner", desc: "Upload a photo and get instant treatment recommendations." },

                  { title: "Smart Irrigation", desc: "Solenoid valves that open only when soil water potential drops below threshold." },

                ].map((item, i) => (

                  <motion.div 

                    key={i} 

                    initial={{ opacity: 0, x: -20 }}

                    whileInView={{ opacity: 1, x: 0 }}

                    transition={{ delay: i * 0.1 }}

                    className="flex items-start gap-3 sm:gap-4"

                  >

                    <div className="bg-green-500 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shrink-0 mt-1 shadow-lg shadow-green-500/30">

                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />

                    </div>

                    <div>

                      <h4 className="text-lg sm:text-xl font-bold text-white mb-1">{item.title}</h4>

                      <p className="text-slate-400 font-medium leading-relaxed text-sm sm:text-base">{item.desc}</p>

                    </div>

                  </motion.div>

                ))}

              </div>

              <motion.div 

                className="mt-8 sm:mt-12"

                whileInView={{ opacity: 1, y: 0 }}

                initial={{ opacity: 0, y: 20 }}

              >

                <Link to="/signup" className="inline-flex px-8 py-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-400 transition-all shadow-xl shadow-green-500/20 active:scale-95">

                  Start Your Journey

                </Link>

              </motion.div>

            </div>

            

            <div className="relative">

              <motion.div 

                initial={{ scale: 0.8, rotate: -5, opacity: 0 }}

                whileInView={{ scale: 1, rotate: 0, opacity: 1 }}

                transition={{ duration: 0.8 }}

                className="bg-white/5 backdrop-blur-2xl p-4 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden group"

              >

                <div className="relative aspect-video rounded-3xl overflow-hidden">

                  <img 

                    src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=1200" 

                    alt="Smart Farming" 

                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"

                    referrerPolicy="no-referrer"

                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  

                  {/* Floating Notification UI */}

                  <motion.div 

                    initial={{ y: 50, opacity: 0 }}

                    whileInView={{ y: 0, opacity: 1 }}

                    className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl flex items-center justify-between"

                  >

                    <div className="flex items-center gap-3">

                      <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>

                      <p className="text-white font-bold text-sm leading-none">Automated Watering Active</p>

                    </div>

                    <span className="text-white/60 text-xs font-mono">14:32:01</span>

                  </motion.div>

                </div>

              </motion.div>

            </div>

          </div>

        </div>

      </section>



      {/* Integrated Compact Footer with Square Contact Form */}

      <footer id="contact" className="relative bg-slate-900 pt-16 pb-8 overflow-hidden">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-green-500/5 rounded-full blur-[100px] -z-0"></div>

        

        <div className="max-w-7xl mx-auto px-6 relative z-10">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12 items-start">

            {/* Brand Section */}

            <div className="lg:col-span-4">

              <div className="flex items-center gap-2 mb-4">

                <div className="bg-green-600 p-1.5 rounded-lg">

                  <Sprout className="w-5 h-5 text-white" />

                </div>

                <span className="text-xl font-black text-white italic tracking-tighter uppercase">Agro<span className="text-green-500">Ai</span></span>

              </div>

              <p className="text-slate-500 text-sm max-w-xs font-medium mb-8">Empowering the world's farmers with precision AI and IoT technology for a sustainable future.</p>

              

              <div className="flex flex-col gap-4">

                 <p className="text-white font-bold text-xs uppercase tracking-widest">Connect with us</p>

                 <div className="flex items-center gap-4">

                    <a href="mailto:agro@gmail.com" className="text-slate-500 hover:text-green-500 text-xs font-bold transition-colors">agro@gmail.com</a>

                    <span className="text-white/10 text-xs">|</span>

                    <span className="text-slate-500 text-xs font-bold">9876543210</span>

                 </div>

              </div>

            </div>



            {/* Small Square Contact Form */}

            <div className="lg:col-span-5">

               <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl relative overflow-hidden group">

                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-bl-[3rem] -z-0"></div>

                  <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">

                     <MessageSquare className="w-4 h-4 text-green-600" />

                     Quick Message

                  </h4>

                  <form className="space-y-3">

                     <div className="grid grid-cols-2 gap-3">

                        <input type="text" placeholder="Name" className="bg-slate-800/50 border border-slate-700 text-white p-2.5 rounded-xl text-xs focus:outline-none focus:border-green-500 transition-colors w-full" />

                        <input type="email" placeholder="Email" className="bg-slate-800/50 border border-slate-700 text-white p-2.5 rounded-xl text-xs focus:outline-none focus:border-green-500 transition-colors w-full" />

                     </div>

                     <textarea rows="2" placeholder="Your message..." className="bg-slate-800/50 border border-slate-700 text-white p-2.5 rounded-xl text-xs focus:outline-none focus:border-green-500 transition-colors w-full"></textarea>

                     <button className="w-full bg-green-600 text-white p-2.5 rounded-xl text-xs font-bold hover:bg-green-500 transition-all shadow-lg shadow-green-600/10 active:scale-95">

                        Send Now

                     </button>

                  </form>

               </div>

            </div>



            {/* Platform Features Alone */}

            <div className="lg:col-span-3">

               <div>

                  <p className="text-white font-bold text-xs uppercase tracking-widest mb-4">Platform Features</p>

                  <ul className="space-y-3">

                     {["IoT Monitoring", "Yield Prediction", "Disease Detection", "AI Chatbot"].map((item) => (

                        <li key={item}>

                          <a href={`#${item.toLowerCase().replace(" ", "-")}`} className="text-slate-500 hover:text-green-500 text-xs transition-colors font-medium flex items-center gap-2">

                            <div className="w-1.5 h-1.5 rounded-full bg-green-600/40"></div>

                            {item}

                          </a>

                        </li>

                     ))}

                  </ul>

               </div>

            </div>

          </div>



          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">

            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">© 2026 AgroAi Ecosystem</p>

            <div className="flex gap-8">

              <a href="#" className="text-slate-600 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">Privacy</a>

              <a href="#" className="text-slate-600 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">Terms</a>

              <a href="#" className="text-slate-600 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">Support</a>

            </div>

          </div>

        </div>

      </footer>

    </div>

  );

};



export default LandingPage;