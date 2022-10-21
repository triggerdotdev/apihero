UPDATE "Workspace" SET slug = lower(slug);
UPDATE "Workspace" SET slug = regexp_replace(slug, '[^[:alpha:]]', '', 'g');

UPDATE "Project" SET slug = lower(slug);
UPDATE "Project" SET slug = regexp_replace(slug, '[^[:alpha:]]', '', 'g');