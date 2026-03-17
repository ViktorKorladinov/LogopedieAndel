import { Resend } from "resend";

interface EnvConfig {
    turnstileSecretKey: string;
    resendApiKey: string;
    formEmailTo: string;
}

function getEnvConfig(locals: any): EnvConfig {
    const runtime = locals.runtime || {};
    const env = runtime.env || {};

    return {
        turnstileSecretKey: env.TURNSTILE_SECRET_KEY || import.meta.env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY,
        resendApiKey: env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY,
        formEmailTo: env.FORM_EMAIL_TO || import.meta.env.FORM_EMAIL_TO || process.env.FORM_EMAIL_TO,
    };
}

async function verifyTurnstileToken(token: string | undefined, secretKey: string): Promise<{ success: boolean; error?: string }> {
    if (!token) {
        return { success: false, error: "Ověření proti botům selhalo. Prosím, potvrďte, že nejste robot." };
    }

    try {
        const verifyResponse = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                body: JSON.stringify({ secret: secretKey, response: token }),
                headers: { "Content-Type": "application/json" },
            }
        );

        const verification = await verifyResponse.json();

        if (!verification.success) {
            return { success: false, error: "Ověření proti botům selhalo. Zkuste to prosím znovu." };
        }

        return { success: true };
    } catch (e) {
        return { success: false, error: "Chyba při komunikaci s ověřovací službou." };
    }
}

function generateEmailHtml(fields: {label: string, value: string}[]): string {
    let emailHtml = "<h2>Nový formulář: Záznam o pacientovi</h2><table width='100%' border='1' cellpadding='8' cellspacing='0' style='border-collapse: collapse; font-family: sans-serif;'>";
    for (const field of fields) {
        emailHtml += `<tr><td style='width:35%; background:#f3f4f6;'><strong>${field.label}</strong></td><td style='white-space: pre-wrap;'>${field.value || '-'}</td></tr>`;
    }
    emailHtml += "</table>";
    return emailHtml;
}

async function sendPatientEmail(resendApiKey: string, formEmailTo: string, patientName: string, emailHtml: string): Promise<{ success: boolean; error?: string }> {
    if (!resendApiKey || !formEmailTo) {
        return { success: false, error: "Chyba serveru, zkuste to prosím později." };
    }

    try {
        const resend = new Resend(resendApiKey);
        const response = await resend.emails.send({
            from: "Logopedie Anděl <onboarding@resend.dev>",
            to: [formEmailTo],
            subject: `Nový formulář pacienta: ${patientName}`,
            html: emailHtml,
        });

        if (response.error) {
            return { success: false, error: `Nepodařilo se odeslat email: ${response.error.message}` };
        }

        return { success: true };
    } catch (e) {
        if (e instanceof Error) {
            return { success: false, error: e.message };
        }
        return { success: false, error: "Došlo k neznámé chybě při odesílání emailu." };
    }
}


export async function handlePatientForm(request: Request, locals: any) {
    try {
        const data = await request.formData();

        const name = data.get("Jméno a příjmení")?.toString() || "";
        const email = data.get("Kontaktní e-mail")?.toString() || "";

        const token = data.get("cf-turnstile-response")?.toString();

        if (!name || !email) {
            return { success: false, error: "Jméno a e-mail jsou povinné." };
        }

        const config = getEnvConfig(locals);

        // 1. Ověření tokenu (Turnstile)
        const turnstileResult = await verifyTurnstileToken(token, config.turnstileSecretKey);
        if (!turnstileResult.success) {
            return turnstileResult;
        }

        // Dynamické sestavení všech polí formuláře pro e-mail
        const emailFields: {label: string, value: string}[] = [];
        const excludeKeys = new Set(["cf-turnstile-response"]);
        const groupedData = new Map<string, string[]>();

        for (const [key, value] of data.entries()) {
            if (excludeKeys.has(key)) continue;
            // U checkboxů, pokud nejsou zaškrtnuté, v datech vůbec nejsou, takže hodnota je vždy "on" nebo specifikovaná.
            // Převedeme checkbox "on" na Ano.
            const valStr = value.toString().trim() === 'on' ? 'Ano' : value.toString().trim();
            
            if (valStr) {
                if (!groupedData.has(key)) groupedData.set(key, []);
                groupedData.get(key)!.push(valStr);
            }
        }

        for (const [key, values] of groupedData.entries()) {
            emailFields.push({ label: key, value: values.join(", ") });
        }

        // 2. Sestavení HTML emailu z formulářových dat
        const emailHtml = generateEmailHtml(emailFields);

        // 3. Odeslání emailu přes Resend
        const emailResult = await sendPatientEmail(config.resendApiKey, config.formEmailTo, name, emailHtml);
        if (!emailResult.success) {
            return emailResult;
        }

        return { success: true, error: "" };
    } catch (e) {
        if (e instanceof Error) {
            return { success: false, error: e.message };
        }
        return { success: false, error: "Došlo k neznámé chybě." };
    }
}
