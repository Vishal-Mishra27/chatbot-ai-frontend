import { useState } from "react";

const today = new Date().toISOString().split("T")[0];

export default function BookingForm({ hotel, room, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    checkInDate: "",
    checkOutDate: "",
    bookingFor: "",
    nog: 1,
    nor: 1,
    isChildren: false,
    childrenNumber: 0,
    description: "",
    cupponCode: "",
  });

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const nights =
    form.checkInDate && form.checkOutDate
      ? Math.max(0, Math.round((new Date(form.checkOutDate) - new Date(form.checkInDate)) / 86400000))
      : 0;

  const totalAmount = room.price * nights * form.nor;
  const finalAmount = totalAmount;

  const isValid =
    form.checkInDate &&
    form.checkOutDate &&
    form.checkOutDate > form.checkInDate &&
    form.bookingFor.trim() &&
    form.nog > 0;

  const handleSubmit = () => {
    onSubmit({
      checkInDate: new Date(form.checkInDate + "T14:00:00").toISOString(),
      checkOutDate: new Date(form.checkOutDate + "T11:00:00").toISOString(),
      bookingFor: form.bookingFor.trim(),
      nog: Number(form.nog),
      nor: Number(form.nor),
      isChildren: form.isChildren,
      childrenNumber: form.isChildren ? Number(form.childrenNumber) : 0,
      description: form.description,
      cupponCode: form.cupponCode,
      totalAmount,
      finalAmount,
      discount: 0,
      numberOfNights: nights,
    });
  };

  return (
    <div className="booking-form">
      <div className="bf-hotel-info">
        <span className="bf-hotel-name">🏨 {hotel.name}</span>
        <span className="bf-room-type">
          🛏️ {room.roomType} — ₹{room.price}/night
        </span>
      </div>

      <div className="bf-field">
        <label>Check-in Date</label>
        <input
          type="date"
          min={today}
          value={form.checkInDate}
          onChange={(e) => set("checkInDate", e.target.value)}
        />
      </div>

      <div className="bf-field">
        <label>Check-out Date</label>
        <input
          type="date"
          min={form.checkInDate || today}
          value={form.checkOutDate}
          onChange={(e) => set("checkOutDate", e.target.value)}
        />
      </div>

      {nights > 0 && (
        <div className="bf-amount">
          ₹{room.price} × {nights} night{nights > 1 ? "s" : ""} × {form.nor}{" "}
          room = <strong>₹{totalAmount}</strong>
        </div>
      )}

      <div className="bf-field">
        <label>Guest Name</label>
        <input
          type="text"
          placeholder="Booking kis ke liye hai?"
          value={form.bookingFor}
          onChange={(e) => set("bookingFor", e.target.value)}
        />
      </div>

      <div className="bf-row">
        <div className="bf-field">
          <label>Guests</label>
          <input
            type="number"
            min={1}
            value={form.nog}
            onChange={(e) => set("nog", e.target.value)}
          />
        </div>
        <div className="bf-field">
          <label>Rooms</label>
          <input
            type="number"
            min={1}
            value={form.nor}
            onChange={(e) => set("nor", e.target.value)}
          />
        </div>
      </div>

      <div className="bf-field bf-children-row">
        <label>
          <input
            type="checkbox"
            checked={form.isChildren}
            onChange={(e) => set("isChildren", e.target.checked)}
          />{" "}
          Children aa rahe hain?
        </label>
        {form.isChildren && (
          <input
            type="number"
            min={1}
            placeholder="Kitne?"
            value={form.childrenNumber}
            onChange={(e) => set("childrenNumber", e.target.value)}
          />
        )}
      </div>

      <div className="bf-field">
        <label>Special Requests (optional)</label>
        <input
          type="text"
          placeholder="Koi special request?"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      {/* <div className="bf-field">
        <label>Coupon Code (optional)</label>
        <input
          type="text"
          placeholder="Coupon code"
          value={form.cupponCode}
          onChange={(e) => set("cupponCode", e.target.value)}
        />
      </div> */}

      <div className="bf-actions">
        <button className="bf-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="bf-confirm"
          onClick={handleSubmit}
          disabled={!isValid}
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
