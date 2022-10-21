-- DropForeignKey
ALTER TABLE "ApiSchema" DROP CONSTRAINT "ApiSchema_integrationId_fkey";

-- DropForeignKey
ALTER TABLE "ApiSchemaRequestBodyContent" DROP CONSTRAINT "ApiSchemaRequestBodyContent_requestBodyId_fkey";

-- DropForeignKey
ALTER TABLE "ApiSchemaResponse" DROP CONSTRAINT "ApiSchemaResponse_operationId_fkey";

-- DropForeignKey
ALTER TABLE "ApiSchemaResponseBodyContent" DROP CONSTRAINT "ApiSchemaResponseBodyContent_responseId_fkey";

-- DropForeignKey
ALTER TABLE "ApiSchemaResponseHeader" DROP CONSTRAINT "ApiSchemaResponseHeader_responseId_fkey";

-- DropForeignKey
ALTER TABLE "ApiSchemaSecurityOAuthFlow" DROP CONSTRAINT "ApiSchemaSecurityOAuthFlow_securitySchemeId_fkey";

-- DropForeignKey
ALTER TABLE "ApiSchemaSecurityScope" DROP CONSTRAINT "ApiSchemaSecurityScope_securitySchemeId_fkey";

-- AddForeignKey
ALTER TABLE "ApiSchema" ADD CONSTRAINT "ApiSchema_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaSecurityOAuthFlow" ADD CONSTRAINT "ApiSchemaSecurityOAuthFlow_securitySchemeId_fkey" FOREIGN KEY ("securitySchemeId") REFERENCES "ApiSchemaSecurityScheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaSecurityScope" ADD CONSTRAINT "ApiSchemaSecurityScope_securitySchemeId_fkey" FOREIGN KEY ("securitySchemeId") REFERENCES "ApiSchemaSecurityScheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaResponse" ADD CONSTRAINT "ApiSchemaResponse_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "ApiSchemaOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaResponseHeader" ADD CONSTRAINT "ApiSchemaResponseHeader_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "ApiSchemaResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaResponseBodyContent" ADD CONSTRAINT "ApiSchemaResponseBodyContent_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "ApiSchemaResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchemaRequestBodyContent" ADD CONSTRAINT "ApiSchemaRequestBodyContent_requestBodyId_fkey" FOREIGN KEY ("requestBodyId") REFERENCES "ApiSchemaRequestBody"("id") ON DELETE CASCADE ON UPDATE CASCADE;
