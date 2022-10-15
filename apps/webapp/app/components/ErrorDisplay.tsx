export function ErrorDisplay({ errors }: { errors?: string[] }) {
  if (!errors) {
    return null;
  }

  return (
    <div className="mt-2 text-sm text-red-600">
      {errors?.map((error, index) => (
        <p key={index}>{error}</p>
      ))}
    </div>
  );
}