import { Schema, model, Types } from 'mongoose';

function onlyDigits(v?: string): string {
  return (v || '').replace(/\D+/g, '');
}

const ProviderSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  legalName: { 
    type: String, 
    trim: true 
  },
  documentType: { 
    type: String, 
    enum: ['CPF', 'CNPJ'], 
    required: true 
  },
  document: { 
    type: String, 
    required: true, 
    unique: true 
  },
  description: String,
  phone: String,
  whatsapp: String,
  email: String,
  website: String,
  instagram: String,
  rating: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 5 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  coverageArea: String,
  addressCity: String,
  addressState: String,
  addressZip: String,
  categoryIds: [{ 
    type: Types.ObjectId, 
    ref: 'Category', 
    index: true 
  }]
}, { timestamps: true });

// Índices
ProviderSchema.index({ document: 1 }, { unique: true });
ProviderSchema.index({ addressCity: 1 });
ProviderSchema.index({ isVerified: 1 });
ProviderSchema.index({ categoryIds: 1 });

// Hooks para normalizar document
ProviderSchema.pre('save', function(next) {
  if (this.document) {
    this.document = onlyDigits(this.document);
  }
  next();
});

ProviderSchema.pre('findOneAndUpdate', function(next) {
  const update: any = this.getUpdate() || {};
  if (update.document) {
    update.document = onlyDigits(update.document);
  }
  if (update.$set?.document) {
    update.$set.document = onlyDigits(update.$set.document);
  }
  this.setUpdate(update);
  next();
});

export default model('Provider', ProviderSchema);
