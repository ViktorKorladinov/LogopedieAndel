/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

type Env = {
    RESEND_API_KEY?: string;
    FORM_EMAIL_TO?: string;
    TURNSTILE_SECRET_KEY?: string;
};

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
    interface Locals extends Runtime { }
}

interface Window {
    turnstile: {
        render: (element: string | HTMLElement, options: object) => string;
        reset: (widgetId?: string) => void;
        getResponse: (widgetId?: string) => string;
        remove: (widgetId?: string) => void;
    };
}