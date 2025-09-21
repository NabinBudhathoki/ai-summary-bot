declare class OpenAIService {
    private openai;
    constructor();
    generateSummary(text: string, summaryType?: string, format?: string, length?: string): Promise<string>;
    private getPromptForSummaryType;
}
declare const _default: OpenAIService;
export default _default;
//# sourceMappingURL=openai.service.d.ts.map