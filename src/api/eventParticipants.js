
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  /**
 * $$$-Funtion Creation: 08/08/2026, [Md Shamin Ahsan Anaph]
 * $$$-Most Recent Change: 08/08/2026, [Md Shamin Ahsan Anaph]
 * 
 * $$$-Method Description:
 *    takes a userId and an EventId and makes a POST 
 *to add the user to the selected event

 * $$$-Component Using This Function:
 *    participate Button on EventDetails page
 * 
 * $$$-Description of Variables:
 *
 * */
export async function addUserToEvent(userId, eventId) {
  if (!userId || !eventId) {
    throw new Error("Must include userId and eventId");
  }
  
  const res = await fetch(`${BASE_URL}/api/users/${userId}/events`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not add user (${res.status})`);
  }

  return res.json();
}