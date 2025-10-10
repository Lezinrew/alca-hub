import { Schema, model, Types } from 'mongoose';

const ProviderMediaSchema = new Schema({
  providerId: { 
    type: Types.ObjectId, 
    ref: 'Provider', 
    required: true 
  },
  kind: { 
    type: String, 
    enum: ['photo', 'video', 'pdf', 'link'], 
    required: true 
  },
  url: { 
    type: String, 
    required: true 
  },
  caption: String
}, { timestamps: true });

// Índices
ProviderMediaSchema.index({ providerId: 1 });

export default model('ProviderMedia', ProviderMediaSchema);
