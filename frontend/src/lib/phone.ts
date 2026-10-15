/**
 * Normalizes user-entered Nigerian phone numbers into the standard local 11-digit database format (e.g. 08012345678).
 * 
 * - Standard 11 digits: "08012345678" -> "08012345678"
 * - 10 digits without leading zero: "8012345678" -> "08012345678"
 * - International with country code: "+2348012345678" or "2348012345678" -> "08012345678"
 * - Formatted with spaces/hyphens: "0801 234 5678" -> "08012345678"
 */
export function normalizePhoneNumber(raw: string): string {
    const cleaned = raw.replace(/\D/g, "")
    // Handle international prefix (e.g. +2348012345678 or 2348012345678)
    if (cleaned.startsWith("234") && cleaned.length >= 13) {
        return `0${cleaned.slice(3)}`
    }
    // Handle 10-digit number without leading 0 (e.g. 8012345678)
    if (cleaned.length === 10 && (cleaned.startsWith("8") || cleaned.startsWith("7") || cleaned.startsWith("9"))) {
        return `0${cleaned}`
    }
    // Handle standard 11-digit local number (e.g. 08012345678 or "0801 234 5678")
    if (cleaned.length === 11 && cleaned.startsWith("0")) {
        return cleaned
    }
    return cleaned.length > 0 ? cleaned : raw.trim()
}
