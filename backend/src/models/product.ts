import mongoose, { Schema } from 'mongoose';

const ProductImageSchema = new Schema({
  fileName: {
    type: String,
    required: [true, 'Поле "fileName" должно быть заполнено'],
    trim: true,
  },
  originalName: {
    type: String,
    required: [true, 'Поле "originalName" должно быть заполнено'],
    trim: true,
  },
});

const productSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Поле "title" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "title" - 2 символа'],
    maxlength: [30, 'Максимальная длина поля "title" - 30 символов'],
    unique: true,
    trim: true,
  },
  image: {
    type: ProductImageSchema,
    required: [true, 'Поле "image" должно быть заполнено'],
  },
  category: {
    type: String,
    required: [true, 'Поле "category" должно быть заполнено'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    default: null,
    min: [0, 'Цена не может быть отрицательной'],
  },
}, {
  timestamps: true,
});

productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

const Product = mongoose.model('product', productSchema);

export default Product;
