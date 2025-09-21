export interface UrlContent {
    title: string;
    content: string;
    url: string;
}
export declare class UrlFetcherService {
    private static readonly MAX_CONTENT_LENGTH;
    private static readonly TIMEOUT;
    static fetchUrlContent(url: string): Promise<UrlContent>;
    private static cleanContent;
    static validateUrl(url: string): {
        isValid: boolean;
        error?: string;
    };
}
//# sourceMappingURL=urlFetcher.service.d.ts.map