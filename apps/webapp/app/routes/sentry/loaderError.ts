export async function loader({ params }: LoaderArgs) {
  throw new Error("Sentry Error");
}
