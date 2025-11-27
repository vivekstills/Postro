import { motion, type Transition, type Variants } from 'framer-motion';
import clsx from 'clsx';
import type { FC } from 'react';
import type { Product } from '../types';
import StockBadge from './StockBadge';
import { useToast } from './ToastProvider';
import { formatCurrency } from '../utils/currency';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

const cardVariants: Variants = {
  rest: { x: 0, y: 0, boxShadow: '4px 4px 0px 0px #0D0D0D' },
  hover: { x: -4, y: -4, boxShadow: '8px 8px 0px 0px #0D0D0D' },
  tap: { x: 0, y: 0, boxShadow: '0px 0px 0px 0px #0D0D0D' },
};

const mediaVariants: Variants = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.1, rotate: -1 },
  tap: { scale: 1.05, rotate: -0.5 },
};

const buttonVariants: Variants = {
  rest: { x: 0, y: 0, boxShadow: 'none' },
  hover: { x: -2, y: -2, boxShadow: '4px 4px 0px 0px #0D0D0D' },
  tap: { x: 0, y: 0, boxShadow: '0px 0px 0px 0px #0D0D0D' },
};

const springTransition: Transition = { type: 'spring', stiffness: 400, damping: 25 };

const ProductCard: FC<ProductCardProps> = ({ product, onSelect }) => {
  const isSoldOut = product.stock === 0;
  const { addToast } = useToast();
  const formattedPrice = formatCurrency(product.price);

  const handleClick = () => {
    if (isSoldOut) {
      addToast('SOLD OUT • TRY ANOTHER DROP');
      return;
    }

    onSelect(product);
  };

  const formattedTags = [product.type, product.category, product.subcategory].filter(Boolean) as string[];

  return (
    <motion.div
      className="group relative flex h-full flex-col overflow-hidden border-[3px] border-dark bg-surface"
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
      transition={springTransition}
    >
      <div className="relative overflow-hidden border-b-[3px] border-dark bg-dark/5">
        <motion.img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="aspect-[3/4] w-full object-cover"
          variants={mediaVariants}
          transition={springTransition}
        />
        <div className="absolute left-4 top-4">
          <StockBadge stock={product.stock} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.5em] text-dark/40">
          {product.type} DROP
        </p>
        <h3 className="font-display text-2xl font-black uppercase tracking-tight text-dark">
          {product.name}
        </h3>

        <div className="flex flex-wrap gap-2">
          {formattedTags.map((tag) => (
            <span
              key={tag}
              className="border-[3px] border-dark bg-main/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-dark shadow-hard"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-dark/10 pt-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-dark/50">Price</span>
          <span className="font-display text-2xl font-black text-dark">{formattedPrice}</span>
        </div>

        <motion.button
          type="button"
          onClick={handleClick}
          disabled={isSoldOut}
          className={clsx(
            'mt-auto w-full border-t-[3px] border-dark px-6 py-5 text-sm font-black uppercase tracking-[0.15em]',
            'flex items-center justify-between bg-transparent text-dark transition-all duration-200',
            !isSoldOut && 'hover:bg-primary hover:pl-8 hover:pr-4',
            isSoldOut && 'cursor-not-allowed bg-dark text-main opacity-70'
          )}
          variants={isSoldOut ? undefined : buttonVariants}
          transition={isSoldOut ? undefined : springTransition}
        >
          <span>{isSoldOut ? 'SOLD OUT' : 'ADD TO CART'}</span>
          <span className="text-2xl font-black">
            {isSoldOut ? '✕' : '+'}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
