export interface LocationFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    note?: string;  // Make note optional to match Location type
}