export declare const config: {
    port: string | number;
    nodeEnv: string;
    openai: {
        apiKey: string | undefined;
        model: string;
        embeddingModel: string;
    };
    cors: {
        origin: string;
        credentials: boolean;
    };
    upload: {
        maxFileSize: number;
        uploadDir: string;
        allowedTypes: string[];
        allowedExtensions: string[];
    };
};
//# sourceMappingURL=config.d.ts.map