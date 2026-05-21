// Compatible wrapper that implements sendMail using the Brevo HTTPS API
const transporter = {
  sendMail: async (options: { from?: string; to: string; subject: string; html: string }) => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.warn("BREVO_API_KEY environment variable is not defined. Email dispatch skipped.");
      return null;
    }

    // Brevo requires a verified sender email. We'll use EMAIL_USER which is typically the registered Brevo account email.
    const senderEmail = process.env.EMAIL_USER || "samir884995@gmail.com";

    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: "SMS Portal",
            email: senderEmail,
          },
          to: [
            {
              email: options.to,
            }
          ],
          subject: options.subject,
          htmlContent: options.html,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Brevo API returned status ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error("Error sending email via Brevo:", error);
      throw error;
    }
  }
};

module.exports = transporter;