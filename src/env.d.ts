/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

type Env = {
    RESEND_API_KEY?: string;
    FORM_EMAIL_TO?: string;
};

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
    interface Locals extends Runtime { }
}
