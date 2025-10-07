import crypto from 'crypto';

export const generateSignature = (payload: any) => {
    const serializedPayload = JSON.stringify(payload, Object.keys(payload).sort());

    const hmac = crypto.createHmac('sha256', process.env.NEXT_PUBLIC_PAYLOAD_SECRET || '');
    hmac.update(serializedPayload);
    return hmac.digest('hex');
};
