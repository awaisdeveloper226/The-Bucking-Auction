"use client";
import { useState } from "react";
import { Pencil, Trash2, Upload, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function LotManagement() {
  const [lots, setLots] = useState([
    {
      id: "1",
      title: "Lot #1 - Bull Calf",
      description: "Strong bloodline, excellent genetics.",
      abbi: "AB12345",
      sire: "Sire Bull A",
      dam: "Dam Cow B",
      startingBid: 500,
      photo: "https://via.placeholder.com/80",
      video: "",
    },
    {
      id: "2",
      title: "Lot #2 - Yearling Heifer",
      description: "Healthy yearling with strong growth potential.",
      abbi: "AB67890",
      sire: "Sire Bull X",
      dam: "Dam Cow Y",
      startingBid: 700,
      photo: "https://via.placeholder.com/80",
      video: "",
    },
  ]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    abbi: "",
    sire: "",
    dam: "",
    startingBid: "",
    photo: "",
    video: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addLot = () => {
    if (!form.title) return;
    setLots([...lots, { id: Date.now().toString(), ...form, startingBid: Number(form.startingBid) }]);
    setForm({ title: "", description: "", abbi: "", sire: "", dam: "", startingBid: "", photo: "", video: "" });
  };

  const deleteLot = (id) => setLots(lots.filter((lot) => lot.id !== id));

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(lots);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setLots(reordered);
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-2xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold mb-4">Lot Management</h2>

      {/* Bulk Upload */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-3 gap-2">
        <label className="block font-medium">Bulk Upload (Excel)</label>
        <input type="file" accept=".xlsx,.xls" className="p-2 border rounded-lg w-full sm:w-auto" />
        <button className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition w-full sm:w-auto">
          <Upload className="mr-2" size={18} /> Upload
        </button>
      </div>

      {/* Lot Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Lot Title"
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
        />
        <input
          type="text"
          name="abbi"
          value={form.abbi}
          onChange={handleChange}
          placeholder="ABBI #"
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
        />
        <input
          type="text"
          name="sire"
          value={form.sire}
          onChange={handleChange}
          placeholder="Sire"
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
        />
        <input
          type="text"
          name="dam"
          value={form.dam}
          onChange={handleChange}
          placeholder="Dam"
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
        />
        <input
          type="number"
          name="startingBid"
          value={form.startingBid}
          onChange={handleChange}
          placeholder="Starting Bid"
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
        />
        <input
          type="text"
          name="photo"
          value={form.photo}
          onChange={handleChange}
          placeholder="Photo URL"
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
        />
        <input
          type="text"
          name="video"
          value={form.video}
          onChange={handleChange}
          placeholder="Video URL"
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
        />
      </div>

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        rows={3}
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4"
      />

      <button
        onClick={addLot}
        className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Add Lot
      </button>

      {/* Lot List with Drag & Drop */}
      <div className="mt-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="lots">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {lots.map((lot, index) => (
                  <Draggable key={lot.id} draggableId={lot.id} index={index}>
                    {(provided) => (
                      <div
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                        className="flex flex-col md:flex-row md:items-center md:justify-between w-full p-4 bg-gray-50 rounded-lg border shadow-sm hover:bg-gray-100 transition"
                      >
                        <div className="flex items-start md:items-center md:space-x-4 w-full md:w-auto flex-wrap">
                          <div {...provided.dragHandleProps} className="cursor-grab text-gray-500 mb-2 md:mb-0">
                            <GripVertical size={20} />
                          </div>
                          <img src={lot.photo} alt={lot.title} className="w-20 h-20 object-cover rounded mb-2 md:mb-0" />
                          <div className="flex-1 min-w-[150px]">
                            <h3 className="font-bold">{lot.title}</h3>
                            <p className="text-sm text-gray-600">
                              ABBI: {lot.abbi} | {lot.sire} × {lot.dam}
                            </p>
                            <p className="text-sm text-gray-700">Starting Bid: ${lot.startingBid}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2 md:mt-0">
                          <button className="text-blue-500 hover:text-blue-700">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => deleteLot(lot.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
