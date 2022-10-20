import { prisma } from "~/db.server";
import { z } from "zod";

export class UpdateIntegration {
  FormSchema = z.object({
    name: z.string().min(3).max(255),
    authorNotes: z.string(),
    description: z.string(),
    officialDocumentation: z.string().optional(),
    keywords: z.preprocess(
      (p) => (p as string).split(","),
      z.array(z.string().trim())
    ),
    logoImage: z.string().optional(),
  });

  async call(id: string, payload: Record<string, string | File>) {
    const validation = this.FormSchema.safeParse(payload);

    if (!validation.success) {
      return {
        status: "validationError" as const,
        data: validation.error.format(),
      };
    }

    const integration = await prisma.integration.update({
      where: { id },
      data: validation.data,
    });

    return {
      status: "success" as const,
      data: integration,
    };
  }
}
