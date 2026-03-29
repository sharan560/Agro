import React from "react";

import { Bell, User, Search, Menu } from "lucide-react";

import { useAuth } from "../context/AuthContext";



const Header = ({ onMenuClick }) => {

  const { user } = useAuth();



  return (

    <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shadow-sm">

      {/* Mobile Menu Button */}

      <button

        onClick={onMenuClick}

        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"

      >

        <Menu className="w-6 h-6 text-slate-600" />

      </button>



      {/* Search Bar - Hidden on Mobile */}

      <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 w-96">

        <Search className="w-5 h-5 text-slate-400" />

        <input

          type="text"

          placeholder="Search sensor data, crops..."

          className="bg-transparent border-none focus:ring-0 text-slate-600 placeholder:text-slate-400 w-full"

        />

      </div>



      {/* Right Section */}

      <div className="flex items-center gap-4 lg:gap-6">

        {/* Mobile Search */}

        <div className="lg:hidden flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">

          <Search className="w-4 h-4 text-slate-400" />

          <input

            type="text"

            placeholder="Search..."

            className="bg-transparent border-none focus:ring-0 text-slate-600 placeholder:text-slate-400 w-24 text-sm"

          />

        </div>



        {/* Notifications */}

        <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">

          <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-slate-600" />

          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>

        </button>



        {/* User Info */}

        <div className="flex items-center gap-2 lg:gap-3 pl-4 lg:pl-6 border-l border-slate-200">

          <div className="text-right hidden sm:block">

            <p className="text-sm font-bold text-slate-900">{user?.name || "Farmer User"}</p>

            <p className="text-xs text-slate-500 font-medium hidden lg:block">{user?.email || "user@smartfarm.com"}</p>

          </div>

          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-500 shadow-sm">

            <User className="w-4 h-4 lg:w-6 lg:h-6 text-green-600" />

          </div>

        </div>

      </div>

    </header>

  );

};



export default Header;

