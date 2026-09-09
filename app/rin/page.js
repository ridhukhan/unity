"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Rin() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [name, setName] = useState("");
  const [ashol, setAshol] = useState(0);
  const [lab, setLab] = useState(0);
  const [date, setDate] = useState("");
  const [biboron, setBiboron] = useState("");
  const [transactions, setTransactions] = useState([
    { date: "", joma: 0, comments: "" },
  ]);

  const checkAdminStatus = async () => {
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
      setIsAdmin(!!data.isAdmin);
    } catch (err) {
      setIsAdmin(false);
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rinmembers");
      const data = await res.json();
      if (data.success) {
        setMembers(data.data);
      }
    } catch (err) {
      toast.error("ডেটা লোড করতে সমস্যা হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
    fetchMembers();
  }, []);

  // হিসাব সম্পর্কিত গণনা
  const calculateTotalAdai = (txList = []) => {
    return txList.reduce((acc, curr) => acc + (Number(curr.joma) || 0), 0);
  };

  const calculateOboshisto = (asholVal, txList = []) => {
    return (Number(asholVal) || 0) - calculateTotalAdai(txList);
  };

  const calculateGrandOboshisto = () => {
    return members.reduce((acc, member) => {
      return acc + calculateOboshisto(member.ashol, member.transactions);
    }, 0);
  };

  // Modal handlers
  const handleOpenAddModal = () => {
    if (!isAdmin) return;
    setEditingId(null);
    setName("");
    setAshol(0);
    setLab(0);
    setDate("");
    setBiboron("");
    setTransactions([{ date: "", joma: null, comments: "" }]);
    setIsModalOpen(true);
  };

  const handleEdit = (member) => {
    if (!isAdmin) return;
    setEditingId(member._id);
    setName(member.name);
    setAshol(member.ashol || null);
    setLab(member.lab || null);
    setDate(member.date || "");
    setBiboron(member.biboron || "");
    setTransactions(
      member.transactions && member.transactions.length > 0
        ? member.transactions.map((t) => ({
            date: t.date || "",
            joma: t.joma || null,
            comments: t.comments || "",
          }))
        : [{ date: "", joma: null, comments: "" }]
    );
    setIsModalOpen(true);
  };

  const confirmDelete = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rinmembers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Delete successfully");
        fetchMembers();
      } else {
        toast.error("ত্রুটি: " + data.error);
        setLoading(false);
      }
    } catch (err) {
      toast.error("সার্ভার সমস্যা!");
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (!isAdmin) return;
    toast("are you sure", {
      action: { label: "yes", onClick: () => confirmDelete(id) },
      cancel: { label: "no" },
    });
  };

  const handleTransactionChange = (index, field, value) => {
    const updated = [...transactions];
    updated[index][field] = value;
    setTransactions(updated);
  };

  const addTransactionRow = () => {
    setTransactions([...transactions, { date: "", joma: null, comments: "" }]);
  };

  const removeTransactionRow = (index) => {
    if (transactions.length === 1) {
      toast.warning("atleast one input needed");
      return;
    }
    setTransactions(transactions.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !biboron || !date) {
      toast.warning("নাম, তারিখ এবং বিবরণ প্রদান করুন!");
      return;
    }
    setSubmitting(true);
    try {
      const url = editingId ? `/api/rinmembers/${editingId}` : "/api/rinmembers";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          ashol: Number(ashol),
          lab: Number(lab),
          date,
          biboron,
          transactions,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? "update success" : "নতুন তথ্য সংরক্ষিত হয়েছে");
        setIsModalOpen(false);
        fetchMembers();
      } else {
        toast.error("ত্রুটি: " + data.error);
      }
    } catch (err) {
      toast.error("had a problem!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 text-black pt-18">
      {/* Header */}
      <nav className="font-bold bg-yellow-500 text-center text-3xl md:text-4xl rounded-lg shadow-md mt-3 p-2 border-2 border-black">
        <h1>ঋণ হিসাব</h1>
      </nav>

      <div className="text-center mt-4 text-xl md:text-2xl font-bold bg-white p-3 rounded-lg border-2 border-black shadow-sm">
        <h1>
          অবশিষ্ট ঋণ:{" "}
          {loading ? (
            <span className="text-gray-500">loading...</span>
          ) : (
            `${calculateGrandOboshisto()} ৳`
          )}
        </h1>
      </div>

      {/* Add Button */}
      {isAdmin && (
        <div className="flex justify-center my-6">
          <button
            onClick={handleOpenAddModal}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-3xl w-14 h-14 rounded-full border-2 border-black flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105"
            title="add a new data"
          >
            +
          </button>
        </div>
      )}

      {/* Members Cards/Tables */}
      {loading ? (
        <div className="text-center py-10 font-bold text-lg">data loading...</div>
      ) : members.length === 0 ? (
        <div className="text-center py-10 text-gray-600 font-medium bg-white rounded-lg border-2 border-black shadow-sm p-4 mt-6">
          no data found
        </div>
      ) : (
        <div className="space-y-8 mt-6">
          {members.map((member) => {
            const oboshisto = calculateOboshisto(member.ashol, member.transactions);
            return (
              <div key={member._id} className="w-full border-2 border-black bg-white rounded-lg overflow-x-auto shadow-md">
                <table className="w-full text-black border-collapse">
                  <thead>
                    {/* Row 1: Name & Actions */}
                    <tr className="border-b-2 border-black bg-white">
                      <th colSpan={3} className="border-2 border-black p-3 text-left text-xl font-bold">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <div className="w-full text-left">নাম:{member.name}</div>
                          {isAdmin && (
                            <div className="flex gap-2 absolute right-6">
                              <button
                                onClick={() => handleEdit(member)}
                                className="bg-blue-500 text-white font-bold text-xs px-2 py-1 rounded border border-black"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(member._id)}
                                className="bg-red-500 text-white font-bold text-xs px-2 py-1 rounded border border-black"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </th>
                    </tr>
                    {/* Row 2: Ashol, Lab, Date */}
                    <tr className="border-b-2 border-black bg-white text-sm md:text-base">
                      <th className="border-2 border-black p-2 w-1/3">আসল - {member.ashol}</th>
                      <th className="border-2 border-black p-2 w-1/3">লাভ - {member.lab}</th>
                      <th className="border-2 border-black p-2 w-1/3">তারিখ - {member.date}</th>
                    </tr>
                    {/* Row 3: Biboron */}
                    <tr className="border-b-2 border-black bg-white">
                      <th colSpan={3} className="border-2 border-black p-3 text-left font-normal whitespace-pre-wrap">
                        <span className="font-bold">বিবরণ:</span> {member.biboron}
                      </th>
                    </tr>
                    {/* Row 4: Transaction Headers */}
                    <tr className="border-b-2 border-black bg-gray-100 text-center text-sm md:text-base font-bold">
                      <th className="border-2 border-black p-2 w-1/3">তারিখ</th>
                      <th className="border-2 border-black p-2 w-1/3">আদায়</th>
                      <th className="border-2 border-black p-2 w-1/3">comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(member.transactions || []).map((tx, idx) => (
                      <tr key={idx} className="text-center text-sm md:text-base border-b border-black">
                        <td className="border-2 border-black p-2">{tx.date}</td>
                        <td className="border-2 border-black p-2">{tx.joma}</td>
                        <td className="border-2 border-black p-2 text-left md:text-center whitespace-pre-wrap">
                          {tx.comments}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th
                        colSpan={3}
                        className="border-t-2 border-black p-3 text-center bg-yellow-500 font-bold text-lg"
                      >
                        অবশিষ্ট : {oboshisto}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          })}
        </div>
      )}

      {/* POPUP MODAL */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 pt-10 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg border-2 border-black w-full max-w-2xl p-5 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold text-center mb-4 border-b-2 border-black pb-2">
              {editingId ? "ঋণ তথ্য সম্পাদনা" : "নতুন ঋণ যুক্ত করার ফর্ম"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-bold mb-1">Enter name:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-2 border-black p-2 rounded-md"
                  placeholder="নাম লিখুন"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold mb-1">আসল:</label>
                  <input
                    type="number"
                    value={ashol}
                    onChange={(e) => setAshol(Number(e.target.value))}
                    className="w-full border-2 border-black p-2 rounded-md text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">লাভ:</label>
                  <input
                    type="number"
                    value={lab}
                    onChange={(e) => setLab(Number(e.target.value))}
                    className="w-full border-2 border-black p-2 rounded-md text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">তারিখ:</label>
                  <input
                    type="text"
                    required
                    placeholder="১/৯/২৬"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border-2 border-black p-2 rounded-md text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">বিবরণ লিখুন:</label>
                <textarea
                  required
                  rows={2}
                  value={biboron}
                  onChange={(e) => setBiboron(e.target.value)}
                  className="w-full border-2 border-black p-2 rounded-md resize-y"
                />
              </div>

              {/* Transactions Dynamic Rows */}
              <div className="overflow-x-auto border-2 border-black rounded-lg mt-4">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="bg-gray-200 border-b-2 border-black">
                      <th className="border-r-2 border-black p-2">তারিখ</th>
                      <th className="border-r-2 border-black p-2">আদায়</th>
                      <th className="border-r-2 border-black p-2">comment</th>
                      <th className="p-2 w-10">✕</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, index) => (
                      <tr key={index} className="border-b border-black">
                        <td className="border-r border-black p-1">
                          <input
                            type="text"
                            required
                            placeholder="১/১০/২৬"
                            value={tx.date}
                            onChange={(e) =>
                              handleTransactionChange(index, "date", e.target.value)
                            }
                            className="w-full p-1.5 border border-gray-400 rounded text-center"
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
                            className="w-full p-1.5 border border-gray-400 rounded text-center"
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
                            className="w-full p-1.5 border border-gray-400 rounded"
                          />
                        </td>
                        <td className="p-1">
                          <button
                            type="button"
                            onClick={() => removeTransactionRow(index)}
                            className="text-red-600 font-bold px-2 py-1"
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
                  title="আদায় ইনপুট যোগ করুন"
                >
                  +
                </button>
              </div>

              <div className="bg-yellow-500 text-center font-bold text-lg p-2 border-2 border-black rounded-md mt-3 shadow-sm">
                অবশিষ্ট =&gt; {calculateOboshisto(ashol, transactions)}
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border-2 border-black rounded-md font-bold hover:bg-gray-200 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-black border-2 border-black font-bold rounded-md cursor-pointer disabled:opacity-50"
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