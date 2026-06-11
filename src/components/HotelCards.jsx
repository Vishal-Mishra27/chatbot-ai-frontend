export default function HotelCards({ hotels, onSelectRoom }) {
  if (!hotels || hotels.length === 0)
    return <p className="no-hotels">Koi hotel nahi mila aapke aas paas.</p>;

  return (
    <div className="hotel-cards-wrapper">
      {hotels.map((hotel) => (
        <div key={hotel.residencyId} className="hotel-card">
          {hotel.image && (
            <img src={hotel.image} alt={hotel.name} className="hotel-card-img" />
          )}
          <div className="hotel-card-body">
            <div className="hotel-card-name">{hotel.name}</div>
            <div className="hotel-card-meta">
              📍 {hotel.address} · {hotel.distance ? `${hotel.distance} km` : ""}
            </div>
            {hotel.rating && (
              <div className="hotel-card-rating">⭐ {hotel.rating}</div>
            )}
            <div className="hotel-rooms">
              {hotel.rooms.map((room) => (
                <div key={room.roomId} className="room-row">
                 <div className="room-info">
                    <span className="room-type">{room.roomType}</span>
                    {/* ✅ Fix: room.price use karo, room.pricePerNight nahi */}
                    <span className="room-price">
                      ₹{room.pricePerNight || room.price || "N/A"}/
                      {room.pricePerNight
                        ? "night"
                        : room.pricePerMonth
                          ? "month"
                          : "day"}
                    </span>
                    {/* ✅ Fix: .name field nikalo object se */}
                    {room.amenities?.length > 0 && (
                      <span className="room-amenities">
                        {room.amenities
                          .slice(0, 3)
                          .map((a) => a.name)
                          .join(" · ")}
                      </span>
                    )}
                  </div>
                  <button
                    className="book-btn"
                    disabled={!room.isAvailable}
                    onClick={() => onSelectRoom(hotel, room)}
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

// export default function HotelCards({ hotels, onSelectRoom }) {
//   if (!hotels || hotels.length === 0)
//     return <p className="no-hotels">Koi hotel nahi mila aapke aas paas.</p>;

//   return (
//     <div className="hotel-cards-wrapper">
//       {hotels.map((hotel) => (
//         <div key={hotel.residencyId} className="hotel-card">
//           {/* ✅ Fix: mainImage field use karo, hotel.image nahi */}
//           {hotel.mainImage && (
//             <img
//               src={hotel.mainImage}
//               alt={hotel.name}
//               className="hotel-card-img"
//             />
//           )}
//           <div className="hotel-card-body">
//             <div className="hotel-card-name">{hotel.name}</div>
//             <div className="hotel-card-meta">
//               📍 {hotel.address} · {hotel.distanceText || ""}
//             </div>
//             {hotel.rating > 0 && (
//               <div className="hotel-card-rating">⭐ {hotel.rating}</div>
//             )}
//             <div className="hotel-rooms">
//               {hotel.rooms.map((room) => (
//                 <div key={room.roomId} className="room-row">
//                   <div className="room-info">
//                     <span className="room-type">{room.roomType}</span>
//                     {/* ✅ Fix: room.price use karo, room.pricePerNight nahi */}
//                     <span className="room-price">
//                       ₹{room.pricePerNight || room.price || "N/A"}/
//                       {room.pricePerNight
//                         ? "night"
//                         : room.pricePerMonth
//                           ? "month"
//                           : "day"}
//                     </span>
//                     {/* ✅ Fix: .name field nikalo object se */}
//                     {room.amenities?.length > 0 && (
//                       <span className="room-amenities">
//                         {room.amenities
//                           .slice(0, 3)
//                           .map((a) => a.name)
//                           .join(" · ")}
//                       </span>
//                     )}
//                   </div>
//                   <button
//                     className="book-btn"
//                     // ✅ Fix: isAvailable field hai, available nahi
//                     disabled={!room.isAvailable}
//                     onClick={() => onSelectRoom(hotel, room)}
//                   >
//                     {room.isAvailable ? "Book" : "Full"}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }