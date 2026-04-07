import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function TestAccountPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSave = () => {
    // Logic to save locally or send to backend
    console.log("Saving Test Account:", { email, password });
    alert("Test account saved successfully!");
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 space-y-8 bg-white rounded-3xl shadow-xl shadow-blue-900/5">
      <div className="space-y-2">
        <label className="text-[15px] font-semibold text-gray-800 tracking-tight">
          Add test account username/email
        </label>
        <div className="relative group">
          <input
            type="text"
            placeholder="Add username/email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl border-2 border-blue-50/50 bg-blue-50/30 group-hover:bg-blue-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 placeholder:text-gray-400 font-medium"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[15px] font-semibold text-gray-800 tracking-tight">
          Add test account password
        </label>
        <div className="relative group">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Add password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 group-hover:bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 placeholder:text-gray-400 font-medium"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            {showPassword ? <EyeOff size={22} strokeWidth={2.5} /> : <Eye size={22} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="w-full bg-[#2563EB] text-white py-4 rounded-2xl font-bold text-[17px] hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-500/30"
      >
        Save Test Account
      </button>

      <div className="pt-4 text-center">
        <p className="text-sm text-gray-400 font-medium">
          Only used for internal testing purposes.
        </p>
      </div>
    </div>
  );
}
