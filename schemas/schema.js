
const { buildSchema } = require('graphql');
const { DateTimeResolver, JSONObjectResolver } = require('graphql-scalars');


// GraphQL schema
const schemaString = `
  scalar Date
  scalar JSON

  type Product {
    productId: ID!
    name: String!
    description: String
    price: Int!
    variants: [Variant!]!
  }

  type Variant {
    variantId: ID!
    color: String!
    size: String!
    inventory_quantity: Int!
  }

  type Customer {
    customerId: ID!
    name: String!
    email: String!
    address: String
    orders: [Order!]!
  }

  type Seller {
    sellerId: ID!
    name: String!
    email: String!
  }

  type Order {
    orderId: ID!
    orderDate: Date!
    customer: Customer!
    products: [OrderProductVariant!]!
  }

  type OrderProductVariant {
    productId: ID!
    variantId: ID!
    quantity: Int!
  }

  input ProductInput {
    name: String!
    description: String
    price: Int!
  }

  input VariantInput {
    color: String!
    size: String!
    inventory_quantity: Int!
  }

  input OrderProductVariantInput {
    productId: ID!
    variantId: ID!
    quantity: Int!
  }

  input CustomerInput {
    name: String!
    email: String!
    address: String
  }

  input SellerInput {
    name: String!
    email: String!
  }

  type Mutation {
    addCustomer(input: CustomerInput!): Customer
    addSeller(input:SellerInput!): Seller

    createProduct(input: ProductInput!): Product
    updateProduct(productId: ID!, input: ProductInput!): Product
    deleteProduct(productId: ID!): ID

    createVariant(productId: ID!, input: VariantInput!): Variant
    updateVariant(variantId: ID!, input: VariantInput!): Variant
    deleteVariant(variantId: ID!): ID

    createOrder(customerId: ID!, products: [OrderProductVariantInput!]!): Order
    cancelOrder(orderId: ID!): ID
  }

  type Query {
    getProduct(productId: ID!): Product
    getCustomer(customerId: ID!): Customer
    getSeller(sellerId: ID!): Seller
    getOrder(orderId: ID!): Order
  }
`;

const schema = buildSchema(schemaString) ;

// Mock data (for simplicity)
const products = [] ;
const variants = [];
const customers = [];
const sellers = [];
const orders = [] ;

// GraphQL resolvers
const resolvers = {
  Date: DateTimeResolver,
  JSON: JSONObjectResolver,

  // Query resolvers

  getProduct: ({ productId }) => products.find((product) => product.productId === productId),
  getCustomer: ({ customerId }) => customers.find((customer) => customer.customerId === customerId),
  getSeller: ({ sellerId }) => sellers.find((seller) => seller.sellerId === sellerId),
  getOrder: ({ orderId }) => orders.find((order) => order.orderId === orderId),

  // Mutation resolvers
 
  addCustomer: ({input}) =>{
       const newCustomer = {customerId: String(customers.length + 1), ...input} ;
       customers.push(newCustomer);
       return newCustomer ;
  },

  addSeller: ({input}) =>{
    const newSeller = {sellerId: String(sellers.length + 1), ...input} ;
    customers.push(newSeller);
    return newSeller ;
},

  createProduct: ({ input }) => {
    const newProduct = { productId: String(products.length + 1), ...input };
    products.push(newProduct);
    return newProduct;
  },

  updateProduct: ({ productId, input }) => {
    const productIndex = products.findIndex((product) => product.productId === productId);
    if (productIndex !== -1) {
      products[productIndex] = { ...products[productIndex], ...input };
      return products[productIndex];
    }
    return null; // Product not found
  },

  deleteProduct: ({ productId }) => {
    const productIndex = products.findIndex((product) => product.productId === productId);
    if (productIndex !== -1) {
      products.splice(productIndex, 1);
      return productId;
    }
    return null; // Product not found
  },

  createVariant: ({ productId, input }) => {
    const product = products.find((p) => p.productId === productId);
    if (product) {
      const newVariant = { variantId: String(variants.length + 1), ...input };
      variants.push(newVariant);
      return newVariant;
    }
    return null; // Product not found
  },

  updateVariant: ({ variantId, input }) => {
    const variantIndex = variants.findIndex((variant) => variant.variantId === variantId);
    if (variantIndex !== -1) {
      variants[variantIndex] = { ...variants[variantIndex], ...input };
      return variants[variantIndex];
    }
    return null; // Variant not found
  },

  deleteVariant: ({ variantId }) => {
    const variantIndex = variants.findIndex((variant) => variant.variantId === variantId);
    if (variantIndex !== -1) {
      variants.splice(variantIndex, 1);
      return variantId;
    }
    return null; // Variant not found
  },

  createOrder: ({ customerId, products: orderProducts }) => {
    const customer = customers.find((c) => c.customerId === customerId);
    if (customer) {
      const newOrder = {
        orderId: String(orders.length + 1),
        orderDate: new Date().toISOString(),
        customer,
        products: orderProducts.map(({ productId, variantId, quantity }) => ({
          productId,
          variantId,
          quantity,
        })),
      };

      // Update inventory quantity for ordered products
      newOrder.products.forEach(({ productId, variantId, quantity }) => {
        const variant = variants.find((v) => v.productId === productId && v.variantId === variantId);
        if (variant) {
          variant.inventory_quantity -= quantity;
        }
      });

      orders.push(newOrder);
      return newOrder;
    }
    return null; // Customer not found
  },
 
  cancelOrder: ({ orderId }) => {
    const orderIndex = orders.findIndex((order) => order.orderId === orderId);
    if (orderIndex !== -1) {
      const canceledOrder = orders.splice(orderIndex, 1)[0];

      // Restore inventory quantity for canceled order products
      canceledOrder.products.forEach(({ productId, variantId, quantity }) => {
        const variant = variants.find((v) => v.productId === productId && v.variantId === variantId);
        if (variant) {
          variant.inventory_quantity += quantity;
        }
      });

      return orderId;
    }
    return null; // Order not found
  },
};

module.exports = { schema, resolvers };
