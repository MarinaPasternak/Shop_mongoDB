export const ITEMS_PER_PAGE = 2;

export const getPaginatedProducts = async (page) => {
  const totalItems = await Product.countDocuments();

  const products = await Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);

  return {
    products,
    totalItems
  };
};