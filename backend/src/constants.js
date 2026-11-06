export const cookiesOption = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
};
