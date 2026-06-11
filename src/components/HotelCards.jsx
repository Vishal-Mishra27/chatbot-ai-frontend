export default function HotelCards({ hotels, onSelectRoom }) {
  if (!hotels || hotels.length === 0)
    return <p className="text-gray-400 text-sm mt-2">Koi hotel nahi mila aapke aas paas.</p>;

  return (
    <div className="flex flex-col gap-3 mt-2 w-full">
      {hotels.map((hotel) => (
        <div key={hotel.residencyId} className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
          {hotel.image && (
            <img src={hotel.image} alt={hotel.name} className="w-full h-28 object-cover" />
          )}
          <div className="p-3">
            <div className="font-bold text-gray-800 text-sm">{hotel.name}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              📍 {hotel.address}{hotel.distance ? ` · ${hotel.distance} km` : ""}
            </div>
            {hotel.rating > 0 && (
              <div className="text-xs text-amber-500 mt-0.5">⭐ {hotel.rating}</div>
            )}
            <div className="flex flex-col gap-2 mt-2">
              {hotel.rooms?.map((room) => (
                <div key={room.roomId} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-700">{room.roomType}</span>
                    <span className="text-xs text-emerald-600 font-medium">
                      ₹{room.pricePerNight || room.price || "N/A"}/night
                    </span>
                    {room.amenities?.length > 0 && (
                      <span className="text-xs text-gray-400">
                        {room.amenities.slice(0, 3).map((a) => a.name || a).join(" · ")}
                      </span>
                    )}
                  </div>
                  <button
                    disabled={!room.isAvailable}
                    onClick={() => onSelectRoom(hotel, room)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors"
                  >
                    {room.isAvailable ? "Book" : "Full"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
