'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import styles from './page.module.css';

interface Props {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    stock: number;
    image?: string;
    category?: string;
  };
}

export default function AddToCartButton({ product }: Props) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  const inCart = items.find(i => i.id === product.id);
  const outOfStock = product.stock === 0;

  function handleAdd() {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity: qty,
      image: product.image,
      category: product.category,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (outOfStock) {
    return (
      <button className={styles.btnOutOfStock} disabled>
        Out of stock
      </button>
    );
  }

  return (
    <div className={styles.ctaGroup}>
      <div className={styles.qtyRow}>
        <button
          className={styles.qtyBtn}
          onClick={() => setQty(q => Math.max(1, q - 1))}
          aria-label="Decrease quantity"
        >−</button>
        <span className={styles.qtyNum}>{qty}</span>
        <button
          className={styles.qtyBtn}
          onClick={() => setQty(q => Math.min(product.stock, q + 1))}
          aria-label="Increase quantity"
        >+</button>
      </div>
      <button
        className={added ? styles.btnAdded : styles.btnAddToCart}
        onClick={handleAdd}
      >
        {added ? 'Added to cart ✓' : 'Add to cart'}
      </button>
      {inCart && (
        <Link href="/cart" className={styles.viewCartLink}>
          View cart ({inCart.quantity} in cart) →
        </Link>
      )}
    </div>
  );
}
