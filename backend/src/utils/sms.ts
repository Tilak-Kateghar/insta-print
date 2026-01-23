import axios from "axios";

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY!;

export async function sendOtpSMS(phone: string, otp: string) {
  const payload = {
    route: "otp",
    variables_values: otp,
    numbers: phone,
  };

  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      payload,
      {
        headers: {
          authorization: FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 7000,
      }
    );

    if (!response.data?.return) {
      console.error("FAST2SMS FAILED:", response.data);
      throw new Error("Fast2SMS rejected request");
    }

    console.log("FAST2SMS SENT:", response.data);
    return response.data;
  } catch (err: any) {
    console.error(
      "FAST2SMS ERROR:",
      err.response?.data || err.message
    );
    throw err;
  }
}