import { Schema, model, Types } from 'mongoose';

const CategorySchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    minlength: 2 
  },
  parentId: { 
    type: Types.ObjectId, 
    ref: 'Category', 
    required: false 
  }
}, { timestamps: true });

// Índices
CategorySchema.index({ name: 1 }, { unique: true });

export default model('Category', CategorySchema);
