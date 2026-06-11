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
    { role: "assistant", content: "Hi! I'm your AI assistant. How can I help you?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingState, setBookingState] = useState(null);
  const [bookingStep, setBookingStep] = useState(null); // null | 'form' | 'payment_method' | 'online_payment' | 'done'
  const [paymentSession, setPaymentSession] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocation({ lat: null, lng: null })
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
      "najdik", "nazdeek", "aas paas",
      "nearest hotel", "find hotel", "show hotel", "hotels near me", "hotel near me",
      "nearby hotels", "available hotel", "show me hotel", "find me hotel", "look for hotel",
      "search for hotel", "any hotel", "hotel available",
    ];
    return keywords.some((k) => text.toLowerCase().includes(k));
  };

  const fetchLocation = () =>
    new Promise((resolve) =>
      navigator.geolocation?.getCurrentPosition(
        (pos) => { const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setLocation(loc); resolve(loc); },
        () => resolve(null)
      )
    );

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
      console.log("res hostel:",res)
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
    const loc = await fetchLocation();
    if (loc) await handleSearch(pendingKeyword, loc);
    else addAssistantMsg("Location access nahi mila. Browser settings mein location allow karein.");
  };

  // Room select → show booking form
  const handleRoomSelect = (hotel, room) => {
    setSelectedRoom({ hotel, room });
    setBookingState({ userId, token: "", residencyId: hotel.residencyId, roomId: room.roomId, pricePerNight: room.price, hotelName: hotel.name, roomType: room.roomType });
    setBookingStep("form");
  };

  // Form submitted → go to payment method
  const handleFormSubmit = (formData) => {
    const updatedState = { ...bookingState, ...formData };
    setBookingState(updatedState);
    setBookingStep("payment_method");
    addAssistantMsg(
      `\u2705 Details mil gayi!\n\ud83c\udfe8 ${updatedState.hotelName} \u2014 ${updatedState.roomType}\n\ud83d\udcc5 Check-in: ${formData.checkInDate.split("T")[0]}\n\ud83d\udcc5 Check-out: ${formData.checkOutDate.split("T")[0]}\n\ud83d\udc64 Guest: ${formData.bookingFor}\n\ud83d\udecc Rooms: ${formData.nor} | Guests: ${formData.nog}\n\ud83c\udfe8 ${formData.numberOfNights} night(s) \u00d7 \u20b9${formData.price} = \u20b9${formData.finalAmount}\n\nPayment method chunein:`,
      { bookingStep: "payment_method" },
    );
  };

  const handleFormCancel = () => {
    setBookingStep(null);
    setBookingState(null);
    setSelectedRoom(null);
    addAssistantMsg("Booking cancel kar di gayi. Koi aur madad chahiye?");
  };

  const handlePayAtHotel = async () => {
    setBookingStep(null);
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/placeorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingState }),
      });
      const data = await res.json();
      if (data.success) {
        setBookingStep("done");
        addAssistantMsg(`\u2705 Booking Confirmed!\n\ud83c\udfe8 Hotel: ${bookingState.hotelName}\n\ud83d\udecf\ufe0f Room: ${bookingState.roomType}\n\ud83d\udc64 Guest: ${bookingState.bookingFor}\n\ud83d\udcc5 Check-in: ${bookingState.checkInDate.split("T")[0]}\n\ud83d\udcc5 Check-out: ${bookingState.checkOutDate.split("T")[0]}\n\ud83d\udcb0 Amount: \u20b9${bookingState.finalAmount}\n\ud83d\udcb3 Payment: Pay at Hotel\n\ud83d\udd16 Order ID: ${data.orderId}`);
        setBookingState(null);
        setSelectedRoom(null);
      } else {
        addAssistantMsg(data.error || "Order place karne mein error aaya.");
        setBookingStep("payment_method");
      }
    } catch {
      addAssistantMsg("Order place karne mein error aaya. Dobara try karein.");
      setBookingStep("payment_method");
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    setBookingStep(null);
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/user/add_wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount: bookingState.finalAmount, token: "" }),
      });
      const data = await res.json();
      if (data.payment_session_id) {
        setPaymentSession({ payment_link: data.payment_link, order_id: data.order_id });
        setBookingStep("online_payment");
        setLoading(false);

        const cashfree = new window.Cashfree({ mode: "sandbox" });
        const result = await cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          redirectTarget: "_modal",
        });

        console.log("Cashfree result:", result);
        const paymentStatus = result?.paymentDetails?.paymentStatus;

        if (paymentStatus === "SUCCESS") {
          // Auto verify and place order
          setLoading(true);
          setBookingStep(null);
          const verifyRes = await fetch(
            `https://chatbot-ai-backend-t7xb.onrender.com/booking/verify-and-place`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingState,
                cashfreeOrderId: data.order_id,
              }),
            },
          );
          const verifyData = await verifyRes.json();
          if (verifyData.status === "PAID" && verifyData.success) {
            setBookingStep("done");
            addAssistantMsg(`\u2705 Booking Confirmed!\n\ud83c\udfe8 Hotel: ${bookingState.hotelName}\n\ud83d\udecf\ufe0f Room: ${bookingState.roomType}\n\ud83d\udc64 Guest: ${bookingState.bookingFor}\n\ud83d\udcc5 Check-in: ${bookingState.checkInDate.split("T")[0]}\n\ud83d\udcc5 Check-out: ${bookingState.checkOutDate.split("T")[0]}\n\ud83d\udcb0 Amount: \u20b9${bookingState.finalAmount}\n\ud83d\udcb3 Payment: Online Paid\n\ud83d\udd16 Order ID: ${verifyData.orderId}`);
            setBookingState(null);
            setSelectedRoom(null);
            setPaymentSession(null);
          } else {
            addAssistantMsg(verifyData.error || "Booking place karne mein error aaya. Support se contact karein.");
            setBookingStep("payment_method");
          }
        } else if (paymentStatus === "FAILED") {
          addAssistantMsg("\u274c Payment failed ho gaya. Dobara try karein?", { bookingStep: "payment_method" });
          setBookingStep("payment_method");
        } else {
          // PENDING or modal closed
          addAssistantMsg("Payment abhi complete nahi hua. Payment karne ke baad dobara try karein.", { bookingStep: "online_payment", paymentLink: data.payment_link });
          setBookingStep("online_payment");
        }
      } else {
        addAssistantMsg(data.error || "Payment session banana mein error aaya.");
        setBookingStep("payment_method");
      }
    } catch {
      addAssistantMsg("Payment session banana mein error aaya. Dobara try karein.");
      setBookingStep("payment_method");
    } finally {
      setLoading(false);
    }
  };

 const handlePaymentDone = async () => {
   setBookingStep(null);
   setLoading(true);
   console.log("Verifying payment for order_id:", paymentSession?.order_id);
   try {
     const res = await fetch(
       `https://chatbot-ai-backend-t7xb.onrender.com/booking/verify-and-place`,
       {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           bookingState,
           cashfreeOrderId: paymentSession.order_id,
         }),
       },
     );
     const data = await res.json();

     if (data.status === "PAID" && data.success) {
       setBookingStep("done");
       addAssistantMsg(
         `✅ Booking Confirmed!\n🏨 Hotel: ${bookingState.hotelName}\n🛏️ Room: ${bookingState.roomType}\n👤 Guest: ${bookingState.bookingFor}\n📅 Check-in: ${bookingState.checkInDate.split("T")[0]}\n📅 Check-out: ${bookingState.checkOutDate.split("T")[0]}\n💰 Amount: ₹${bookingState.finalAmount}\n💳 Payment: Online Paid\n🔖 Order ID: ${data.orderId}`,
       );
       setBookingState(null);
       setSelectedRoom(null);
       setPaymentSession(null);
     } else if (data.status === "EXPIRED") {
       addAssistantMsg(data.message);
       await handleOnlinePayment(); // naya session banao
     } else if (data.status === "FAILED") {
       addAssistantMsg(data.message);
       setBookingStep("payment_method");
     } else {
       // PENDING ya kuch aur
       addAssistantMsg(data.message || "Payment abhi complete nahi hua.");
       setBookingStep("online_payment");
     }
   } catch {
     addAssistantMsg("Payment verify karne mein error aaya.");
     setBookingStep("online_payment");
   } finally {
     setLoading(false);
   }
 };

  const handleCancelPayment = () => {
    setBookingStep(null);
    setBookingState(null);
    setSelectedRoom(null);
    setPaymentSession(null);
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
      const res = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, userId, token: "" }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || data.error }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error: Could not reach server." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!userId) {
    return (
      <div className="chat-container">
        <div className="chat-header">🤖 AI Chatbot</div>
        <div className="userid-screen">
          <p>Apna User ID enter karein</p>
          <input type="text" value={userIdInput} onChange={(e) => setUserIdInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && userIdInput.trim() && setUserId(userIdInput.trim())}
            placeholder="Enter User ID..." />
          <button onClick={() => userIdInput.trim() && setUserId(userIdInput.trim())}>Start Chat</button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">🤖 AI Chatbot <span className="userid-badge">ID: {userId}</span></div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.hotels ? (
              <><span>{msg.content}</span><HotelCards hotels={msg.hotels} onSelectRoom={handleRoomSelect} /></>
            ) : msg.locationBtn ? (
              <><span>{msg.content}</span>
                <button className="location-btn" onClick={() => handleGetLocation(msg.pendingKeyword)}>📍 Get My Location</button>
              </>
            ) : msg.bookingStep ? (
              <><span>{msg.content}</span>
                <BookingFlow
                  step={msg.bookingStep}
                  paymentLink={msg.paymentLink}
                  onPayAtHotel={i === messages.length - 1 ? handlePayAtHotel : null}
                  onOnlinePayment={i === messages.length - 1 ? handleOnlinePayment : null}
                  onPaymentDone={i === messages.length - 1 ? handlePaymentDone : null}
                  onCancel={i === messages.length - 1 ? handleCancelPayment : null}
                />
              </>
            ) : (
              <span>{msg.content}</span>
            )}
          </div>
        ))}

        {/* Booking form shown inline in chat */}
        {bookingStep === "form" && selectedRoom && (
          <div className="message assistant">
            <BookingForm
              hotel={selectedRoom.hotel}
              room={selectedRoom.room}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        )}

        {loading && (
          <div className="message assistant">
            <span className="typing">● ● ●</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <textarea rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
          placeholder={
            bookingStep === "form" ? "Form mein details bharein..." :
            bookingStep === "payment_method" ? "Upar se payment method chunein..." :
            bookingStep === "online_payment" ? "Payment ke baad button dabayein..." :
            "Type a message..."
          }
          disabled={bookingStep === "form" || bookingStep === "payment_method" || bookingStep === "online_payment"}
        />
        <button onClick={sendMessage} disabled={loading || !!bookingStep}>Send</button>
      </div>
    </div>
  );
}
