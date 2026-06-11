import { useState, useRef, useEffect } from "react";
import HotelCards from "./HotelCards";
import BookingFlow from "./BookingFlow";
import BookingForm from "./BookingForm";

const BASE_URL2 = "https://chatbot-ai-backend-t7xb.onrender.com";
const BASE_URL = "https://root.roombookkro.com/api";

export default function ChatUI() {
  const [userId, setUserId] = useState("");
  const [userIdInput, setUserIdInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Namaste! 🙏 Main aapka hotel booking assistant hoon. Kaise madad kar sakta hoon?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingState, setBookingState] = useState(null);
  const [bookingStep, setBookingStep] = useState(null);
  const [paymentSession, setPaymentSession] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramUserId = params.get("userId");
    if (paramUserId) setUserId(paramUserId);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocation({ lat: null, lng: null }),
      { timeout: 10000, enableHighAccuracy: false, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, bookingStep]);

  const addAssistantMsg = (content, extra = {}) =>
    setMessages((prev) => [...prev, { role: "assistant", content, ...extra }]);

  const isSearchIntent = (text) => {
    if (bookingStep) return false;
    const keywords = [
      "hotel dhundho", "hotel dikhao", "rooms dikhao", "nearby hotel", "hotels near",
      "search hotel", "koi hotel", "hotel chahiye", "available rooms", "paas mein",
      "najdik", "nazdeek", "aas paas", "nearest hotel", "find hotel", "show hotel",
      "hotels near me", "hotel near me", "nearby hotels", "available hotel",
      "show me hotel", "find me hotel", "look for hotel", "search for hotel",
      "any hotel", "hotel available",
    ];
    return keywords.some((k) => text.toLowerCase().includes(k));
  };

  const fetchLocation = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => { const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setLocation(loc); resolve(loc); },
        (err) => { console.warn("Geolocation error:", err.code, err.message); resolve(null); },
        { timeout: 10000, enableHighAccuracy: false, maximumAge: 60000 }
      );
    });

  const handleSearch = async (keyword, locOverride = null) => {
    const loc = locOverride || location;
    if (!loc?.lat || !loc?.lng) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Location access chahiye hotels dikhane ke liye.", locationBtn: true, pendingKeyword: keyword }]);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({ lat: loc.lat, lng: loc.lng, userId, keyword });
      const res = await fetch(`${BASE_URL}/search?${params}`);
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: "Yeh hotels mile aapke aas paas:", hotels: data.data }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Hotel search mein error aaya. Dobara try karein." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = async (pendingKeyword) => {
    setMessages((prev) => prev.map((m) => m.locationBtn ? { ...m, locationBtn: false } : m));
    addAssistantMsg("📍 Location fetch ho rahi hai...");
    const loc = await fetchLocation();
    if (loc?.lat && loc?.lng) {
      await handleSearch(pendingKeyword, loc);
    } else {
      addAssistantMsg("Location access nahi mila. App/browser settings mein location permission allow karein.", { locationBtn: true, pendingKeyword });
    }
  };

  const handleRoomSelect = (hotel, room) => {
    setSelectedRoom({ hotel, room });
    setBookingState({ userId, token: "", residencyId: hotel.residencyId, roomId: room.roomId, pricePerNight: room.price, hotelName: hotel.name, roomType: room.roomType });
    setBookingStep("form");
  };

  const handleFormSubmit = (formData) => {
    const updatedState = { ...bookingState, ...formData };
    setBookingState(updatedState);
    setBookingStep("payment_method");
    addAssistantMsg(
      `✅ Details mil gayi!\n🏨 ${updatedState.hotelName} — ${updatedState.roomType}\n📅 Check-in: ${formData.checkInDate.split("T")[0]}\n📅 Check-out: ${formData.checkOutDate.split("T")[0]}\n👤 Guest: ${formData.bookingFor}\n🛏️ Rooms: ${formData.nor} | Guests: ${formData.nog}\n🌙 ${formData.numberOfNights} night(s) × ₹${bookingState.pricePerNight} = ₹${formData.finalAmount}\n\nPayment method chunein:`,
      { bookingStep: "payment_method" }
    );
  };

  const handleFormCancel = () => {
    setBookingStep(null); setBookingState(null); setSelectedRoom(null);
    addAssistantMsg("Booking cancel kar di gayi. Koi aur madad chahiye?");
  };

  const handlePayAtHotel = async () => {
    setBookingStep(null); setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/placeorder`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingState }),
      });
      const data = await res.json();
      if (data.success) {
        setBookingStep("done");
        addAssistantMsg(`✅ Booking Confirmed!\n🏨 Hotel: ${bookingState.hotelName}\n🛏️ Room: ${bookingState.roomType}\n👤 Guest: ${bookingState.bookingFor}\n📅 Check-in: ${bookingState.checkInDate.split("T")[0]}\n📅 Check-out: ${bookingState.checkOutDate.split("T")[0]}\n💰 Amount: ₹${bookingState.finalAmount}\n💳 Payment: Pay at Hotel\n🔖 Order ID: ${data.orderId}`);
        setBookingState(null); setSelectedRoom(null);
      } else {
        addAssistantMsg(data.error || "Order place karne mein error aaya.");
        setBookingStep("payment_method");
      }
    } catch {
      addAssistantMsg("Order place karne mein error aaya. Dobara try karein.");
      setBookingStep("payment_method");
    } finally { setLoading(false); }
  };

  const handleOnlinePayment = async () => {
    setBookingStep(null); setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/user/add_wallet`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount: bookingState.finalAmount, token: "" }),
      });
      const data = await res.json();
      if (data.payment_session_id) {
        setPaymentSession({ payment_link: data.payment_link, order_id: data.order_id });
        setBookingStep("online_payment");
        setLoading(false);
        const cashfree = new window.Cashfree({ mode: "sandbox" });
        const result = await cashfree.checkout({ paymentSessionId: data.payment_session_id, redirectTarget: "_modal" });
        const paymentStatus = result?.paymentDetails?.paymentStatus;
        if (paymentStatus === "SUCCESS") {
          setLoading(true); setBookingStep(null);
          const verifyRes = await fetch(`${BASE_URL2}/booking/verify-and-place`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingState, cashfreeOrderId: data.order_id }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.status === "PAID" && verifyData.success) {
            setBookingStep("done");
            addAssistantMsg(`✅ Booking Confirmed!\n🏨 Hotel: ${bookingState.hotelName}\n🛏️ Room: ${bookingState.roomType}\n👤 Guest: ${bookingState.bookingFor}\n📅 Check-in: ${bookingState.checkInDate.split("T")[0]}\n📅 Check-out: ${bookingState.checkOutDate.split("T")[0]}\n💰 Amount: ₹${bookingState.finalAmount}\n💳 Payment: Online Paid\n🔖 Order ID: ${verifyData.orderId}`);
            setBookingState(null); setSelectedRoom(null); setPaymentSession(null);
          } else {
            addAssistantMsg(verifyData.error || "Booking place karne mein error aaya.");
            setBookingStep("payment_method");
          }
        } else if (paymentStatus === "FAILED") {
          addAssistantMsg("❌ Payment failed ho gaya. Dobara try karein?", { bookingStep: "payment_method" });
          setBookingStep("payment_method");
        } else {
          addAssistantMsg("Payment abhi complete nahi hua. Dobara try karein.", { bookingStep: "online_payment", paymentLink: data.payment_link });
          setBookingStep("online_payment");
        }
      } else {
        addAssistantMsg(data.error || "Payment session banana mein error aaya.");
        setBookingStep("payment_method");
      }
    } catch {
      addAssistantMsg("Payment session banana mein error aaya. Dobara try karein.");
      setBookingStep("payment_method");
    } finally { setLoading(false); }
  };

  const handlePaymentDone = async () => {
    setBookingStep(null); setLoading(true);
    try {
      const res = await fetch(`${BASE_URL2}/booking/verify-and-place`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingState, cashfreeOrderId: paymentSession.order_id }),
      });
      const data = await res.json();
      if (data.status === "PAID" && data.success) {
        setBookingStep("done");
        addAssistantMsg(`✅ Booking Confirmed!\n🏨 Hotel: ${bookingState.hotelName}\n🛏️ Room: ${bookingState.roomType}\n👤 Guest: ${bookingState.bookingFor}\n📅 Check-in: ${bookingState.checkInDate.split("T")[0]}\n📅 Check-out: ${bookingState.checkOutDate.split("T")[0]}\n💰 Amount: ₹${bookingState.finalAmount}\n💳 Payment: Online Paid\n🔖 Order ID: ${data.orderId}`);
        setBookingState(null); setSelectedRoom(null); setPaymentSession(null);
      } else if (data.status === "EXPIRED") {
        addAssistantMsg(data.message); await handleOnlinePayment();
      } else if (data.status === "FAILED") {
        addAssistantMsg(data.message); setBookingStep("payment_method");
      } else {
        addAssistantMsg(data.message || "Payment abhi complete nahi hua."); setBookingStep("online_payment");
      }
    } catch {
      addAssistantMsg("Payment verify karne mein error aaya."); setBookingStep("online_payment");
    } finally { setLoading(false); }
  };

  const handleCancelPayment = () => {
    setBookingStep(null); setBookingState(null); setSelectedRoom(null); setPaymentSession(null);
    addAssistantMsg("Booking cancel kar di gayi. Koi aur madad chahiye?");
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    if (bookingStep === "form" || bookingStep === "payment_method" || bookingStep === "online_payment") return;
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    if (isSearchIntent(trimmed)) { await handleSearch(trimmed); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL2}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, userId, token: "" }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || data.error }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error: Could not reach server." }]);
    } finally { setLoading(false); }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── User ID Screen ──────────────────────────────────────────────
  if (!userId) {
    return (
      <div className="min-h-screen min-h-dvh bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center gap-6 border border-gray-100">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">🏨</div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800">Hotel Booking Assistant</h1>
            <p className="text-sm text-gray-400 mt-1">Apna User ID enter karein</p>
          </div>
          <input
            type="text" value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && userIdInput.trim() && setUserId(userIdInput.trim())}
            placeholder="User ID..."
            className="w-full border-2 border-gray-100 focus:border-emerald-400 rounded-2xl px-4 py-3 text-sm outline-none transition text-gray-800 bg-gray-50"
          />
          <button
            onClick={() => userIdInput.trim() && setUserId(userIdInput.trim())}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl transition-colors text-sm shadow-md"
          >
            Start Chat →
          </button>
        </div>
      </div>
    );
  }

  // ── Main Chat ───────────────────────────────────────────────────
  return (
    <div className="bg-gray-50 flex items-start justify-center fixed inset-0">
      <div className="w-full max-w-md h-[96%] sm:h-[680px] sm:rounded-3xl sm:shadow-2xl bg-white flex flex-col overflow-hidden border border-gray-100 sm:relative">

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-4 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-xl">🏨</div>
          <div className="flex-1">
            <div className="text-white font-bold text-sm">Hotel Booking Assistant</div>
            <div className="text-emerald-100 text-xs">Online · Ready to help</div>
          </div>
          <div className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">ID: {userId}</div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-gray-50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 bg-emerald-500 rounded-xl flex items-center justify-center text-sm mr-2 mt-0.5 shrink-0">🏨</div>
              )}
              <div className={`max-w-[80%] ${msg.role === "user"
                ? "bg-emerald-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5"
                : "bg-white text-gray-800 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm border border-gray-100"
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.hotels && <HotelCards hotels={msg.hotels} onSelectRoom={handleRoomSelect} />}
                {msg.locationBtn && (
                  <button onClick={() => handleGetLocation(msg.pendingKeyword)}
                    className="mt-2 flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                    📍 Get My Location
                  </button>
                )}
                {msg.bookingStep && (
                  <BookingFlow
                    step={msg.bookingStep}
                    paymentLink={msg.paymentLink}
                    onPayAtHotel={i === messages.length - 1 ? handlePayAtHotel : null}
                    onOnlinePayment={i === messages.length - 1 ? handleOnlinePayment : null}
                    onPaymentDone={i === messages.length - 1 ? handlePaymentDone : null}
                    onCancel={i === messages.length - 1 ? handleCancelPayment : null}
                  />
                )}
              </div>
            </div>
          ))}

          {/* Booking Form */}
          {bookingStep === "form" && selectedRoom && (
            <div className="flex justify-start">
              <div className="w-7 h-7 bg-emerald-500 rounded-xl flex items-center justify-center text-sm mr-2 mt-0.5 shrink-0">🏨</div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 w-full max-w-[85%]">
                <BookingForm hotel={selectedRoom.hotel} room={selectedRoom.room} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
              </div>
            </div>
          )}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 bg-emerald-500 rounded-xl flex items-center justify-center text-sm mr-2 shrink-0">🏨</div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-white border-t border-gray-100 shrink-0">
          {bookingStep && bookingStep !== "done" && bookingStep !== "form" ? (
            <div className="text-center text-xs text-gray-400 py-2">
              {bookingStep === "payment_method" ? "⬆️ Payment method chunein" : "⬆️ Upar se action karein"}
            </div>
          ) : (
            <div className="flex gap-2 items-end">
              <textarea
                rows={1} value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Message likhein..."
                disabled={bookingStep === "form"}
                className="flex-1 resize-none bg-gray-50 border border-gray-200 focus:border-emerald-400 rounded-2xl px-4 py-2.5 text-sm outline-none transition text-gray-800 max-h-24 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !!bookingStep}
                className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 rotate-0">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
