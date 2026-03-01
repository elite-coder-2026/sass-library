export const bookings = {
    createBooking: `
        insert into cs.bookings 
            (user_id, stylist_id, starts_at, ends_at, status, notes, created_at, updated_at) 
        values($1, $2, $3, $4, $5, $6) 
        returning id, user_id, stylist_id, starts_at, ends_at, status, notes, created_at, updated_at;  
    `,


}