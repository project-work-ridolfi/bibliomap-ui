import { useAuthStore } from "@/stores/authStore";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/**
 * funzione generica per richieste http.
 * gestisce automaticamente json vs formdata.
 */
async function apiFetch(endpoint, options = {}) {
  const authStore = useAuthStore();

  // gestione url e query params
  let url = `${API_BASE_URL}/api${endpoint}`;

  const { params, ...fetchOptions } = options;

  if (params) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null)
    );
    const queryString = new URLSearchParams(cleanParams).toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  // gestione body e content-type dinamica
  let body = fetchOptions.body;
  let headers = { ...fetchOptions.headers };

  // check se invia un file (formdata)
  const isFormData = body instanceof FormData;

  if (isFormData) {
    if (headers["Content-Type"]) {
      delete headers["Content-Type"];
    }
  } else {
    if (!headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    if (body && typeof body === "object") {
      body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: headers,
      body: body, // body elaborato
      credentials: "include",
    });

    if (response.status === 401) {
      // NON facciamo il logout se siamo nell'endpoint di login
      if (!response.url.includes("/auth/login")) {
        authStore.logout();
        router.push("/login");
      }
      // Lancia l'errore così il catch della LoginPage può gestirlo
      const errorData = await response.json();
      throw { status: 401, message: errorData.error || "Unauthorized" };
    }

    // gestione errori
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorBody = null;
      let errorMessage = `api error ${response.status}`;

      if (contentType && contentType.includes("application/json")) {
        try {
          errorBody = await response.json();
          errorMessage = errorBody.message || errorBody.details || errorMessage;
        } catch (e) {
          /* ignore */
        }
      } else if (response.status !== 204) {
        // log errori testuali ma non blocca
        const txt = await response.text();
        console.error("backend error:", txt.substring(0, 200));
      }

      const err = new Error(errorMessage);
      err.status = response.status;
      err.body = errorBody;
      throw err;
    }

    // parsing risposta
    const text = await response.text();
    if (!text || text.trim().length === 0) return null;

    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error("risposta non json");
    }
  } catch (error) {
    throw error;
  }
}

export const apiClient = {
  get: (endpoint, options = {}) =>
    apiFetch(endpoint, { method: "GET", ...options }),

  post: (endpoint, data, options = {}) =>
    apiFetch(endpoint, {
      method: "POST",
      body: data,
      ...options,
    }),

  put: (endpoint, data, options = {}) =>
    apiFetch(endpoint, {
      method: "PUT",
      body: data,
      ...options,
    }),
  patch: (endpoint, data) =>
    apiFetch(endpoint, { method: "PATCH", body: data }),

  delete: (endpoint, options = {}) =>
    apiFetch(endpoint, { method: "DELETE", ...options }),
};

export default apiClient;
