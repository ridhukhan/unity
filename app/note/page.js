"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function NoteComponent() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  // অ্যাডমিন স্ট্যাটাস যাচাই
  const checkAdminStatus = async () => {
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
      if (data.isAdmin) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        toast.error("only admin allow this page");
        router.push("/");
      }
    } catch (err) {
      setIsAdmin(false);
    }
  };

  // ডাটাবেজ থেকে নোট ফেচ করা
  const fetchNote = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/note");
      const data = await res.json();
      if (res.ok) {
        setText(data.text || "");
      } else {
        toast.error("নোট লোড করতে সমস্যা হয়েছে!");
      }
    } catch (err) {
      console.error(err);
      toast.error("সার্ভার সমস্যা!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
    fetchNote();
  }, []);

  // নোট সেভ করার ফাংশন
  const handleSave = async () => {
    if (!isAdmin) {
      toast.error("শুধুমাত্র অ্যাডমিন নোট সেভ করতে পারবেন!");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Note Save Success!");
        setIsEditing(false); // সেভ হওয়ার পর এডিট মোড বন্ধ হবে
      } else {
        toast.error(data.error || "Note didn't save!");
      }
    } catch (err) {
      console.error(err);
      toast.error("সেভ করতে সমস্যা হয়েছে!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full h-screen bg-white text-black p-0 flex flex-col pt-10">
      {/* ছোট হেডার বার (একদম ওপরে) */}
      <div className="flex justify-between items-center bg-yellow-500 border-b border-black px-4 py-1.5 shadow-sm mb-2">
        <h1 className="text-sm md:text-base font-bold">নোটপ্যাড (Note)</h1>

        {/* শুধুমাত্র অ্যাডমিনদের জন্য এডিট ও সেভ বাটন */}
        {isAdmin && (
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1 rounded border border-black transition-transform active:scale-95 cursor-pointer"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-black font-semibold text-xs px-2.5 py-1 rounded border border-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-3 py-1 rounded border border-black transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* টেক্সট এরিয়া এলাকা (বর্ডার ছাড়া সম্পূর্ণ স্ক্রিন জুড়ে) */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center font-bold text-gray-500 text-base">
          নোট লোড হচ্ছে...
        </div>
      ) : (
        <div className="flex-1 w-full h-full">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            readOnly={!isEditing}
            placeholder={
              isAdmin ? "write ur note..." : "no note available।"
            }
            className={`w-full h-full p-4 bg-white text-black font-medium text-base md:text-lg border-none focus:outline-none resize-none overflow-y-auto whitespace-pre-wrap ${
              !isEditing ? "cursor-not-allowed bg-white" : ""
            }`}
          />
        </div>
      )}
    </div>
  );
}