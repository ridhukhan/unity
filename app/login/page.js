'use client'

import { useState } from "react"
import { useRouter } from "next/navigation" // App Router-এর জন্য
import { toast } from "sonner"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem("adminLoggedIn", "true")
        toast.success("লগইন সফল হয়েছে!")
        router.push("/")
        router.refresh() 
      } else {
        toast.error(data.message || "Something went wrong")
      }
    } catch (err) {
      console.error("Login fetch error:", err)
      toast.error("সার্ভারে সমস্যা হয়েছে!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#111",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#fff", margin: 0 }}>
        ADMIN LOGIN
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          padding: "30px",
          background: "#1a1a1a",
          borderRadius: "8px",
          width: "320px",
        }}
      >
        <input
          style={{
            width: "100%",
            padding: "10px",
            margin: "10px 0",
            boxSizing: "border-box",
          }}
          type="email"
          placeholder="write ur email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={{
            width: "100%",
            padding: "10px",
            margin: "10px 0",
            boxSizing: "border-box",
          }}
          type="password"
          placeholder="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#ff4d4d",
            color: "#fff",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
          }}
          disabled={loading}
        >
          {loading ? "submitting..." : "Submit"}
        </button>
      </form>
    </div>
  )
}