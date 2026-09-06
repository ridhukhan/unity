"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Edit State
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [name, setName] = useState("");
  const [biboron, setBiboron] = useState("");
  const [transactions, setTransactions] = useState([
    { date: "", joma: 0, uttolon: 0, comments: "" },
  ]);

  // Fetch Members from Database
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/members");
      const data = await res.json();
      if (data.success) {
        setMembers(data.data);
      }
    } catch (err) {
      console.error("ডেটা লোড করতে সমস্যা হয়েছে:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Open Modal for New Member
  const handleOpenAddModal = () => {
    setEditingId(null);
    setName("");
    setBiboron("");
    setTransactions([{ date: "", joma: 0, uttolon: 0, comments: "" }]);
    setIsModalOpen(true);
  };

  // Open Modal for Editing Existing Member
  const handleEdit = (member) => {
    setEditingId(member._id);
    setName(member.name);
    setBiboron(member.biboron);
    setTransactions(
      member.transactions.length > 0
        ? member.transactions.map((tx) => ({
            date: tx.date || "",
            joma: tx.joma || 0,
            uttolon: tx.uttolon || 0,
            comments: tx.comments || "",
          }))
        : [{ date: "", joma: 0, uttolon: 0, comments: "" }]
    );
    setIsModalOpen(true);
  };

  // Delete Member
  const handleDeleteMember = async (id) => {
    if (!confirm("আপনি কি নিশ্চিত যে আপনি এই মেম্বারের পুরো তথ্য মুছে ফেলতে চান?")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchMembers();
      } else {
        alert("ডিলিট করতে ত্রুটি: " + data.error);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("ডিলিট করতে সমস্যা হয়েছে");
      setLoading(false);
    }
  };

  // Calculate Member Total (Joma - Uttolon)
  const calculateMemberTotal = (txList) => {
    return txList.reduce(
      (acc, curr) => acc + (Number(curr.joma) || 0) - (Number(curr.uttolon) || 0),
      0
    );
  };

  // Calculate Grand Total of all Members
  const calculateGrandTotal = () => {
    return members.reduce((acc, member) => {
      return acc + calculateMemberTotal(member.transactions || []);
    }, 0);
  };

  // Add new transaction row inside Popup Modal
  const addTransactionRow = () => {
    setTransactions([
      ...transactions,
      { date: "", joma: 0, uttolon: 0, comments: "" },
    ]);
  };

  // Remove individual transaction row inside Popup Modal
  const removeTransactionRow = (index) => {
    if (transactions.length === 1) {
      alert("কমপক্ষে একটি ট্রানজেকশন সারি থাকতে হবে!");
      return;
    }
    const updated = transactions.filter((_, i) => i !== index);
    setTransactions(updated);
  };

  // Handle Input Changes inside Modal Table
  const handleTransactionChange = (index, field, value) => {
    const updated = [...transactions];
    updated[index][field] = value;
    setTransactions(updated);
  };

  // Save (Create or Update) Handler
  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !biboron) {
      alert("নাম এবং বিবরণ পূরণ করুন!");
      return;
    }
    setSubmitting(true);
    try {
      const url = editingId ? `/api/members/${editingId}` : "/api/members";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, biboron, transactions }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchMembers();
      } else {
        alert("ত্রুটি: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("সেভ করতে ব্যর্থ হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 text-black">
      {/* Navbar */}
      <nav className="font-bold bg-yellow-500 text-center text-3xl md:text-4xl rounded mt-3 p-2 border-2 border-black">
        <h1>সঞ্চয় হিসাব</h1>
      </nav>

      {/* Total Joma Header */}
      <div className="text-center mt-4 text-xl md:text-2xl font-bold">
        <h1>
          মোট জমা:{" "}
          {loading ? (
            <span className="text-gray-500">লোডিং...</span>
          ) : (
            `${calculateGrandTotal().toFixed(2)} ৳`
          )}
        </h1>
      </div>

      {/* Add New Entry Button (+) */}
      <div className="flex justify-center my-4">
        <button
          onClick={handleOpenAddModal}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-3xl w-12 h-12 rounded-full border-2 border-black flex items-center justify-center shadow-md cursor-pointer transition-all"
          title="নতুন এন্ট্রি যোগ করুন"
        >
          +
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="text-center py-10 font-bold text-lg">
          ডেটা লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-10 text-gray-600 font-medium">
          কোনো তথ্য পাওয়া যায়নি। নতুন এন্ট্রি যোগ করতে উপরের '+' বাটনে ক্লিক করুন।
        </div>
      ) : (
        <div className="space-y-8">
          {members.map((member) => {
            const currentTotal = calculateMemberTotal(member.transactions || []);
            return (
              <div key={member._id} className="overflow-x-auto">
                <table className="border-2 border-black w-full text-black border-collapse">
                  <thead>
                    {/* Name Header with Edit & Delete Buttons */}
                    <tr className="border-b-2 border-black bg-gray-100">
                      <th colSpan={4} className="border-2 border-black p-2 text-left">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="font-bold">নাম: {member.name}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(member)}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs md:text-sm px-3 py-1 rounded border border-black cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member._id)}
                              className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs md:text-sm px-3 py-1 rounded border border-black cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </th>
                    </tr>

                    {/* Biboron Header */}
                    <tr className="border-b-2 border-black bg-gray-100">
                      <th colSpan={4} className="border-2 border-black p-2 text-left">
                        বিবরণ: {member.biboron}
                      </th>
                    </tr>

                    {/* Column Headers */}
                    <tr className="border-b-2 border-black bg-gray-200 text-center text-sm md:text-base">
                      <th className="border-2 border-black p-2 w-1/4">তারিখ</th>
                      <th className="border-2 border-black p-2 w-1/4">জমা</th>
                      <th className="border-2 border-black p-2 w-1/4">উত্তোলন</th>
                      <th className="border-2 border-black p-2 w-1/4">Comments</th>
                    </tr>
                  </thead>

                  {/* Transaction Rows */}
                  <tbody>
                    {member.transactions.map((tx, idx) => (
                      <tr key={idx} className="text-center text-sm md:text-base border-b border-black">
                        <td className="border-2 border-black p-2">{tx.date}</td>
                        <td className="border-2 border-black p-2">{tx.joma}</td>
                        <td className="border-2 border-black p-2">{tx.uttolon}</td>
                        <td className="border-2 border-black p-2">{tx.comments}</td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Individual Total */}
                  <tfoot>
                    <tr>
                      <th
                        colSpan={4}
                        className="border-2 border-black p-2 text-center bg-yellow-500 font-bold text-lg"
                      >
                        TOTAL: {currentTotal}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Floating/Fixed Add Button */}
      {members.length > 0 && !loading && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleOpenAddModal}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-3xl w-12 h-12 rounded-full border-2 border-black flex items-center justify-center shadow-md cursor-pointer"
          >
            +
          </button>
        </div>
      )}

      {/* POPUP MODAL (Add / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg border-2 border-black w-full max-w-2xl p-4 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-center mb-4 border-b-2 border-black pb-2">
              {editingId ? "মেম্বার তথ্য ও ট্রানজেকশন পরিবর্তন করুন" : "নতুন মেম্বার ও ট্রানজেকশন ফর্ম"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Member Basic Info Inputs */}
              <div className="space-y-2">
                <div>
                  <label className="block font-bold mb-1">নাম:</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-2 border-black p-2 rounded focus:outline-none"
                    placeholder="মেম্বারের নাম লিখুন"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">বিবরণ:</label>
                  <input
                    type="text"
                    required
                    value={biboron}
                    onChange={(e) => setBiboron(e.target.value)}
                    className="w-full border-2 border-black p-2 rounded focus:outline-none"
                    placeholder="বিবরণ লিখুন"
                  />
                </div>
              </div>

              {/* Responsive Transaction Inputs Table */}
              <div className="overflow-x-auto border-2 border-black mt-4">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="bg-gray-200 border-b-2 border-black text-sm md:text-base">
                      <th className="border-r-2 border-black p-2">তারিখ</th>
                      <th className="border-r-2 border-black p-2">জমা</th>
                      <th className="border-r-2 border-black p-2">উত্তোলন</th>
                      <th className="border-r-2 border-black p-2">Comments</th>
                      <th className="p-2 w-10">মুছুন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, index) => (
                      <tr key={index} className="border-b border-black">
                        <td className="border-r border-black p-1">
                          <input
                            type="text"
                            required
                            placeholder="1/9/2026"
                            value={tx.date}
                            onChange={(e) =>
                              handleTransactionChange(index, "date", e.target.value)
                            }
                            className="w-full p-1 border border-gray-400 rounded text-center text-sm"
                          />
                        </td>
                        <td className="border-r border-black p-1">
                          <input
                            type="number"
                            value={tx.joma}
                            onChange={(e) =>
                              handleTransactionChange(
                                index,
                                "joma",
                                Number(e.target.value)
                              )
                            }
                            className="w-full p-1 border border-gray-400 rounded text-center text-sm"
                          />
                        </td>
                        <td className="border-r border-black p-1">
                          <input
                            type="number"
                            value={tx.uttolon}
                            onChange={(e) =>
                              handleTransactionChange(
                                index,
                                "uttolon",
                                Number(e.target.value)
                              )
                            }
                            className="w-full p-1 border border-gray-400 rounded text-center text-sm"
                          />
                        </td>
                        <td className="border-r border-black p-1">
                          <input
                            type="text"
                            placeholder="মন্তব্য"
                            value={tx.comments}
                            onChange={(e) =>
                              handleTransactionChange(
                                index,
                                "comments",
                                e.target.value
                              )
                            }
                            className="w-full p-1 border border-gray-400 rounded text-center text-sm"
                          />
                        </td>
                        <td className="p-1">
                          <button
                            type="button"
                            onClick={() => removeTransactionRow(index)}
                            className="text-red-600 font-bold hover:bg-red-100 px-2 py-0.5 rounded border border-red-400"
                            title="সারি সরান"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add More Row Button */}
              <div className="flex justify-center mt-2">
                <button
                  type="button"
                  onClick={addTransactionRow}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xl px-3 py-1 rounded-full border-2 border-black cursor-pointer"
                  title="আরও ট্রানজেকশন সারি যোগ করুন"
                >
                  +
                </button>
              </div>

              {/* Live Total Calculation inside Popup */}
              <div className="bg-yellow-500 text-center font-bold text-lg p-2 border-2 border-black mt-2">
                TOTAL: {calculateMemberTotal(transactions)}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border-2 border-black rounded font-bold hover:bg-gray-200 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black border-2 border-black font-bold rounded cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "সেভ হচ্ছে..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}