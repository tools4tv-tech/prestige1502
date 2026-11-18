
// api/lead.js
// Vercel Serverless Function
// Prestige1502 - Sell.Do CRM Integration

module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  // Same-origin protection
  const origin = req.headers.origin;
  const host = req.headers.host;

  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return res.status(403).json({
          success: false,
          message: "Invalid request origin"
        });
      }
    } catch {
      return res.status(403).json({
        success: false,
        message: "Invalid request origin"
      });
    }
  }

  try {
    // ----------------------------------------
    // 1. Environment variables
    // ----------------------------------------

    const API_KEY = process.env.SELLDO_API_KEY;
    const SRD = process.env.SELLDO_SRD;

    // Legacy API endpoint used in your earlier
    // Sell.Do integration configuration.
    const SELLDO_ENDPOINT =
      "https://app.sell.do/api/leads/create.json";

    if (!API_KEY || !SRD) {
      console.error("Sell.Do environment variables missing");

      return res.status(500).json({
        success: false,
        message: "CRM configuration is incomplete"
      });
    }

    // ----------------------------------------
    // 2. Read incoming form data
    // ----------------------------------------

    const body = req.body || {};

    const name = String(
      body.name || body.fullName || ""
    ).trim();

    let phone = String(
      body.phone || body.mobile || ""
    ).replace(/\D/g, "");

    const email = String(body.email || "").trim();

    const interest = String(
      body.interest ||
      body.enquiryType ||
      "General Enquiry"
    ).trim();

    // ----------------------------------------
    // 3. Normalize Indian mobile number
    // ----------------------------------------

    if (phone.length === 12 && phone.startsWith("91")) {
      phone = phone.slice(2);
    } else if (
      phone.length === 11 &&
      phone.startsWith("0")
    ) {
      phone = phone.slice(1);
    }

    // ----------------------------------------
    // 4. Validate customer information
    // ----------------------------------------

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid name."
      });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Indian mobile number."
      });
    }

    // Correct email validation regex
    if (
      email &&
      (
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address."
      });
    }

    // ----------------------------------------
    // 5. Build lead notes
    // ----------------------------------------

    const noteParts = [
      "Project: Prestige Sector 150 Noida",
      "Website: Prestige1502",
      "Campaign: Prestige 150 Web 2",
      "Source: Prestige 150 Web 2",
      "Interested In: " + interest.slice(0, 150)
    ];

    const trackingFields = [
      ["utm_source", "UTM Source"],
      ["utm_medium", "UTM Medium"],
      ["utm_campaign", "UTM Campaign"],
      ["utm_term", "UTM Term"],
      ["utm_content", "UTM Content"]
    ];

    trackingFields.forEach(([key, label]) => {
      const value = String(body[key] || "")
        .trim()
        .slice(0, 250);

      if (value) {
        noteParts.push(label + ": " + value);
      }
    });

    const pageUrl = String(
      body.page_url || body.pageUrl || ""
    ).trim().slice(0, 1000);

    if (pageUrl) {
      noteParts.push("Landing Page: " + pageUrl);
    }

    // ----------------------------------------
    // 6. Prepare Sell.Do form-urlencoded data
    // ----------------------------------------

    const params = new URLSearchParams();

    params.append(
      "sell_do[form][lead][name]",
      name
    );

    params.append(
      "sell_do[form][lead][phone]",
      phone
    );

    if (email) {
      params.append(
        "sell_do[form][lead][email]",
        email
      );
    }

    params.append(
      "sell_do[campaign][srd]",
      SRD
    );

    params.append(
      "sell_do[form][note][content]",
      noteParts.join("\n")
    );

    // ----------------------------------------
    // 7. Build Sell.Do API request
    // ----------------------------------------

    const endpoint = new URL(SELLDO_ENDPOINT);

    endpoint.searchParams.set("api_key", API_KEY);

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 20000);

    let sellDoResponse;

    try {
      sellDoResponse = await fetch(endpoint.toString(), {
        method: "POST",

        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        },

        body: params.toString(),

        signal: controller.signal,
        cache: "no-store"
      });

    } finally {
      clearTimeout(timeout);
    }

    // ----------------------------------------
    // 8. Read Sell.Do response
    // ----------------------------------------

    const responseText = await sellDoResponse.text();

    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      result = {
        raw: responseText
      };
    }

    if (!sellDoResponse.ok) {
      console.error("Sell.Do HTTP error:", {
        status: sellDoResponse.status,
        response: result
      });

      return res.status(502).json({
        success: false,
        message: "Sell.Do could not process your enquiry."
      });
    }

    // ----------------------------------------
    // 9. Check CRM response
    // ----------------------------------------

    const leadId =
      result?.sell_do_lead_id ||
      result?.lead_id ||
      result?.id;

    const apiErrors = result?.error;

    const hasErrors = Array.isArray(apiErrors)
      ? apiErrors.length > 0
      : Boolean(apiErrors);

    const explicitlyRejected =
      result?.success === false ||
      result?.status === "error" ||
      hasErrors;

    if (explicitlyRejected && !leadId) {
      console.error("Sell.Do rejected lead:", result);

      return res.status(502).json({
        success: false,
        message: "CRM could not process your enquiry."
      });
    }

    // ----------------------------------------
    // 10. Successful response
    // ----------------------------------------

    console.log("Sell.Do response received:", {
      leadId: leadId || null
    });

    return res.status(200).json({
      success: true,
      message: "Enquiry submitted successfully.",
      leadId: leadId || null
    });

  } catch (error) {
    console.error("Lead integration error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.name === "AbortError"
          ? "CRM request timed out. Please try again."
          : "Something went wrong. Please try again."
    });
  }
};
