import { prisma } from "~/db.server";
import invariant from "tiny-invariant";
import {
  findSchemaById,
  generateSpecFromSchemaScopedToOperation,
} from "./apiSchema.server";
import { generateFilesForSchema } from "./generator.server";
import { OpenAPIV3_1 } from "openapi-types";

export async function findReleaseById(releaseId: string) {
  return prisma.release.findFirst({
    where: {
      id: releaseId,
    },
  });
}

export async function findReleasesBySchemaId(schemaId: string) {
  return prisma.release.findMany({
    where: {
      schemaId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function releaseSchema(
  schemaId: string,
  releaseOptions: { version: string; message: string; isPrerelease: boolean }
) {
  const { version, message, isPrerelease } = releaseOptions;
  const result = await generateFilesForSchema(schemaId, version);

  if (!result) {
    throw new Error(`Could not generate files for schema ${schemaId}`);
  }

  const { files, mappings } = result;

  const schema = await findSchemaById(schemaId);

  if (!schema) {
    throw new Error(`Could not find schema ${schemaId}`);
  }

  const { gitRef, tagRef, commit } = await publishCommitOnGitHub(
    schema.integration.slug,
    "main",
    message,
    files,
    version
  );

  const githubRelease = await createReleaseOnGitHub(
    schema.integration.slug,
    version,
    message,
    isPrerelease
  );

  for (const [operationId, operationMappings] of Object.entries(mappings)) {
    await prisma.apiSchemaOperation.update({
      where: {
        schemaId_operationId: {
          schemaId,
          operationId,
        },
      },
      data: {
        mappings: operationMappings,
      },
    });
  }

  await prisma.integration.update({
    where: { id: schema.integration.id },
    data: {
      currentSchemaId: schema.id,
    },
  });

  const release = await prisma.release.create({
    data: {
      version,
      message,
      isPrerelease,
      gitRef,
      tagRef,
      commit,
      releaseData: githubRelease,
      schemaId: schema.id,
      integrationId: schema.integration.id,
    },
  });

  await createGatewayRelease({
    integrationSlug: schema.integration.slug,
    releaseId: release.id,
    version,
    message,
    isPrerelease,
  });

  await createGatewayOperations({
    schemaId: schema.id,
    integrationSlug: schema.integration.slug,
    releaseId: release.id,
    version,
    message,
    isPrerelease,
  });

  return release;
}

invariant(process.env.GITHUB_USERNAME, "GITHUB_USERNAME must be set");
invariant(process.env.GITHUB_TOKEN, "GITHUB_TOKEN must be set");

const GithubAuthorizationHeader = `Basic ${Buffer.from(
  process.env.GITHUB_USERNAME + ":" + process.env.GITHUB_TOKEN
).toString("base64")}`;
const GithubAcceptHeader = "application/vnd.github+json";

async function publishCommitOnGitHub(
  repo: string,
  branchName: string,
  message: string,
  files: Record<string, string>,
  version: string
) {
  const latestCommit = await getLatestCommit(repo, branchName);

  const commitTree = await createCommitTree(
    repo,
    latestCommit.sha,
    files,
    version
  );

  const commit = await createCommit(
    message,
    repo,
    commitTree,
    latestCommit.sha
  );

  const gitRef = await updateRef(repo, branchName, commit.sha);

  const tag = await createTag(repo, `v${version}`, commit.sha);

  const tagRef = await createRef(repo, `refs/tags/v${version}`, tag.sha);

  return { gitRef, tagRef, commit };
}

async function createReleaseOnGitHub(
  repo: string,
  version: string,
  message: string,
  isPrerelease: boolean
) {
  const response = await fetch(
    `https://api.github.com/repos/apihero-run/${repo}/releases`,
    {
      method: "POST",
      headers: {
        Authorization: GithubAuthorizationHeader,
        Accept: GithubAcceptHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tag_name: `v${version}`,
        name: `Release v${version}`,
        body: message,
        prerelease: isPrerelease,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Could not create release for ${repo}`);
  }

  const release = await response.json();

  return release;
}

async function createTag(repo: string, tagName: string, sha: string) {
  const response = await fetch(
    `https://api.github.com/repos/apihero-run/${repo}/git/tags`,
    {
      method: "POST",
      headers: {
        Authorization: GithubAuthorizationHeader,
        Accept: GithubAcceptHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tag: tagName,
        message: `Release ${tagName}`,
        object: sha,
        type: "commit",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Could not create tag for ${repo}`);
  }

  const tag = await response.json();

  console.log(`Successfully created a tag for ${repo}: ${tag.sha}`);

  return tag;
}

async function createRef(repo: string, fullyQualifiedRef: string, sha: string) {
  const response = await fetch(
    `https://api.github.com/repos/apihero-run/${repo}/git/refs`,
    {
      method: "POST",
      headers: {
        Authorization: GithubAuthorizationHeader,
        Accept: GithubAcceptHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: fullyQualifiedRef,
        sha,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Could not create ref ${fullyQualifiedRef} for ${repo}`);
  }

  const ref = await response.json();

  return ref;
}

async function updateRef(repo: string, branchName: string, sha: string) {
  const response = await fetch(
    `https://api.github.com/repos/apihero-run/${repo}/git/refs/heads/${branchName}`,
    {
      method: "PATCH",
      headers: {
        Authorization: GithubAuthorizationHeader,
        Accept: GithubAcceptHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sha,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Could not update ref for ${repo}`);
  }

  const gitRef = await response.json();

  return gitRef;
}

async function getLatestCommit(repo: string, branchName: string) {
  const response = await fetch(
    `https://api.github.com/repos/apihero-run/${repo}/branches/${branchName}`,
    {
      headers: {
        Authorization: GithubAuthorizationHeader,
        Accept: GithubAcceptHeader,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Could not get latest commit for ${repo}/${branchName}`);
  }

  const { commit } = await response.json();

  return commit as { sha: string };
}

async function createCommitTree(
  repo: string,
  baseTree: string,
  files: Record<string, string>,
  version: string
) {
  const body = {
    base_tree: baseTree,
    tree: [] as Array<{
      path: string;
      mode: string;
      type: string;
      content: string;
    }>,
  };

  for (const [fileName, fileContents] of Object.entries(files)) {
    body.tree.push({
      path: `src/${fileName}`,
      mode: "100644",
      type: "blob",
      content: fileContents,
    });
  }

  const packageJson = await getPackageJson(repo);
  packageJson.version = version;

  body.tree.push({
    path: "package.json",
    mode: "100644",
    type: "blob",
    content: JSON.stringify(packageJson, null, 2),
  });

  const response = await fetch(
    `https://api.github.com/repos/apihero-run/${repo}/git/trees`,
    {
      method: "POST",
      headers: {
        Authorization: GithubAuthorizationHeader,
        Accept: GithubAcceptHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error(`Could not create commit tree for ${repo}`);
  }

  const { sha } = await response.json();

  console.log(`Successfully created a commit tree for ${repo}: ${sha}`);

  return sha;
}

async function getPackageJson(repo: string) {
  const response = await fetch(
    `https://api.github.com/repos/apihero-run/${repo}/contents/package.json`,
    {
      headers: {
        Authorization: GithubAuthorizationHeader,
        Accept: GithubAcceptHeader,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Could not get package.json for ${repo}`);
  }

  const { content } = await response.json();

  const packageJsonRaw = Buffer.from(content, "base64").toString();

  return JSON.parse(packageJsonRaw);
}

async function createCommit(
  message: string,
  repo: string,
  tree: string,
  parent: string
) {
  const response = await fetch(
    `https://api.github.com/repos/apihero-run/${repo}/git/commits`,
    {
      method: "POST",
      headers: {
        Authorization: GithubAuthorizationHeader,
        Accept: GithubAcceptHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        tree,
        parents: [parent],
      }),
    }
  );

  if (!response.ok) {
    console.log(`Could not create commit for ${repo}: ${response.status}`);

    throw new Error(`Could not create commit for ${repo}`);
  }

  const commit = await response.json();

  return commit;
}

async function createFileBlob(
  repo: string,
  fileName: string,
  fileContent: string
) {
  const response = await fetch(
    `https://api.github.com/repos/apihero-run/${repo}/git/blobs`,
    {
      method: "POST",
      headers: {
        Authorization: GithubAuthorizationHeader,
        Accept: GithubAcceptHeader,
      },
      body: JSON.stringify({
        content: fileContent,
        encoding: "utf-8",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Could not create blob for ${repo}/${fileName}`);
  }

  const { sha } = await response.json();

  return sha;
}

async function createGatewayRelease({
  integrationSlug,
  releaseId,
  version,
  message,
  isPrerelease,
}: {
  integrationSlug: string;
  releaseId: string;
  version: string;
  message: string;
  isPrerelease: boolean;
}) {
  const gatewayRelease = await fetch(
    `${process.env.GATEWAY_ORIGIN}/admin/api/${integrationSlug}/release/${releaseId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        Authorization: `Bearer ${process.env.GATEWAY_API_PRIVATE_KEY}`,
      },
      body: JSON.stringify({
        version: version,
        message: message,
        preRelease: isPrerelease,
      }),
    }
  );

  if (!gatewayRelease.ok) {
    throw new Error(
      `Gateway: creating release failed: ${gatewayRelease.status} ${gatewayRelease.statusText}`
    );
  }

  const body = await gatewayRelease.json();
  console.log(`Gateway: created release ${JSON.stringify(body)}`);
}

async function createGatewayOperations({
  schemaId,
  integrationSlug,
  releaseId,
  version,
  message,
  isPrerelease,
}: {
  schemaId: string;
  integrationSlug: string;
  releaseId: string;
  version: string;
  message: string;
  isPrerelease: boolean;
}) {
  const operationsInfo = await prisma.apiSchemaOperation.findMany({
    where: {
      schemaId: schemaId,
    },
    select: {
      operationId: true,
      id: true,
    },
  });

  let uploaded = 0;

  for (const operationInfo of operationsInfo) {
    try {
      const spec = await generateSpecFromSchemaScopedToOperation(
        schemaId,
        operationInfo.id
      );

      if (spec === undefined) {
        throw new Error(
          `Could not generate spec for operation ${operationInfo.operationId}: ${operationInfo.id}`
        );
      }

      console.log(
        `${uploaded + 1}/${
          operationsInfo.length
        } generated spec for operation ${operationInfo.operationId}: ${
          operationInfo.id
        }`
      );

      const gatewayResponse = await fetch(
        `${process.env.GATEWAY_ORIGIN}/admin/api/${integrationSlug}/release/${version}/operation/${operationInfo.operationId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${process.env.GATEWAY_API_PRIVATE_KEY}`,
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          body: JSON.stringify({
            release: {
              version,
              message,
              preRelease: isPrerelease,
              id: releaseId,
              integrationSlug,
            },
            spec: spec,
          }),
        }
      );

      const body = await gatewayResponse.json();

      if (!gatewayResponse.ok) {
        throw new Error(
          `Gateway: creating release failed: ${gatewayResponse.status} ${
            gatewayResponse.statusText
          } ${JSON.stringify(body)}`
        );
      }

      console.log(
        `${uploaded + 1}/${operationsInfo.length} uploaded to gateway ${
          operationInfo.operationId
        }: ${operationInfo.id}`
      );

      uploaded += 1;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  console.log(
    `Gateway successfully uploaded ${operationsInfo.length} operations`
  );
}
