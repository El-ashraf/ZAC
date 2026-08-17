import mongoose from 'mongoose';

const AnimalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  scientificName: {
    type: String,
    required: true,
  },
  habitat: {
    type: String,
    required: true,
  },
  diet: {
    type: String,
    required: true,
  },
  characteristics: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    default: [],
  },
  conservationStatus: {
    type: String,
    enum: ['Least Concern', 'Near Threatened', 'Vulnerable', 'Endangered', 'Critically Endangered', 'Extinct in the Wild', 'Extinct', 'Data Deficient', 'Not Evaluated'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isAnimalOfTheWeek: {
    type: Boolean,
    default: false,
  },
  isDeepSea: {
    type: Boolean,
    default: false,
  },
  isExtinct: {
    type: Boolean,
    default: false,
  },
  extinctionYear: {
    type: String,
  },
  extinctionCause: {
    type: String,
  },
  category: {
    type: String,
    enum: ['Mammal', 'Reptile', 'Bird', 'Amphibian', 'Fish', 'Invertebrate'],
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.Animal || mongoose.model('Animal', AnimalSchema);
