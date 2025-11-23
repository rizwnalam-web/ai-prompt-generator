
export const encryptData = (data: any): string => {
    try {
        const jsonString = JSON.stringify(data);
        // Robust UTF-8 to Base64 encoding
        return btoa(
            encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g,
                function toSolidBytes(match, p1) {
                    return String.fromCharCode(parseInt(p1, 16));
                })
        );
    } catch (e) {
        console.error("Encryption failed", e);
        return "";
    }
};

export const decryptData = (encrypted: string): any => {
    try {
        // Robust Base64 to UTF-8 decoding
        const jsonString = decodeURIComponent(
            atob(encrypted).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')
        );
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Decryption failed", e);
        return [];
    }
};
