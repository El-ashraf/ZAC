import mongoose from 'mongoose';

const FactSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.Fact || mongoose.model('Fact', FactSchema);
