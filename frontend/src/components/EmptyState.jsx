export default function EmptyState({ message = "No items found." }) {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}