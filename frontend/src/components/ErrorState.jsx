export default function ErrorState({
  message = "Something went wrong.",
}) {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <p className="text-sm text-red-500">{message}</p>
    </div>
  );
}