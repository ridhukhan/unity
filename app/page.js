'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"

export default function HOME() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)

  const CLOUD_NAME = "dfzaefrkt"
  const UPLOAD_PRESET = "radakrishna"

  const [founders, setFounders] = useState([
    { id: 1, name: "প্রতিষ্ঠাতা ১", image: "https://placehold.co/150" },
    { id: 2, name: "প্রতিষ্ঠাতা ২", image: "https://placehold.co/150" },
  ])

  const [directors, setDirectors] = useState([
    { id: 1, name: "পরিচালক ১", image: "https://placehold.co/150" },
    { id: 2, name: "পরিচালক ২", image: "https://placehold.co/150" },
    { id: 3, name: "পরিচালক ৩", image: "https://placehold.co/150" },
  ])

  const [partners, setPartners] = useState([
    { id: 1, name: "অংশীদার ১", image: "https://placehold.co/150" },
    { id: 2, name: "অংশীদার ২", image: "https://placehold.co/150" },
    { id: 3, name: "অংশীদার ৩", image: "https://placehold.co/150" },
    { id: 4, name: "অংশীদার ৪", image: "https://placehold.co/150" },
    { id: 5, name: "অংশীদার ৫", image: "https://placehold.co/150" },
    { id: 6, name: "অংশীদার ৬", image: "https://placehold.co/150" },
    { id: 7, name: "অংশীদার ৭", image: "https://placehold.co/150" },
    { id: 8, name: "অংশীদার ৮", image: "https://placehold.co/150" },
    { id: 9, name: "অংশীদার ৯", image: "https://placehold.co/150" },
  ])

  useEffect(() => {
    // 1. Auth Endpoint থেকে কুকি চেক করা
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.isAdmin) {
          setIsAdmin(true)
        }
      })
      .catch((err) => console.log("Auth verification error:", err))

    // 2. MongoDB থেকে ডাটা ফেচ করা
    fetch("/api/management")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.data) {
          if (data.data.founders && data.data.founders.length > 0) setFounders(data.data.founders)
          if (data.data.directors && data.data.directors.length > 0) setDirectors(data.data.directors)
          if (data.data.partners && data.data.partners.length > 0) setPartners(data.data.partners)
        }
      })
      .catch((err) => console.log("Data fetch error:", err))
  }, [])

  // MongoDB-তে ডাটা সেভ করার ফাংশন
  const saveToDatabase = async (updatedFounders, updatedDirectors, updatedPartners) => {
    try {
      const res = await fetch("/api/management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          founders: updatedFounders,
          directors: updatedDirectors,
          partners: updatedPartners,
        }),
      })
      const result = await res.json()
      if (!result.success) {
        toast.error("ডাটাবেজে সেভ করতে সমস্যা হয়েছে!")
      }
    } catch (err) {
      console.error("Save error:", err)
      toast.error("ডাটা সেভ করতে ব্যর্থ হয়েছে!")
    }
  }

  // নাম পরিবর্তন করার জন্য
  const handleNameChange = (category, index, newName) => {
    if (category === "founders") {
      const updated = [...founders]
      updated[index].name = newName
      setFounders(updated)
      saveToDatabase(updated, directors, partners)
    } else if (category === "directors") {
      const updated = [...directors]
      updated[index].name = newName
      setDirectors(updated)
      saveToDatabase(founders, updated, partners)
    } else if (category === "partners") {
      const updated = [...partners]
      updated[index].name = newName
      setPartners(updated)
      saveToDatabase(founders, directors, updated)
    }
  }

  // Cloudinary Image Upload & DB Update
  const handleImageUpload = async (e, category, index) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    const toastId = toast.loading("ছবি আপলোড হচ্ছে...")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", UPLOAD_PRESET)

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (res.ok && data.secure_url) {
        const imageUrl = data.secure_url

        let newFounders = [...founders]
        let newDirectors = [...directors]
        let newPartners = [...partners]

        if (category === "founders") {
          newFounders[index].image = imageUrl
          setFounders(newFounders)
        } else if (category === "directors") {
          newDirectors[index].image = imageUrl
          setDirectors(newDirectors)
        } else if (category === "partners") {
          newPartners[index].image = imageUrl
          setPartners(newPartners)
        }

        await saveToDatabase(newFounders, newDirectors, newPartners)
        toast.success("ছবি সফলভাবে আপলোড ও সেভ হয়েছে!", { id: toastId })
      } else {
        toast.error("আপলোড ব্যর্থ হয়েছে! Unsigned Preset চেক করুন।", { id: toastId })
      }
    } catch (err) {
      toast.error("নেটওয়ার্ক ত্রুটি হয়েছে!", { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  // নতুন অংশীদার যুক্ত করার জন্য
  const handleAddPartner = () => {
    const newPartnersList = [
      ...partners,
      {
        id: partners.length + 1,
        name: `অংশীদার ${partners.length + 1}`,
        image: "https://placehold.co/150",
      },
    ]
    setPartners(newPartnersList)
    saveToDatabase(founders, directors, newPartnersList)
    toast.success("নতুন অংশীদার যুক্ত করা হয়েছে!")
  }

  // অংশীদার মুছে ফেলার জন্য
  const handleDeletePartner = (index) => {
    if (confirm("আপনি কি নিশ্চিত যে এই অংশীদারকে মুছে ফেলতে চান?")) {
      const updatedPartners = partners.filter((_, idx) => idx !== index)
      setPartners(updatedPartners)
      saveToDatabase(founders, directors, updatedPartners)
      toast.success("অংশীদার মুছে ফেলা হয়েছে!")
    }
  }

  return (
    <div className="bg-slate-900 min-h-screen text-white flex flex-col pt-10 justify-between font-sans pb-24">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 shadow-lg py-6 text-center px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-2">
          <img
            src="https://res.cloudinary.com/dfzaefrkt/image/upload/v1787029233/WhatsApp_Image_2026-08-18_at_10.56.30_AM_s2jtbp.jpg"
            alt="Logo"
            className="rounded-full h-16 w-16 object-cover border-2 border-cyan-600 shadow-md"
          />
          <h1 className="font-extrabold text-2xl md:text-4xl text-amber-400 tracking-wide">
            রাধা-কৃষ্ণ সেবা সংঘ
          </h1>
        </div>
        <h3 className="text-cyan-400 text-sm md:text-base font-semibold">(একটি ধর্মীয় সেবামূলক সংগঠন)</h3>
        <p className="text-slate-400 text-xs md:text-sm mt-1">প্রতিষ্ঠাকাল - ২১/০৫/২০০৭</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-12">
        
        {/* ১. প্রতিষ্ঠাতা */}
        <section className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-amber-400 mb-6 border-b border-slate-700 pb-2 inline-block px-6">
            প্রতিষ্ঠাতা
          </h2>
          <div className="flex justify-center items-center gap-6 sm:gap-12 flex-wrap">
            {founders.map((item, idx) => (
              <div key={item.id || idx} className="group relative flex flex-col items-center">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-cyan-500 to-amber-400 shadow-xl group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full rounded-full object-cover border-2 border-slate-900"
                  />
                </div>

                {isAdmin ? (
                  <div className="mt-2 flex flex-col gap-1 w-full max-w-[140px]">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleNameChange("founders", idx, e.target.value)}
                      className="bg-slate-800 text-cyan-300 text-xs text-center border border-slate-700 rounded px-1 py-0.5 focus:outline-none focus:border-cyan-400"
                    />
                    <label className="text-[10px] bg-cyan-600 hover:bg-cyan-700 text-white py-0.5 px-2 rounded cursor-pointer transition text-center font-semibold">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={loading}
                        onChange={(e) => handleImageUpload(e, "founders", idx)}
                      />
                    </label>
                  </div>
                ) : (
                  <span className="mt-3 text-sm sm:text-base font-semibold text-slate-200">{item.name}</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ২. পরিচালনায় */}
        <section className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-amber-400 mb-6 border-b border-slate-700 pb-2 inline-block px-6">
            পরিচালনায়
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-lg mx-auto">
            {directors.map((item, idx) => (
              <div key={item.id || idx} className="group flex flex-col items-center">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full rounded-full object-cover border-2 border-slate-900"
                  />
                </div>

                {isAdmin ? (
                  <div className="mt-2 flex flex-col gap-1 w-full">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleNameChange("directors", idx, e.target.value)}
                      className="bg-slate-800 text-emerald-300 text-xs text-center border border-slate-700 rounded px-1 py-0.5 focus:outline-none focus:border-emerald-400"
                    />
                    <label className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white py-0.5 px-2 rounded cursor-pointer transition text-center font-semibold">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={loading}
                        onChange={(e) => handleImageUpload(e, "directors", idx)}
                      />
                    </label>
                  </div>
                ) : (
                  <span className="mt-2 text-xs sm:text-sm font-medium text-slate-300">{item.name}</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ৩. অংশীদারবৃন্দ */}
        <section className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-amber-400 mb-6 border-b border-slate-700 pb-2 inline-block px-6">
            অংশীদারবৃন্দ
          </h2>
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xl mx-auto">
            {partners.map((item, idx) => (
              <div key={item.id || idx} className="group flex flex-col items-center">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-amber-500 to-red-500 shadow-md group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full rounded-full object-cover border-2 border-slate-900"
                  />
                </div>

                {isAdmin ? (
                  <div className="mt-1 flex flex-col gap-1 w-full">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleNameChange("partners", idx, e.target.value)}
                      className="bg-slate-800 text-amber-300 text-[10px] text-center border border-slate-700 rounded px-1 py-0.5 focus:outline-none"
                    />
                    <div className="flex gap-1 justify-center">
                      <label className="flex-1 text-[9px] bg-amber-600 hover:bg-amber-700 text-slate-900 font-bold py-0.5 px-1 rounded cursor-pointer transition text-center">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={loading}
                          onChange={(e) => handleImageUpload(e, "partners", idx)}
                        />
                      </label>
                      <button
                        onClick={() => handleDeletePartner(idx)}
                        className="text-[9px] bg-red-600 hover:bg-red-700 text-white font-bold py-0.5 px-1.5 rounded transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="mt-1 text-xs font-medium text-slate-300">{item.name}</span>
                )}
              </div>
            ))}

            {isAdmin && (
              <div
                onClick={handleAddPartner}
                className="flex flex-col items-center justify-center cursor-pointer group"
              >
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-2 border-dashed border-slate-500 group-hover:border-amber-400 flex items-center justify-center transition-colors bg-slate-800/50">
                  <span className="text-3xl text-slate-400 group-hover:text-amber-400 font-bold">+</span>
                </div>
                <span className="mt-2 text-xs font-semibold text-slate-400 group-hover:text-amber-400">
                  নতুন যুক্ত করুন
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Note Section */}
        {isAdmin && (
          <section className="flex justify-center pt-4">
            <Link href="/note" className="group w-full max-w-sm">
              <div className="bg-slate-800 border border-amber-500/50 rounded-2xl p-6 text-center shadow-xl hover:border-amber-400 hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <span className="text-3xl">📌</span>
                </div>
                <h3 className="text-2xl font-bold text-amber-400 mb-2">NOTE</h3>
                <p className="text-slate-400 text-sm">ব্যক্তিগত নোট তৈরি ও আপডেট করুন</p>
              </div>
            </Link>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-800/50 border-t border-slate-800 py-4 text-center text-slate-500 text-xs">
        <p>© {new Date().getFullYear()} radakrishna foundation. All rights reserved.</p>
      </footer>
    </div>
  )
}