import { getSiteSettings } from "@/lib/actions/settings-actions";

const SANDBOX_URL = "https://sandbox.sslcommerz.com";
const LIVE_URL = "https://gw.sslcommerz.com";
const LIVE_VALIDATOR_URL = "https://securepay.sslcommerz.com";

export interface SSLPaymentConfig {
    store_id: string;
    store_passwd: string;
    is_sandbox: boolean;
    success_url: string;
    fail_url: string;
    cancel_url: string;
    ipn_url: string;
}

export interface SSLPaymentData {
    total_amount: number;
    currency: string;
    tran_id: string;
    product_category: string;
    product_name: string;
    cus_name: string;
    cus_email: string;
    cus_add1: string;
    cus_city: string;
    cus_postcode: string;
    cus_country: string;
    cus_phone: string;
    multi_card_name?: string;
    value_a?: string;
    value_b?: string;
}

export async function initiateSSLPayment(data: SSLPaymentData) {
    const settings = await getSiteSettings();
    if (!settings?.sslStoreId || !settings?.sslStorePass) {
        throw new Error("SSLCommerz credentials not configured");
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const config: SSLPaymentConfig = {
        store_id: settings.sslStoreId,
        store_passwd: settings.sslStorePass,
        is_sandbox: settings.sslIsSandbox,
        success_url: `${baseUrl}/api/payment/success`,
        fail_url: `${baseUrl}/api/payment/fail`,
        cancel_url: `${baseUrl}/api/payment/cancel`,
        ipn_url: `${baseUrl}/api/payment/ipn`,
    };

    const apiBase = config.is_sandbox ? SANDBOX_URL : LIVE_URL;
    const apiUrl = `${apiBase}/gwprocess/v4/api.php`;

    const formData = new URLSearchParams();
    formData.append("store_id", config.store_id);
    formData.append("store_passwd", config.store_passwd);
    formData.append("total_amount", data.total_amount.toString());
    formData.append("currency", data.currency);
    formData.append("tran_id", data.tran_id);
    formData.append("success_url", config.success_url);
    formData.append("fail_url", config.fail_url);
    formData.append("cancel_url", config.cancel_url);
    formData.append("ipn_url", config.ipn_url);
    formData.append("shipping_method", "NO"); // Required by SSLCommerz
    formData.append("product_profile", "general"); // Required by SSLCommerz
    formData.append("product_category", data.product_category);
    formData.append("product_name", data.product_name);
    formData.append("cus_name", data.cus_name);
    formData.append("cus_email", data.cus_email);
    formData.append("cus_add1", data.cus_add1);
    formData.append("cus_city", data.cus_city);
    formData.append("cus_postcode", data.cus_postcode);
    formData.append("cus_country", data.cus_country);
    formData.append("cus_phone", data.cus_phone);
    if (data.value_a) formData.append("value_a", data.value_a);
    if (data.value_b) formData.append("value_b", data.value_b);

    const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
    });

    const result = await response.json();
    if (result.status === "SUCCESS") {
        return { success: true, url: result.GatewayPageURL };
    } else {
        console.error("SSLCommerz Error:", result.failedreason);
        return { success: false, error: result.failedreason };
    }
}

export async function validateSSLPayment(val_id: string) {
    const settings = await getSiteSettings();
    if (!settings?.sslStoreId || !settings?.sslStorePass) {
        throw new Error("SSLCommerz credentials not configured");
    }

    const apiBase = settings.sslIsSandbox ? SANDBOX_URL : LIVE_VALIDATOR_URL;
    const apiUrl = `${apiBase}/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${settings.sslStoreId}&store_passwd=${settings.sslStorePass}&format=json`;

    const response = await fetch(apiUrl);
    const result = await response.json();

    if (result.status === "VALID" || result.status === "VALIDATED") {
        return { success: true, data: result };
    } else {
        return { success: false, error: result.status };
    }
}
