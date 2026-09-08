import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <Link href={`/products/${product.id}`} className="block">
      <article>
        <div className="aspect-[3/4] overflow-hidden bg-gray-100">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src =
                "https://placehold.co/600x800?text=No+Image";
            }}
          />
        </div>

        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">
              {product.category}
            </p>

            <h2 className="text-sm font-medium">
              {product.name}
            </h2>
          </div>

          <p className="text-sm">
            ${Number(product.price).toFixed(2)}
          </p>
        </div>
      </article>
    </Link>
  );
}