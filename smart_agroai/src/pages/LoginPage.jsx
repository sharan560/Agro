import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { motion } from "motion/react";

import { Sprout, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

import { useAuth } from "../context/AuthContext";

import api from "../lib/api";



const LoginPage = () => {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const { login } = useAuth();

  const navigate = useNavigate();



  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    setError("");

    

    try {

      // Add timeout to prevent hanging

      const timeoutPromise = new Promise((_, reject) => {

        setTimeout(() => reject(new Error('Login request timeout - backend may be sleeping')), 30000);

      });

      

      const res = await Promise.race([

        api.post("/api/auth/login", { email, password }),

        timeoutPromise

      ]);

      

      login(res.data.token, res.data.user);

      navigate("/app/dashboard");

    } catch (err) {

      if (err.message === 'Login request timeout - backend may be sleeping') {

        setError("Login timeout - backend is waking up. Please try again in 30 seconds.");

      } else if (err.code === 'ERR_NETWORK') {

        setError("Cannot connect to server. Please check your internet connection.");

      } else {

        setError(err.response?.data?.message || "Login failed. Please check your credentials.");

      }

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">

      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-green-100/40 via-transparent to-transparent -z-10"></div>

      

      <motion.div

        initial={{ opacity: 0, scale: 0.95 }}

        animate={{ opacity: 1, scale: 1 }}

        transition={{ duration: 0.4 }}

        className="w-full max-w-md bg-white rounded-[20px] sm:rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-8 lg:p-10"

      >

        <div className="text-center mb-6 sm:mb-8 lg:mb-10">

          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-50 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">

            <Sprout className="w-6 h-6 sm:w-8 sm:w-10 text-green-600" />

          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>

          <p className="text-slate-500 mt-1 sm:mt-2 font-medium text-sm sm:text-base">Log in to manage your smart farm</p>

        </div>



        {error && (

          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">

            <AlertCircle className="w-5 h-5 flex-shrink-0" />

            {error}

          </div>

        )}



        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

          <div className="space-y-2">

            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>

            <div className="relative group">

              <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-focus-within:text-green-600 transition-colors" />

              <input

                type="email"

                required

                value={email}

                onChange={(e) => setEmail(e.target.value)}

                placeholder="farmer@example.com"

                className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-4 focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all text-slate-900 font-medium text-sm sm:text-base"

              />

            </div>

          </div>



          <div className="space-y-2">

            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>

            <div className="relative group">

              <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-focus-within:text-green-600 transition-colors" />

              <input

                type="password"

                required

                value={password}

                onChange={(e) => setPassword(e.target.value)}

                placeholder="••••••••"

                className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-4 focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all text-slate-900 font-medium text-sm sm:text-base"

              />

            </div>

          </div>



          <div className="flex items-center justify-between px-1">

            {/* Removed Remember me and Forgot Password features */}

          </div>



          <button

            type="submit"

            disabled={loading}

            className="w-full bg-slate-900 text-white rounded-xl sm:rounded-2xl py-3 sm:py-4 font-bold text-base sm:text-lg shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"

          >

            {loading ? <Loader2 className="w-4 h-4 sm:w-6 sm:h-6 animate-spin" /> : "Log In"}

            {!loading && <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />}

          </button>

        </form>



        <div className="mt-10 text-center">

          <p className="text-slate-500 font-medium">

            Don't have an account?{" "}

            <Link to="/signup" className="text-green-600 font-bold hover:text-green-700 transition-colors">Sign Up</Link>

          </p>

        </div>

      </motion.div>

    </div>

  );

};



export default LoginPage;

