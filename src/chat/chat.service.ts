import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid"; // Importação do UUID

interface UploadResponse {
  filename: string;
  signedUrl: string;
}

@Injectable()
export class ChatService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = this.configService.get<string>("ACCESS_KEY_ID");
    const secretAccessKey = this.configService.get<string>("SECRET_ACCESS_KEY");
    const region = this.configService.get<string>("AWS_CHAT_REGION");
    const bucket = this.configService.get<string>("AWS_CHAT_STORAGE_BUCKET");

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.bucket = bucket;
  }

  /**
   * Realiza o upload de um arquivo para o AWS S3 e retorna a resposta do upload junto com uma URL assinada.
   * @param file Arquivo a ser enviado, recebido via Multer.
   * @returns Promessa que resolve para um objeto contendo os dados do upload e a URL assinada.
   * @throws InternalServerErrorException se ocorrer um erro durante o upload.
   */
  async uploadFile(file: Express.Multer.File): Promise<UploadResponse> {
    const newFileName = this.generateFileName(file.originalname);

    const params: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: newFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentDisposition: `inline; filename="${newFileName}"`,
    };

    try {
      const putCommand = new PutObjectCommand(params);

      await this.s3Client.send(putCommand);

      const signedUrl = await this.getSignedUrlWithToken(newFileName);

      return {
        filename: newFileName,
        signedUrl,
      };
    } catch (error: unknown) {
      throw new InternalServerErrorException(
        `Falha ao fazer upload do arquivo: ${this.getErrorMessage(error)}`
      );
    }
  }

  /**
   * Gera um nome de arquivo único no formato YYYY-MM-DD-{uuid} preservando a extensão original.
   * @param originalName Nome original do arquivo.
   * @returns Nome de arquivo gerado.
   */
  private generateFileName(originalName: string): string {
    const timestamp = dayjs().format("YYYY-MM-DD");
    const uuid = uuidv4();
    const extension = originalName.split(".").pop()?.toLowerCase() || "file";

    return `${timestamp}-${uuid}.${extension}`;
  }

  /**
   * Obtém uma URL assinada para acessar o arquivo no S3, adicionando um token de segurança.
   * @param key Chave do arquivo no S3.
   * @returns Promessa que resolve para a URL assinada com token.
   */
  private async getSignedUrlWithToken(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });

      return url;
    } catch (err) {
      throw new InternalServerErrorException(
        "Não foi possível gerar a URL assinada."
      );
    }
  }

  /**
   * Extrai a mensagem de erro de um objeto de erro.
   * @param error Objeto de erro.
   * @returns Mensagem de erro.
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return "Erro desconhecido.";
  }
}
