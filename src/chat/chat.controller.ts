import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ChatService } from "./chat.service";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("chat")
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
  ) {}

  @Post("/upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const allowedMimeTypes = [
      "text/plain",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "audio/mpeg",
      "audio/wav",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException("Tipo de arquivo não permitido");
    }

    const maxSize = 10 * 1024 * 1024; // 10MB em bytes
    if (file.size > maxSize) {
      throw new BadRequestException("Arquivo muito grande. O limite é de 10MB");
    }

    try {
      const result = await this.chatService.uploadFile(file);
      return {
        success: true,
        filename: result.filename,
        url: result.signedUrl,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        "Erro interno ao processar o upload do arquivo."
      );
    }
  }
}
