import { useState } from "react";

const today = new Date().toISOString().split("T")[0];

const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl text-gray-800 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition";
const labelCls = "text-xs font-medium text-gray-500 mb-1";

export default function BookingForm({ hotel, room, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    checkInDate: "", checkOutDate: "", bookingFor: "",
    nog: 1, nor: 1, isChildren: false, childrenNumber: 0,
    description: "", cupponCode: "",
  });

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const nights = form.checkInDate && form.checkOutDate
    ? Math.max(0, Math.round((new Date(form.checkOutDate) - new Date(form.checkInDate)) / 86400000))
    : 0;

  const totalAmount = (room.price || room.pricePerNight || 0) * nights * form.nor;
  const finalAmount = totalAmount;
  const price = room.price || room.pricePerNight || 0;

  const isValid = form.checkInDate && form.checkOutDate &&
    form.checkOutDate > form.checkInDate && form.bookingFor.trim() && form.nog > 0;

  const handleSubmit = () => {
    onSubmit({
      checkInDate: new Date(form.checkInDate + "T14:00:00").toISOString(),
      checkOutDate: new Date(form.checkOutDate + "T11:00:00").toISOString(),
      bookingFor: form.bookingFor.trim(),
      nog: Number(form.nog), nor: Number(form.nor),
      isChildren: form.isChildren,
      childrenNumber: form.isChildren ? Number(form.childrenNumber) : 0,
      description: form.description, cupponCode: form.cupponCode,
      totalAmount, finalAmount, discount: 0, numberOfNights: nights,
    });
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Hotel Info */}
      <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
        <div className="font-bold text-gray-800 text-sm">🏨 {hotel.name}</div>
        <div className="text-xs text-emerald-600 font-medium mt-0.5">🛏️ {room.roomType} — ₹{price}/night</div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <label className={labelCls}>Check-in</label>
          <input type="date" min={today} value={form.checkInDate}
            onChange={(e) => set("checkInDate", e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-col">
          <label className={labelCls}>Check-out</label>
          <input type="date" min={form.checkInDate || today} value={form.checkOutDate}
            onChange={(e) => set("checkOutDate", e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Amount */}
      {nights > 0 && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-xs text-emerald-700">
          ₹{price} × {nights} night{nights > 1 ? "s" : ""} × {form.nor} room = <span className="font-bold text-emerald-800">₹{totalAmount}</span>
        </div>
      )}

      {/* Guest Name */}
      <div className="flex flex-col">
        <label className={labelCls}>Guest Name</label>
        <input type="text" placeholder="Booking kis ke liye hai?" value={form.bookingFor}
          onChange={(e) => set("bookingFor", e.target.value)} className={inputCls} />
      </div>

      {/* Guests & Rooms */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <label className={labelCls}>Guests</label>
          <input type="number" min={1} value={form.nog}
            onChange={(e) => set("nog", e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-col">
          <label className={labelCls}>Rooms</label>
          <input type="number" min={1} value={form.nor}
            onChange={(e) => set("nor", e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Children */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
          <input type="checkbox" checked={form.isChildren}
            onChange={(e) => set("isChildren", e.target.checked)}
            className="accent-emerald-500 w-4 h-4" />
          Children aa rahe hain?
        </label>
        {form.isChildren && (
          <input type="number" min={1} placeholder="Kitne?" value={form.childrenNumber}
            onChange={(e) => set("childrenNumber", e.target.value)}
            className="w-20 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400" />
        )}
      </div>

      {/* Special Requests */}
      <div className="flex flex-col">
        <label className={labelCls}>Special Requests (optional)</label>
        <input type="text" placeholder="Koi special request?" value={form.description}
          onChange={(e) => set("description", e.target.value)} className={inputCls} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-1">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={!isValid}
          className="flex-2 flex-[2] py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
