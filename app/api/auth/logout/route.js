// app/api/auth/logout/route.js
export async function POST() {
  const cookie = `token=deleted; Path=/; HttpOnly; Expires=${new Date(0).toUTCString()}; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
  return new Response(JSON.stringify({ message: "Logged out" }), {
    status: 200,
    headers: {
      "Set-Cookie": cookie,
      "Content-Type": "application/json"
    }
  });
}
