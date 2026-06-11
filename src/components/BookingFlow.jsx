export default function BookingFlow({ step, paymentLink, onPayAtHotel, onOnlinePayment, onPaymentDone, onCancel }) {
  if (step === "payment_method") {
    return (
      <div className="booking-actions">
        <button className="pay-hotel-btn" onClick={onPayAtHotel}>💵 Pay at Hotel</button>
        <button className="pay-online-btn" onClick={onOnlinePayment}>💳 Online Payment</button>
      </div>
    );
  }

  if (step === "online_payment" && paymentLink) {
    return (
      <div className="booking-actions">
        <a href={paymentLink} target="_blank" rel="noreferrer" className="pay-now-btn">🔗 Pay Now</a>
        <button className="payment-done-btn" onClick={onPaymentDone}>✅ Payment Ho Gayi</button>
        <button className="cancel-btn" onClick={onCancel}>❌ Cancel</button>
      </div>
    );
  }

  return null;
}
