import axios, { AxiosRequestConfig } from 'axios';
import { streemConfig } from '../env';

export interface Company {
    sid: string;
    code: string;
    name: string;
    active: boolean;
}

export interface Group {
    sid: string;
    name: string;
    description?: string;
}

export interface GroupReservation {
    company_sid: string;
    group: Group;
    reservation_sid: string;
    external_user_id: string;
    priority: number;
    reserve_for_seconds: number;
    reservation_status: string;
    queue_position: number;
    estimated_wait_until?: string;
    details?: { label: string; value: string }[];
    room_sid?: string | null;
}

export interface Webhook {
    sid: string;
    company_sid: string;
    label?: string;
    url: string;
    method: string;
}

export interface WebhookSigningKey {
    sid: string;
    webhook_sid: string;
    shared_secret: string;
    label: string;
}

export interface CreatedWebhook {
    webhook: Webhook;
    signing_key: WebhookSigningKey;
}

export default class StreemApi {
    private readonly baseUrl: string;
    private readonly config: Partial<AxiosRequestConfig>;

    static instance(): StreemApi {
        return new StreemApi(
            streemConfig.apiEnv,
            streemConfig.apiRegion,
            `Basic ${Buffer.from(`${streemConfig.apiKeyId}:${streemConfig.apiKeySecret}`).toString('base64')}`
        );
    }

    private constructor(apiEnv: string, region: string, authHeader: string) {
        this.baseUrl = `https://api.${apiEnv}-${region}.streem.cloud`;
        this.config = {
            headers: {
                Authorization: authHeader,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        };
    }

    async getCompany(companyCode: string): Promise<Company> {
        const url = `${this.baseUrl}/v1/companies/${companyCode}`;
        const res = await axios.get<{ company: Company }>(url, { ...this.config });
        return res.data.company;
    }

    async getReservation(
        companyCode: string,
        groupName: string,
        reservationSid: string,
    ): Promise<GroupReservation> {
        const url = `${this.baseUrl}/v1/companies/${companyCode}/groups/${groupName}/reservations/${reservationSid}`;
        const res = await axios<{ group_reservation: GroupReservation }>(url, { ...this.config });
        return res.data.group_reservation;
    }

    async createReservation(
        companyCode: string,
        groupName: string,
        externalUserId: string,
        priority: number,
        details: { label: string; value: string }[],
    ): Promise<GroupReservation> {
        const url = `${this.baseUrl}/v1/companies/${companyCode}/groups/${groupName}/reservations`;
        const res = await axios.post<{ group_reservation: GroupReservation }>(
            url,
            {
                externalUserId: externalUserId,
                queue: true,
                reserve_for_seconds: 180,
                priority,
                details: [{ label: 'Source', value: 'ClickToVideoExample' }, ...details],
            },
            { ...this.config },
        );

        return res.data.group_reservation;
    }

    async cancelReservation(
        companyCode: string,
        groupName: string,
        reservationSid: string,
    ): Promise<void> {
        const url = `${this.baseUrl}/v1/companies/${companyCode}/groups/${groupName}/reservations/${reservationSid}/cancel`;
        await axios.post<{ group_reservation: GroupReservation }>(url, {}, { ...this.config });
    }

    async createWebhook(
        companySid: string,
        webhookUrl: string,
        label: string,
        method: string,
        timeoutMs: number,
        maxAttempts: 5
    ): Promise<Webhook> {
        const url = `${this.baseUrl}/v1/webhooks`;
        const res = await axios.post<{ webhook: Webhook }>(
            url,
            {
                company_sid: companySid,
                label: label,
                url: webhookUrl,
                method: method,
                timeout_ms: timeoutMs,
                max_attempts: maxAttempts
            },
            { ...this.config },
        );

        return res.data.webhook;
    }

    async getWebhook(
        webhookSid: string
    ): Promise<Webhook> {
        const url = `${this.baseUrl}/v1/webhooks/${webhookSid}`;
        const res = await axios<{ webhook: Webhook }>(url, { ...this.config });
        return res.data.webhook;
    }

    async deleteWebhook(
        webhookSid: string
    ): Promise<void> {
        const url = `${this.baseUrl}/v1/webhooks/${webhookSid}`;
        await axios.delete(url, { ...this.config });
    }

    async createWebhookSigningKey(
        webhookSid: string,
        sharedSecret: string,
    ): Promise<WebhookSigningKey> {
        const url = `${this.baseUrl}/v1/webhooks/${webhookSid}/signing-keys`;
        const res = await axios.post<{ signing_key: WebhookSigningKey }>(
            url,
            {
                shared_secret: sharedSecret,
                label: 'Created By ClickToVideoExample',
            },
            { ...this.config }
        );
        return res.data.signing_key;
    }
}
