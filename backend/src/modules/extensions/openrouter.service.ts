import { Injectable, Logger } from '@nestjs/common';

export interface LicensePlateOcrResult {
  licensePlate: string | null;
  vehicleType?: 'Ô tô' | 'Xe máy' | 'Xe điện' | string | null;
  confidence?: number;
}

export interface RegistrationOcrResult {
  documentNumber: string;
  licensePlate: string;
  chassisNumber: string;
  engineNumber: string;
  issueDate: string;
  expiryDate: string;
  confidenceScore: number;
}

export interface InvoiceOcrResult {
  garageName: string;
  executionDate: string;
  executionOdometer: number;
  items: Array<{ id: number; item: string; cost: number }>;
  totalCost: number;
  confidenceScore: number;
}

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);

  private get apiKey(): string | null {
    return process.env.OPENROUTER_API_KEY?.trim() || null;
  }

  private get defaultModel(): string {
    return process.env.OPENROUTER_MODEL?.trim() || 'google/gemini-2.5-flash';
  }

  private readonly fallbackModels = [
    'google/gemini-2.5-flash',
    'openai/gpt-4o-mini'
  ];

  public isConfigured(): boolean {
    const key = this.apiKey;
    return !!key && key.length > 10 && !key.includes('your_');
  }

  private getMimeType(buffer: Buffer): string {
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'image/jpeg';
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'image/png';
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return 'image/gif';
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) return 'image/webp';
    if (buffer[0] === 0x42 && buffer[1] === 0x4D) return 'image/bmp';
    return 'image/jpeg';
  }

  // 1. Nhận diện biển số xe qua OpenRouter Vision AI
  async scanLicensePlate(imageBuffer: Buffer): Promise<LicensePlateOcrResult | null> {
    if (!this.isConfigured()) return null;

    try {
      const mimeType = this.getMimeType(imageBuffer);
      const base64Data = imageBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      const prompt = `Bạn là hệ thống AI thị giác (Vision AI) chuyên gia nhận diện biển số xe cơ giới tại Việt Nam.
Nhiệm vụ của bạn là bóc tách biển số xe thực tế của phương tiện chính trong ảnh chụp.

Quy tắc biển số Việt Nam:
1. Xe máy: Thường gồm 2 dòng chữ số:
   - Dòng trên: Mã tỉnh (2 chữ số 11-99) và Ký tự seri (VD: 69-D1, 59-X3, 29-H1, 59-AA, 50-MD1).
   - Dòng dưới: Dãy số 4-5 chữ số (VD: 666.66, 123.45, 6789).
   -> Kết quả chuẩn hóa: "69-D1 666.66" hoặc "59-X3 123.45" hoặc "59-AA 123.45".
2. Xe ô tô: 1 dòng hoặc 2 dòng (biển vuông):
   - Mã tỉnh (2 số) + Seri (1-2 chữ cái) - Dãy số (4-5 số).
   -> Kết quả chuẩn hóa: "30A-123.45", "51K-567.89", "29LD-123.45".

Lưu ý QUAN TRỌNG:
- BỎ QUA các chữ tem nhãn dán trên thân xe (như HONDA, WAVE, YAMAHA, 110, tem bảo hành đỏ có số tổng đài...).
- BỎ QUA các chữ số hoặc hoa văn của bàn ghế, nền gạch, đồ vật phía sau.
- Chỉ tập trung vào tấm biển số xe gắn ở đuôi xe hoặc đầu xe.

Hãy trả về DUY NHẤT một đối tượng JSON hợp lệ (không kèm markdown \`\`\`json):
{
  "licensePlate": "69-D1 666.66",
  "vehicleType": "Xe máy",
  "confidence": 0.99
}

Nếu không phát hiện được biển số xe nào trong ảnh, trả về:
{
  "licensePlate": null,
  "vehicleType": null,
  "confidence": 0
}`;

      const candidateModels = Array.from(new Set([this.defaultModel, ...this.fallbackModels]));

      for (const modelName of candidateModels) {
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'ACOH Vehicle OCR',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: dataUrl } }
                  ]
                }
              ],
              response_format: { type: 'json_object' },
              temperature: 0.1,
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            this.logger.warn(`OpenRouter Vision API (${modelName}) trả về lỗi ${response.status}: ${errorText}`);
            continue;
          }

          const resData = await response.json();
          const content = resData.choices?.[0]?.message?.content;
          if (!content) continue;

          const cleanJson = content.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);

          if (parsed && parsed.licensePlate) {
            this.logger.log(`OpenRouter Vision AI (${modelName}) bóc tách thành công biển số: ${JSON.stringify(parsed)}`);
            return {
              licensePlate: parsed.licensePlate.trim().toUpperCase(),
              vehicleType: parsed.vehicleType || null,
              confidence: parsed.confidence || 0.99,
            };
          }
        } catch (modelErr) {
          this.logger.warn(`Lỗi khi gọi model ${modelName}: ${modelErr?.message || modelErr}`);
        }
      }

      return null;
    } catch (err) {
      this.logger.error(`Lỗi khi gọi OpenRouter Vision AI: ${err?.message || err}`);
      return null;
    }
  }

  // 2. Nhận diện Sổ Đăng Kiểm qua OpenRouter Vision AI
  async scanRegistration(imageBuffer: Buffer): Promise<RegistrationOcrResult | null> {
    if (!this.isConfigured()) return null;

    try {
      const mimeType = this.getMimeType(imageBuffer);
      const base64Data = imageBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      const prompt = `Bạn là hệ thống AI phân tích Giấy chứng nhận kiểm định an toàn kỹ thuật và bảo vệ môi trường xe cơ giới (Sổ Đăng Kiểm) tại Việt Nam.
Hãy đọc các thông tin quan trọng trên hình ảnh và trả về JSON:
{
  "documentNumber": "Số quản lý GCN (VD: KC-1234567 hoặc KD-998877)",
  "licensePlate": "Biển số đăng ký (VD: 30H-123.45)",
  "chassisNumber": "Số khung / VIN (17 ký tự)",
  "engineNumber": "Số máy",
  "issueDate": "Ngày cấp (Định dạng YYYY-MM-DD)",
  "expiryDate": "Có hiệu lực đến hết ngày / Ngày hết hạn (Định dạng YYYY-MM-DD)",
  "confidenceScore": 0.98
}

Trả về DUY NHẤT một đối tượng JSON hợp lệ (không kèm markdown \`\`\`json).`;

      const candidateModels = Array.from(new Set([this.defaultModel, ...this.fallbackModels]));
      for (const modelName of candidateModels) {
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'ACOH Registration OCR',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: dataUrl } }
                  ]
                }
              ],
              response_format: { type: 'json_object' },
              temperature: 0.1,
            })
          });

          if (!response.ok) continue;
          const resData = await response.json();
          const content = resData.choices?.[0]?.message?.content;
          if (!content) continue;

          const cleanJson = content.replace(/```json/gi, '').replace(/```/g, '').trim();
          return JSON.parse(cleanJson);
        } catch (modelErr) {
          this.logger.warn(`Lỗi scanRegistration với model ${modelName}: ${modelErr?.message || modelErr}`);
        }
      }
      return null;
    } catch (err) {
      this.logger.error(`Lỗi OpenRouter scanRegistration: ${err?.message || err}`);
      return null;
    }
  }

  // 3. Nhận diện Hóa đơn / Phiếu sửa chữa bảo dưỡng qua OpenRouter Vision AI
  async scanInvoice(imageBuffer: Buffer): Promise<InvoiceOcrResult | null> {
    if (!this.isConfigured()) return null;

    try {
      const mimeType = this.getMimeType(imageBuffer);
      const base64Data = imageBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      const prompt = `Bạn là hệ thống AI trích xuất hóa đơn, phiếu dịch vụ sửa chữa bảo dưỡng ô tô/xe máy tại Việt Nam.
Hãy đọc các thông tin trên phiếu và trả về JSON:
{
  "garageName": "Tên Garage / Trung tâm dịch vụ",
  "executionDate": "Ngày lập phiếu (YYYY-MM-DD)",
  "executionOdometer": 15000,
  "items": [
    { "id": 1, "item": "Tên phụ tùng hoặc hạng mục công việc", "cost": 450000 }
  ],
  "totalCost": 450000,
  "confidenceScore": 0.95
}

Trả về DUY NHẤT một đối tượng JSON hợp lệ (không kèm markdown \`\`\`json).`;

      const candidateModels = Array.from(new Set([this.defaultModel, ...this.fallbackModels]));
      for (const modelName of candidateModels) {
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'ACOH Invoice OCR',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: dataUrl } }
                  ]
                }
              ],
              response_format: { type: 'json_object' },
              temperature: 0.1,
            })
          });

          if (!response.ok) continue;
          const resData = await response.json();
          const content = resData.choices?.[0]?.message?.content;
          if (!content) continue;

          const cleanJson = content.replace(/```json/gi, '').replace(/```/g, '').trim();
          return JSON.parse(cleanJson);
        } catch (modelErr) {
          this.logger.warn(`Lỗi scanInvoice với model ${modelName}: ${modelErr?.message || modelErr}`);
        }
      }
      return null;
    } catch (err) {
      this.logger.error(`Lỗi OpenRouter scanInvoice: ${err?.message || err}`);
      return null;
    }
  }

  // 4. Trợ lý Bác sĩ xe AI qua OpenRouter LLM
  async chatWithAI(message: string): Promise<string | null> {
    if (!this.isConfigured()) return null;

    try {
      const systemPrompt = `Bạn là Bác sĩ xe AI - Chuyên gia tư vấn kỹ thuật, chẩn đoán bệnh xe ô tô và xe máy hàng đầu của nền tảng ACOH (AutoCare Office Helper).
Phong cách trả lời:
- Thân thiện, chuyên nghiệp, súc tích, định dạng Markdown rõ ràng có emoji.
- Đưa ra chẩn đoán nguyên nhân kỹ thuật, mức độ nguy hiểm, giải pháp khắc phục và dự toán chi phí tham khảo tại Việt Nam (VND).
- Khuyên người dùng đặt lịch Gara bảo dưỡng nếu cần thiết.`;

      const candidateModels = Array.from(new Set([this.defaultModel, ...this.fallbackModels]));
      for (const modelName of candidateModels) {
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'ACOH Doctor AI',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
              ],
              temperature: 0.7,
            })
          });

          if (!response.ok) continue;
          const resData = await response.json();
          const reply = resData.choices?.[0]?.message?.content;
          if (reply) return reply;
        } catch (modelErr) {
          this.logger.warn(`Lỗi chatWithAI với model ${modelName}: ${modelErr?.message || modelErr}`);
        }
      }
      return null;
    } catch (err) {
      this.logger.error(`Lỗi OpenRouter chatWithAI: ${err?.message || err}`);
      return null;
    }
  }
}
