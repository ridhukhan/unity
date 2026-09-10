'use client'

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

function EnterOtpContent() {
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error("ইমেইল অ্যাড্রেস পাওয়া যায়নি! পুনরায় চেষ্টা করুন।")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/enterotp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success("OTP সফলভাবে যাচাই হয়েছে!")
        router.push(`/newpass?email=${encodeURIComponent(email)}&token=${data.resetToken}`)
      } else {
        toast.error(data.message || "ভুল OTP দিয়েছেন")
      }
    } catch (err) {
      console.error("OTP error:", err)
      toast.error("সার্ভারে সমস্যা হয়েছে!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-wider">
          Enter OTP Code
        </h1>
        <p className="text-xs text-slate-400">Sent to: {email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 mt-8">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
            Enter OTP
          </label>
          <input
            type="text"
            maxLength={4}
            placeholder="xxxx"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/80 text-white text-center tracking-widest text-lg rounded-lg border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all placeholder:text-slate-500 font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  )
}

export default function EnterOtp() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 font-sans">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <EnterOtpContent />
      </Suspense>
    </div>
  )
}