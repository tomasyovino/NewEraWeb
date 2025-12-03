const VM_API_BASE = process.env.VM_API_BASE_URL!;
const INTERNAL_KEY = process.env.VM_INTERNAL_API_KEY!;

export async function fetchFromVM(
    path: string,
    opts?: RequestInit,
): Promise<Response> {
    return fetch(`${VM_API_BASE}${path}`, {
        cache: 'no-store',
        headers: {
            'x-internal-key': INTERNAL_KEY,
            ...(opts?.headers ?? {}),
        },
        ...opts,
    });
}
