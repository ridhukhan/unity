"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Shonchoi() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [biboron, setBiboron] = useState("");
  const [transactions, setTransactions] = useState([
    { date: "", joma: null, uttolon: null, comments: "" },
  ]);

  const checkAdminStatus = async () => {
    try {
      const res = await fetch("/api/me"); 
      const data = await res.json();
      if (data.isAdmin) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      setIsAdmin(false);
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/members");
      const data = await res.json();
      if (data.success) {
        setMembers(data.data);
      }
    } catch (err) {
      console.error("ডেটা লোড করতে সমস্যা হয়েছে:", err);
      toast.error("ডেটা লোড করতে সমস্যা হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
    fetchMembers();
  }, []);

  const handleOpenAddModal = () => {
    if (!isAdmin) {
      toast.error("শুধুমাত্র অ্যাডমিন নতুন মেম্বার যুক্ত করতে পারবেন!");
      return;
    }
    setEditingId(null);
    setName("");
    setBiboron("");
    setTransactions([{ date: "", joma: null, uttolon: null, comments: "" }]);
    setIsModalOpen(true);
  };

  const handleEdit = (member) => {
    if (!isAdmin) {
      toast.error("শুধুমাত্র অ্যাডমিন পরিবর্তন করতে পারবেন!");
      return;
    }
    setEditingId(member._id);
    setName(member.name);
    setBiboron(member.biboron);
    setTransactions(
      member.transactions && member.transactions.length > 0
        ? member.transactions.map((tx) => ({
            date: tx.date || "",
            joma: tx.joma || null,
            uttolon: tx.uttolon || null,
            comments: tx.comments || "",
          }))
        : [{ date: "", joma: null, uttolon: null, comments: "" }]
    );
    setIsModalOpen(true);
  };

  const confirmDelete = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Member deleted successfully");
        fetchMembers();
      } else {
        toast.error("Error: " + data.error);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Delete server problem");
      setLoading(false);
    }
  };

  const handleDeleteMember = (id) => {
    if (!isAdmin) {
      toast.error("শুধুমাত্র অ্যাডমিন ডিলিট করতে পারবেন!");
      return;
    }
    toast("are you sure?", {
      action: {
        label: "yes",
        onClick: () => confirmDelete(id),
      },
      cancel: {
        label: "cancel",
      },
    });
  };

  const calculateMemberTotal = (txList) => {
    return txList.reduce(
      (acc, curr) => acc + (Number(curr.joma) || 0) - (Number(curr.uttolon) || 0),
      0
    );
  };

  const calculateGrandTotal = () => {
    return members.reduce((acc, member) => {
      return acc + calculateMemberTotal(member.transactions || []);
    }, 0);
  };

  const addTransactionRow = () => {
    setTransactions([
      ...transactions,
      { date: "", joma: null, uttolon: null, comments: "" },
    ]);
  };

  const removeTransactionRow = (index) => {
    if (transactions.length === 1) {
      toast.warning("at least 1 input required");
      return;
    }
    const updated = transactions.filter((_, i) => i !== index);
    setTransactions(updated);
  };

  const handleTransactionChange = (index, field, value) => {
    const updated = [...transactions];
    updated[index][field] = value;
    setTransactions(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !biboron) {
      toast.warning("নাম এবং বিবরণ পূরণ করুন!");
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
        toast.success(
          editingId ? "Update success" : "নতুন মেম্বার যুক্ত হয়েছে!"
        );
        setIsModalOpen(false);
        fetchMembers();
      } else {
        toast.error("ত্রুটি: " + data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Saving problem");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 text-black pt-20">
      <nav className="font-bold bg-yellow-500 text-center text-3xl md:text-4xl rounded-lg shadow-md mt-3 p-2 border-2 border-black">
        <h1>সঞ্চয় হিসাব</h1>
      </nav>

      <div className="text-center mt-4 text-xl md:text-2xl font-bold bg-white p-3 rounded-lg border-2 border-black shadow-sm">
        <h1>
          মোট জমা:{" "}
          {loading ? (
            <span className="text-gray-500">checking...</span>
          ) : (
            `${calculateGrandTotal()} ৳`
          )}
        </h1>
      </div>

      {isAdmin && (
        <div className="flex justify-center my-6">
          <button
            onClick={handleOpenAddModal}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-3xl w-14 h-14 rounded-full border-2 border-black flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105"
            title="add new member"
          >
            +
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 font-bold text-lg">
          data loading plz wait ...
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-10 text-gray-600 font-medium bg-white rounded-lg border-2 border-black shadow-sm p-4 mt-6">
          No User found
        </div>
      ) : (
        <div className="space-y-8 mt-6">
          {members.map((member) => {
            const currentTotal = calculateMemberTotal(member.transactions || []);
            return (
              <div key={member._id} className="w-full border-2 border-black bg-white rounded-lg overflow-x-auto shadow-md">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-black bg-white">
                      <th colSpan={4} className="border-b-2 border-black p-3 text-left">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="font-bold text-lg">নাম: {member.name}</span>
                          
                          {isAdmin && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(member)}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs md:text-sm px-3 py-1 rounded-md border border-black cursor-pointer shadow-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMember(member._id)}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs md:text-sm px-3 py-1 rounded-md border border-black cursor-pointer shadow-sm"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </th>
                    </tr>

                    <tr className="border-b-2 border-black bg-white">
                      <th colSpan={4} className="border-b-2 border-black p-3 text-left whitespace-pre-wrap font-medium">
                        <span className="font-bold">বিবরণ:</span> {member.biboron}
                      </th>
                    </tr>

                    <tr className="border-b-2 border-black bg-gray-100 text-center text-sm md:text-base">
                      <th className="border-r-2 border-black p-2 w-1/4">তারিখ</th>
                      <th className="border-r-2 border-black p-2 w-1/4">জমা</th>
                      <th className="border-r-2 border-black p-2 w-1/4">উত্তোলন</th>
                      <th className="p-2 w-1/4">Comments</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(member.transactions || []).map((tx, idx) => (
                      <tr key={idx} className="text-center text-sm md:text-base border-b border-black">
                        <td className="border-r-2 border-black p-2">{tx.date}</td>
                        <td className="border-r-2 border-black p-2">{tx.joma}</td>
                        <td className="border-r-2 border-black p-2">{tx.uttolon}</td>
                        <td className="p-2 whitespace-pre-wrap text-left md:text-center">
                          {tx.comments}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr>
                      <th
                        colSpan={4}
                        className="border-t-2 border-black p-3 text-center bg-yellow-500 font-bold text-lg"
                      >
                        মোট: {currentTotal}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          })}
        </div>
      )}

      {/* POPUP MODAL (Add / Edit) */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg border-2 border-black w-full max-w-2xl p-5 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold text-center mb-4 border-b-2 border-black pb-2">
              {editingId ? "মেম্বার তথ্য ও ট্রানজেকশন পরিবর্তন করুন" : "নতুন মেম্বার ও ট্রানজেকশন ফর্ম"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block font-bold mb-1">নাম:</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-2 border-black p-2 rounded-md focus:outline-none shadow-sm text-base"
                    placeholder="মেম্বারের নাম লিখুন"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">বিবরণ:</label>
                  <textarea
                    required
                    rows={2}
                    value={biboron}
                    onChange={(e) => setBiboron(e.target.value)}
                    className="w-full border-2 border-black p-2 rounded-md focus:outline-none shadow-sm resize-y text-base"
                    placeholder="বিবরণ লিখুন (Enter চেপে নতুন লাইন নিতে পারেন)"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border-2 border-black rounded-lg mt-4 shadow-sm">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="bg-gray-200 border-b-2 border-black text-sm md:text-base">
                      <th className="border-r-2 border-black p-2">তারিখ</th>
                      <th className="border-r-2 border-black p-2">জমা</th>
                      <th className="border-r-2 border-black p-2">উত্তোলন</th>
                      <th className="border-r-2 border-black p-2">Comments</th>
                      <th className="p-2 w-10">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, index) => (
                      <tr key={index} className="border-b border-black">
                        <td className="border-r border-black p-1 align-top">
                          <input
                            type="text"
                            required
                            placeholder="1/9/2026"
                            value={tx.date}
                            onChange={(e) =>
                              handleTransactionChange(index, "date", e.target.value)
                            }
                            className="w-full p-1.5 border border-gray-400 rounded text-center text-base"
                          />
                        </td>
                        <td className="border-r border-black p-1 align-top">
                          <input
                            type="number"
                            value={tx.joma ?? ""}
                            onChange={(e) =>
                              handleTransactionChange(
                                index,
                                "joma",
                                e.target.value === "" ? null : Number(e.target.value)
                              )
                            }
                            className="w-full p-1.5 border border-gray-400 rounded text-center text-base"
                          />
                        </td>
                        <td className="border-r border-black p-1 align-top">
                          <input
                            type="number"
                            value={tx.uttolon ?? ""}
                            onChange={(e) =>
                              handleTransactionChange(
                                index,
                                "uttolon",
                                e.target.value === "" ? null : Number(e.target.value)
                              )
                            }
                            className="w-full p-1.5 border border-gray-400 rounded text-center text-base"
                          />
                        </td>
                        <td className="border-r border-black p-1 align-top">
                          <textarea
                            rows={1}
                            placeholder="মন্তব্য"
                            value={tx.comments}
                            onChange={(e) =>
                              handleTransactionChange(
                                index,
                                "comments",
                                e.target.value
                              )
                            }
                            className="w-full p-1.5 border border-gray-400 rounded text-base resize-y"
                          />
                        </td>
                        <td className="p-1 align-top">
                          <button
                            type="button"
                            onClick={() => removeTransactionRow(index)}
                            className="text-red-600 font-bold hover:bg-red-100 px-2 py-1 rounded border border-red-400"
                            title="Remove input"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center mt-3">
                <button
                  type="button"
                  onClick={addTransactionRow}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xl px-4 py-1 rounded-full border-2 border-black cursor-pointer shadow-sm"
                  title="Add more input"
                >
                  +
                </button>
              </div>

              <div className="bg-yellow-500 text-center font-bold text-lg p-2 border-2 border-black rounded-md mt-3 shadow-sm">
                মোট: {calculateMemberTotal(transactions)}
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border-2 border-black rounded-md font-bold hover:bg-gray-200 cursor-pointer shadow-sm"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-black border-2 border-black font-bold rounded-md cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}