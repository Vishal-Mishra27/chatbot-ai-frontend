export default function BookingFlow({ step, paymentLink, onPayAtHotel, onOnlinePayment, onPaymentDone, onCancel }) {
  if (step === "payment_method") {
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        <button onClick={onPayAtHotel}
          className="flex-1 min-w-[120px] bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors">
          💵 Pay at Hotel
        </button>
        <button onClick={onOnlinePayment}
          className="flex-1 min-w-[120px] bg-white hover:bg-gray-50 text-emerald-600 border-2 border-emerald-500 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors">
          💳 Online Payment
        </button>
      </div>
    );
  }

  if (step === "online_payment") {
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {paymentLink && (
          <a href={paymentLink} target="_blank" rel="noreferrer"
            className="flex-1 min-w-[120px] text-center bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors">
            🔗 Pay Now
          </a>
        )}
        {onPaymentDone && (
          <button onClick={onPaymentDone}
            className="flex-1 min-w-[120px] bg-white hover:bg-gray-50 text-emerald-600 border-2 border-emerald-500 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors">
            ✅ Payment Ho Gayi
          </button>
        )}
        {onCancel && (
          <button onClick={onCancel}
            className="flex-1 min-w-[100px] bg-white hover:bg-red-50 text-red-500 border border-red-200 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors">
            ❌ Cancel
          </button>
        )}
      </div>
    );
  }

  return null;
}
